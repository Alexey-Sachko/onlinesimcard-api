import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import bcrypt from 'bcryptjs';
import cryptoRandomString from 'crypto-random-string';
import dotenv from 'dotenv';
import { User } from './user.entity';
import { UserSignupDto } from './dto/user-signup.dto';
import { EmailClient } from '../common/email.client';
import { VerifyToken } from './verify-token.entity';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permissions } from './permissions.enum';
import { UpdateRoleDto } from './dto/update-role.dto';

dotenv.config();

const ROOT_ADMIN_ROLE = 'root_admin';
const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL;
const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD;
@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(VerifyToken)
    private verifyTokensRepository: Repository<VerifyToken>,

    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,

    @InjectConnection()
    private connection: Connection,
    private emailClient: EmailClient,
  ) {
    this.initRootUser();
  }

  private async initRootUserRole() {
    const roleExists = await this.rolesRepository.findOne({
      name: ROOT_ADMIN_ROLE,
    });
    if (roleExists) {
      return roleExists;
    }
    const role = new Role();
    role.permissions = Object.values(Permissions); // Все разрешения для ROOT_ADMIN_ROLE
    role.name = ROOT_ADMIN_ROLE;
    await role.save();
    return role;
  }

  private async initRootUser() {
    try {
      this.logger.verbose('Creating root user');
      const userExists = await this.usersRepository.findOne({
        email: ROOT_ADMIN_EMAIL,
      });
      if (userExists) {
        this.logger.verbose('Root user already exists');
        return;
      }
      const role = await this.initRootUserRole();
      await this.createUser(
        {
          email: ROOT_ADMIN_EMAIL,
          password: ROOT_ADMIN_PASSWORD,
        },
        role,
      );
      this.logger.verbose('Root user has been created');
    } catch (error) {
      this.logger.error(
        `Failed to create root user\nError name: ${error.name}\nmessage: ${error.message}\ncode: ${error.code}`,
        error.stack,
      );
    }
  }

  async getRoles() {
    return this.rolesRepository.find();
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto;
    const role = new Role();
    role.name = name;
    role.permissions = permissions;
    await role.save();
  }

  async updateRole(updateRoleDto: UpdateRoleDto) {
    const { id } = updateRoleDto;
    const found = await this.rolesRepository.findOne({ id });
    if (!found) {
      throw new NotFoundException(`Не найдено роли с id '${id}'`);
    }

    return await this.rolesRepository.save(updateRoleDto);
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({ email }, { relations: ['role'] });
  }

  async createUser(userSignupDto: UserSignupDto, role?: Role) {
    const { email, password } = userSignupDto;
    const user = new User();
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.verified = false;
    if (role) {
      user.role = role;
    }
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
    const user = await this.usersRepository.findOne(
      {
        email,
      },
      { relations: ['role'] },
    );
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async testSendEmail(to: string, token: string) {
    return this.sendVerificationEmail(to, token);
  }

  async getUserRole(user: User) {
    return user.role;
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
