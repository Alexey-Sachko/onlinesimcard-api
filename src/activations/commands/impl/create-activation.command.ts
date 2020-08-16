import { CreateActivationInput } from '../../input/create-activation.input';
import { User } from 'src/users/user.entity';

export class CreateActivationCommand {
  constructor(
    public readonly user: User,
    public readonly createActivationInput: CreateActivationInput,
  ) {}
}
