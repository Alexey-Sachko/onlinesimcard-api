import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { RegisterPayloadType } from './types/register-payload.type';
import { validate } from 'src/common/validate';
import { ErrorType } from 'src/common/errors/error.type';
import { GqlAuthGuard } from './gql-auth.guard';
import { Permissions } from './permissions.enum';
import { RoleType } from './types/role.type';
import { UserType } from './types/user.type';

@Resolver()
export class UserResolver {
  constructor(private readonly _usersService: UsersService) {}

  @Mutation(returns => RegisterPayloadType)
  async register(
    @Args('userSignupDto') userSignupDto: UserSignupDto,
  ): Promise<RegisterPayloadType> {
    const errors = await validate(userSignupDto, UserSignupDto);
    if (errors) {
      return { errors };
    }

    return this._usersService.createUser(userSignupDto);
  }

  @Mutation(returns => ErrorType, { nullable: true })
  async verifyUser(
    @Args('verifyToken') verifyToken: string,
  ): Promise<ErrorType | null> {
    return this._usersService.verifyUser(verifyToken);
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteUsers))
  @Mutation(returns => ErrorType, { nullable: true })
  async deleteUser(
    @Args('id')
    id: string,
  ): Promise<ErrorType | null> {
    return this._usersService.deleteUser(id);
  }

  @UseGuards(GqlAuthGuard(Permissions.RolesRead))
  @Query(returns => [RoleType])
  async roles(): Promise<RoleType[]> {
    return this._usersService.getRoles();
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteUsers))
  @Mutation(returns => [ErrorType], { nullable: true })
  async setRole(
    @Args('roleName') roleName: string,
    @Args('userId') userId: string,
  ): Promise<ErrorType[] | null> {
    return this._usersService.setRole(userId, roleName);
  }

  @UseGuards(GqlAuthGuard(Permissions.ReadUsers))
  @Query(returns => [UserType])
  async users(): Promise<UserType[]> {
    return this._usersService.getUsers();
  }

  @Query(returns => [Permissions])
  allPermissions(): Permissions[] {
    return Object.values(Permissions);
  }
}
