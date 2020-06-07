import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as cryptoRandomString from 'crypto-random-string';
import { User } from './user.entity';
import { UserSignupDto } from './dto/user-signup.dto';
import { EmailClient } from '../common/email.client';
import { VerifyToken } from './verify-token.entity';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(VerifyToken)
    private verifyTokensRepository: Repository<VerifyToken>,

    @InjectConnection()
    private connection: Connection,

    private emailClient: EmailClient,
  ) {}

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({ email });
  }

  async createUser(userSignupDto: UserSignupDto) {
    const { email, password } = userSignupDto;
    const user = new User();
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.verified = false;
    try {
      await user.save();
      this.createVerifyToken(user);
    } catch (error) {
      // duplicate username
      if (error.code === '23505') {
        throw new ConflictException('User already exists');
      } else {
        throw error;
      }
    }
  }

  async deleteUser(id: string) {
    const rows = await this.usersRepository.delete({ id });
    if (!rows.affected) {
      throw new NotFoundException(`Не найдено пользователя с id: "${id}"`);
    }
  }

  async verifyUser(tokenString: string) {
    const token = await this.verifyTokensRepository.findOne(
      {
        token: tokenString,
      },
      { relations: ['user'] },
    );
    if (!token) {
      throw new NotFoundException('Ссылка недействительна');
    }
    if (!token.user) {
      throw new NotFoundException('Учетная запись не существует');
    }
    token.user.verified = true;
    await token.user.save();
    const rows = await this.verifyTokensRepository.delete({ id: token.id });
    if (!rows.affected) {
      throw new InternalServerErrorException();
    }
  }

  async validatePassword(authCredentialsDto: AuthCredentialsDto) {
    const { email, password } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ email });
    if (user && (await user.validatePassword(password))) {
      return user.email;
    }
    return null;
  }

  async testSendEmail(to: string, token: string) {
    return this.sendVerificationEmail(to, token);
  }

  private async createVerifyToken(user: User) {
    const token = new VerifyToken();
    token.token = cryptoRandomString({ length: 20 });
    token.user = user;
    await this.connection.transaction(async entityManager => {
      await entityManager.save(token);
      await this.sendVerificationEmail(user.email, token.token);
    });
    return token;
  }

  private async sendVerificationEmail(to: string, token: string) {
    const link = `http://localhost:4500/users/verify/${token}`;
    return this.emailClient.sendEmail({
      to,
      from: {
        email: 'info@onlinesimcard.ru',
        name: 'Onlinesimcard.ru',
      },
      subject: 'Добро пожаловть в Onlinesimcard! Подтвердите свой Email',
      html: `<p>Здравствуйте</p>
      <p>Для завершения регистрации перейдите по ссылке - <a href="${link}">${link}</a></p>`,
    });
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}