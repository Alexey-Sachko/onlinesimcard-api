import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { RegisterPayloadType } from './types/register-payload.type';
import { validate } from 'src/common/validate';
import { ErrorType } from 'src/common/errors/error.type';
import { GqlAuthGuard } from './gql-auth.guard';
import { Permissions } from './permissions.enum';

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

  @UseGuards(GqlAuthGuard(Permissions.WriteUsers))
  @Mutation(returns => ErrorType)
  async deleteUser(id: string): Promise<ErrorType | null> {
    return this._usersService.deleteUser(id);
  }
}
