import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserSignupDto } from './dto/user-signup.dto';
import { RegisterPayloadType } from './types/register-payload.type';
import { validate } from 'src/common/validation/validate';

@Resolver()
export class UserResolver {
  constructor(private readonly _usersService: UsersService) {}

  @Mutation(returns => RegisterPayloadType, { nullable: true })
  async register(
    @Args('userSignupDto') userSignupDto: UserSignupDto,
  ): Promise<RegisterPayloadType> {
    const errors = await validate(userSignupDto, UserSignupDto);
    if (errors) {
      return { errors };
    }

    return this._usersService.createUser(userSignupDto);
  }
}
