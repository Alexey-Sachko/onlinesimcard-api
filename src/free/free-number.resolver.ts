import {
  Resolver,
  Query,
  ResolveField,
  Args,
  Parent,
  Int,
} from '@nestjs/graphql';
import { FreeService } from './free.service';
import { FreeNumType } from './types/free-num.type';
import { FreeMessagesType } from './types/free-messages.type';

@Resolver(of => FreeNumType)
export class FreeNumberResolver {
  constructor(private readonly _freeService: FreeService) {}

  @Query(returns => [FreeNumType])
  freeNumbers() {
    return this._freeService.getNumbers();
  }

  @Query(returns => FreeNumType)
  async freeNumber(@Args('num') num: string) {
    const numbers = await this._freeService.getNumbers();
    const number = numbers.find(el => el.number === num);
    return number;
  }

  @Query(returns => FreeMessagesType)
  async freeMessages(
    @Args('number') num: string,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
  ) {
    return this._freeService.getMessagesByNumber(num, page);
  }

  @ResolveField(type => FreeMessagesType)
  async messages(
    @Parent() number: FreeNumType,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ) {
    const messages = await this._freeService.getMessagesByNumber(
      number.number,
      page, // todo not working
    );
    return messages;
  }
}
