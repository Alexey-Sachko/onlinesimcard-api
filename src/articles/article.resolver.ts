import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ArticleType } from './types/article.type';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UseGuards, ParseIntPipe } from '@nestjs/common';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { Permissions } from 'src/users/permissions.enum';

@Resolver(of => ArticleType)
export class ArticleResolver {
  constructor(private readonly _articlesService: ArticlesService) {}

  @Query(returns => [ArticleType])
  articles() {
    return this._articlesService.getArticles();
  }

  @Query(returns => Number)
  articlesCount() {
    return this._articlesService.getArticlesCount();
  }

  @Query(returns => ArticleType)
  article(@Args('id', ParseIntPipe) id: number) {
    return this._articlesService.getArticleById(id);
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteArticles))
  @Mutation(returns => ArticleType)
  createArticle(@Args('createArticleDto') createArticleDto: CreateArticleDto) {
    return this._articlesService.createArticle(createArticleDto);
  }
}
