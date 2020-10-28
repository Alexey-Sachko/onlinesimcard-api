import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SwaggerTags } from 'src/swagger/tags';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

import { User } from '../users/user.entity';
import { GetUser } from 'src/users/get-user.decorator';

@ApiTags(SwaggerTags.Transactions)
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Получить список транзакций всех пользователей',
  })
  @Get()
  async getTransactions() {
    return this.transactionsService.getTransactions();
  }
}
