import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleResolver } from './article.resolver';
import { ArticlesService } from './articles.service';
import { ArticleORM } from './article.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleORM]), UsersModule],
  providers: [ArticleResolver, ArticlesService],
})
export class ArticlesModule {}
