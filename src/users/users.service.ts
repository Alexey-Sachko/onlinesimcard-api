import {
  Injectable,
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
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permissions } from './permissions.enum';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RegisterPayloadType } from './types/register-payload.type';
import { createError } from 'src/common/errors/create-error';
import { AuthProviderType } from './auth-provider-type.enum';
import { AuthProvider } from './auth-provider.entity';
import { ErrorType } from 'src/common/errors/error.type';
import { mailConfig } from 'src/config/mail';

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

    @InjectRepository(AuthProvider)
    private _authProviderReposirory: Repository<AuthProvider>,

    @InjectConnection()
    private connection: Connection,
    private emailClient: EmailClient,
  ) {
    this.initData();
  }

  private async initData() {
    const role = await this.initRootUserRole();
    await this.initRootUser(role);
  }

  private async initRootUserRole() {
    this.logger.verbose(`Finding Role: "${ROOT_ADMIN_ROLE}"`);
    let role = await this.rolesRepository.findOne({
      name: ROOT_ADMIN_ROLE,
    });
    if (!role) {
      this.logger.verbose(`Role: "${ROOT_ADMIN_ROLE}" does not exist yet`);
      role = new Role();
      role.name = ROOT_ADMIN_ROLE;
    } else {
      this.logger.verbose(`Role: "${ROOT_ADMIN_ROLE}" already exists`);
    }
    role.permissions = Object.values(Permissions); // Все разрешения для ROOT_ADMIN_ROLE
    await role.save();
    this.logger.verbose(
      `Role: "${ROOT_ADMIN_ROLE}" was saved with fresh permissions`,
    );
    return role;
  }

  private async initRootUser(role: Role) {
    try {
      this.logger.verbose('Creating root user');
      const userExists = await this.usersRepository.findOne({
        email: ROOT_ADMIN_EMAIL,
      });
      if (userExists) {
        this.logger.verbose('Root user already exists');
        return;
      }
      await this.createUser(
        {
          email: ROOT_ADMIN_EMAIL,
          password: ROOT_ADMIN_PASSWORD,
        },
        role,
        true,
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

  async getUsers(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: ['role'],
    });
    return users;
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { name, permissions } = createRoleDto;
    const role = new Role();
    role.name = name;
    role.permissions = permissions;
    await role.save();
  }

  async setRole(userId: string, roleName: string): Promise<ErrorType[] | null> {
    const errors: ErrorType[] = [];
    const userFound = await this.usersRepository.findOne(userId);
    if (!userFound) {
      errors.push(createError('userId', 'Пользователь не найден'));
    }

    const roleFound = await this.rolesRepository.findOne({
      where: { name: roleName },
    });
    if (!roleFound) {
      errors.push(
        createError('roleName', `Нет роли с roleName: '${roleName}'`),
      );
    }
    if (errors.length > 0) {
      return errors;
    }

    userFound.role = roleFound;
    await userFound.save();
    return null;
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

  async getUserById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne(id, {
      relations: ['role'],
    });
    return user || null;
  }

  async createUser(
    userSignupDto: UserSignupDto,
    role?: Role,
    verified?: boolean,
  ): Promise<RegisterPayloadType> {
    const { email, password } = userSignupDto;
    const userWithEmailExists = await this.usersRepository.findOne({ email });
    if (userWithEmailExists) {
      return {
        errors: [
          createError(
            'email',
            `Пользователь с email: '${email}' уже сущетвует`,
          ),
        ],
      };
    }

    const user = new User();
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    user.verified = verified || false;
    if (role) {
      user.role = role;
    }

    await user.save();
    if (!verified) {
      await this.createVerifyToken(user);
    }

    return {
      result: true,
    };
  }

  async createOrGegAuthProvider(
    key: string,
    authProviderType: AuthProviderType,
    firstName?: string,
    lastName?: string,
  ): Promise<AuthProvider> {
    const foundAuthProvider = await this._authProviderReposirory.findOne(
      {
        key,
        type: authProviderType,
      },
      { relations: ['user'] },
    );
    if (foundAuthProvider) {
      return foundAuthProvider;
    }

    const user = new User();
    user.fistName = firstName;
    user.lastName = lastName;
    user.verified = true;
    await user.save();

    const authProvider = new AuthProvider();
    authProvider.key = key;
    authProvider.type = authProviderType;
    authProvider.user = user;

    await authProvider.save();
    return authProvider;
  }

  async deleteUser(id: string): Promise<ErrorType | null> {
    const rows = await this.usersRepository.delete({ id });
    if (!rows.affected) {
      return createError('id', `Не найдено пользователя с id: "${id}"`);
    }
    return null;
  }

  async verifyUser(tokenString: string): Promise<ErrorType | null> {
    const token = await this.verifyTokensRepository.findOne(
      {
        token: tokenString,
      },
      { relations: ['user'] },
    );
    if (!token) {
      return createError('verifyToken', 'Ссылка недействительна');
    }
    if (!token.user) {
      return createError(
        'email',
        'Учетная запись не существует или была удалена администратором за нарушение правил',
      );
    }
    token.user.verified = true;
    await token.user.save();
    const rows = await this.verifyTokensRepository.delete({ id: token.id });
    if (!rows.affected) {
      throw new InternalServerErrorException();
    }

    return null;
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
    const link = `${process.env.VERIFICATION_EMAIL_BASE_URL}/${token}`;
    return this.emailClient.sendEmail({
      to,
      from: {
        email: mailConfig.mailFromAdress,
        name: mailConfig.mailFromName,
      },
      subject: 'Добро пожаловть в Virtualnum! Подтвердите свой Email',
      html: `<p>Здравствуйте</p>
      <p>Для завершения регистрации перейдите по ссылке - <a href="${link}">${link}</a></p>`,
    });
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
