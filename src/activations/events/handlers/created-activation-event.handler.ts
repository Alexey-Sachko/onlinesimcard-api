import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import { CreatedActivationEvent } from '../impl/created-activation.event';

@EventsHandler(CreatedActivationEvent)
export class CreatedActivationEventHandler
  implements IEventHandler<CreatedActivationEvent> {
  handle(event: CreatedActivationEvent) {
    console.log('Activation has been created. Run checker logic');
  }
}
