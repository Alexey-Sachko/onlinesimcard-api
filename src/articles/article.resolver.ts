import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ArticleType } from './types/article.type';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';

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
  article(@Args('alias') alias: string) {
    return this._articlesService.getArticleByAlias(alias);
  }

  @Mutation(returns => ArticleType)
  createArticle(@Args('createArticleDto') createArticleDto: CreateArticleDto) {
    return this._articlesService.createArticle(createArticleDto);
  }
}
