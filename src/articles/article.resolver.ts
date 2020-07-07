import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ParseIntPipe } from '@nestjs/common';
import { ArticleType } from './types/article.type';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { GqlAuthGuard } from 'src/users/gql-auth.guard';
import { Permissions } from 'src/users/permissions.enum';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ErrorType } from 'src/common/errors/error.type';
import { validate } from '../common/validate';

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

  @Query(returns => ArticleType, { nullable: true })
  article(@Args('id', ParseIntPipe) id: number) {
    return this._articlesService.getArticleById(id);
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteArticles))
  @Mutation(returns => [ErrorType], { nullable: true })
  async createArticle(
    @Args('createArticleDto') createArticleDto: CreateArticleDto,
  ) {
    const errors = await validate(createArticleDto, CreateArticleDto);
    if (errors) {
      return errors;
    }

    return this._articlesService.createArticle(createArticleDto);
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteArticles))
  @Mutation(returns => [ErrorType], { nullable: true })
  updateArticle(@Args('updateArticleDto') updateArticleDto: UpdateArticleDto) {
    return this._articlesService.updateArticle(updateArticleDto);
  }

  @UseGuards(GqlAuthGuard(Permissions.WriteArticles))
  @Mutation(returns => ErrorType, { nullable: true })
  deleteArticle(@Args('id', ParseIntPipe) id: number) {
    return this._articlesService.deleteArticle(id);
  }
}
