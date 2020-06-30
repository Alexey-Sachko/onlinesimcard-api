import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleResolver } from './article.resolver';
import { ArticlesService } from './articles.service';
import { ArticleORM } from './article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleORM])],
  providers: [ArticleResolver, ArticlesService],
})
export class ArticlesModule {}
