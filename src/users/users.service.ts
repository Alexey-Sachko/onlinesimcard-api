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
import moment from 'moment';
import { Response } from 'express';

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
import { ResetPassInput } from './reset-pass/reset-pass.input';
import { ResetPassToken } from './reset-pass/reset-pass-token.entity';
import { ResetPassConfirmInput } from './reset-pass/reset-pass-confirm.input';
import { ResetPassResponse } from './types/reset-pass-response';
import { AuthService } from './auth.service';
import { deleteAuthCookies } from './auth.delete-cookies';
import { BalanceService } from 'src/balance/balance.service';
import { UserType } from './types/user.type';
import { UsersStat } from './types/users-stat.type';

dotenv.config();

const ROOT_ADMIN_ROLE = 'root_admin';
const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL;
const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD;
@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    private readonly _authService: AuthService,

    private readonly _balanceService: BalanceService,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(VerifyToken)
    private verifyTokensRepository: Repository<VerifyToken>,

    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,

    @InjectRepository(AuthProvider)
    private _authProviderReposirory: Repository<AuthProvider>,

    @InjectRepository(ResetPassToken)
    private _resetPassTokenRepository: Repository<ResetPassToken>,

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
      role.permissions = Object.values(Permissions);
      await role.save();
    } else {
      this.logger.verbose(`Role: "${ROOT_ADMIN_ROLE}" already exists`);
    }

    await this.rolesRepository.update(role.id, {
      permissions: Object.values(Permissions),
    });

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

  async getDisplayUsers(): Promise<UserType[]> {
    const users = await this.usersRepository.find({
      relations: ['role'],
    });

    return Promise.all(
      users.map(async user => {
        const balance = await this._balanceService.getDisplayUserBalance(user);
        return { ...user, balance };
      }),
    );
  }

  async getUsersStat(): Promise<UsersStat> {
    const displayUsers = await this.getDisplayUsers();
    const totalBalance = displayUsers.reduce(
      (acc, item) => acc + item.balance,
      0,
    );
    return { totalBalance, usersCount: displayUsers.length };
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

  async verifyUser(tokenString: string): Promise<ErrorType | User> {
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

    return token.user;
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

  async resetPassword({ email }: ResetPassInput): Promise<ResetPassResponse> {
    const oldToken = await this._resetPassTokenRepository.findOne({
      where: {
        email,
      },
    });

    if (oldToken) {
      const accessAgainTime = moment(oldToken.createdAt)
        .utc()
        .add(5, 'minutes');

      if (moment().isBefore(accessAgainTime)) {
        return {
          error: createError(
            'WAIT_TIMEOUT_TO_CREATE_AGAIN',
            accessAgainTime.toISOString(),
          ),
        };
      }
    }

    // Удаляем старые токены
    await this._resetPassTokenRepository.delete({ email }); // TODO - возможна проблема когда люди будут вбивать email других юзеров

    const resetPassToken = new ResetPassToken();
    resetPassToken.email = email;
    resetPassToken.expiresAt = moment()
      .add(1, 'h')
      .toDate();

    await resetPassToken.save();

    const user = await this.usersRepository.findOne({ email });
    const newAccessAgainDate = moment()
      .utc()
      .add(5, 'minutes')
      .toDate();
    if (!user) {
      await this._sendResetPasswordNotFoundUserEmail(email);
      return {
        accessAgain: newAccessAgainDate,
      };
    }

    await this._sendResetPasswordEmail(email, resetPassToken.id);
    return { accessAgain: newAccessAgainDate };
  }

  async resetPasswordConfirm(
    { tokenId, newPassword }: ResetPassConfirmInput,
    res: Response,
  ): Promise<ErrorType | null> {
    const token = await this._resetPassTokenRepository.findOne(tokenId);
    const error = createError('tokenId', 'Token is invalid or expired');
    if (!token) {
      return error;
    }

    if (moment().isAfter(moment(token.expiresAt))) {
      return error;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await this.hashPassword(newPassword, salt);

    await this.usersRepository.update(
      { email: token.email },
      { salt, password: hashedPassword },
    );

    const user = await this.usersRepository.findOne({ email: token.email });
    if (user) {
      deleteAuthCookies(res);
      await this._authService.deleteAllUserRefreshTokens(user);
    }

    token.remove(); // без await чтобы при возникновении ошибки удаления у юзера не вылетала ошибка, т.к. он уже поменял пароль
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
      html: `<p>Здравствуйте!</p>
      <p>Для завершения регистрации перейдите по ссылке - <a href="${link}">${link}</a></p>`,
    });
  }

  private async _sendResetPasswordEmail(to: string, token: string) {
    const link = `${process.env.RESET_PASSWORD_BASE_URL}/${token}`;
    return this.emailClient.sendEmail({
      to,
      from: {
        email: mailConfig.mailFromAdress,
        name: mailConfig.mailFromName,
      },
      subject: 'Восстановление Вашего пароля Virtualnum',
      html: `<p>Здравствуйте!</p>
      <p>Мы получили запрос о восстановлении пароля в Вашей учетной записи.</p>
      <p>Если Вы не отправляли запрос о восстановлении пароля, Вы можете проигнорировать это сообщение, и Ваша учетная запись не будет изменена.</p>
      Чтобы восстановить Ваш пароль, нажмите на ссылку внизу:</p>
      <p><a href="${link}">${link}</a></p>
      <p>ПРИМЕЧАНИЕ! Ссылка активна только в течение одного часа.</p>
      <p>С уважением, служба поддержки клиентов Virtualnum</p>`,
    });
  }

  private async _sendResetPasswordNotFoundUserEmail(to: string) {
    return this.emailClient.sendEmail({
      to,
      from: {
        email: mailConfig.mailFromAdress,
        name: mailConfig.mailFromName,
      },
      subject: 'Восстановление Вашего пароля Virtualnum',
      html: `<p>Здравствуйте!</p>
      <p>Мы получили запрос о восстановлении пароля в учетной записи с вашим email.</p>
      <p>К сожалению пользователь с такой почтой ещё не зарегистрирован на нашем сайте.</p>
      <p>С уважением, служба поддержки клиентов Virtualnum</p>`,
    });
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
