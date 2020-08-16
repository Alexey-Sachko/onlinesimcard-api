import { Activation } from 'src/activations/entity/activation.entity';

export class CreatedActivationEvent {
  constructor(public readonly activation: Activation) {}
}
