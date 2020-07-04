import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleORM } from './article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { errorResponse } from 'src/common/error-response';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleORM)
    private readonly _articleRepository: Repository<ArticleORM>,
  ) {}

  async createArticle(createArticleDto: CreateArticleDto) {
    const { alias, text, title } = createArticleDto;
    const articleExists = await this._articleRepository.findOne({
      alias,
    });

    if (articleExists) {
      return [
        errorResponse('alias', `Статья с alias: '${alias}' уже существует`),
      ];
    }

    const article = new ArticleORM();
    article.title = title;
    article.text = text;
    article.alias = alias;
    await article.save();
    return article;
  }

  async updateArticle(updateArticleDto: UpdateArticleDto) {
    const { id, alias } = updateArticleDto;
    const article = await this.getArticleById(id);
    if (!article) {
      return [errorResponse('id', `Нет статьи с id: '${updateArticleDto.id}'`)];
    }

    const articleByAlias = await this._articleRepository.findOne({ alias });
    if (articleByAlias && articleByAlias.id !== article.id) {
      return [errorResponse('alias', `Поле alias должно быть уникальным`)];
    }

    Object.assign(article, updateArticleDto);
    await article.save();
    return null;
  }

  async deleteArticle(id: number) {
    const article = await this.getArticleById(id);
    if (!article) {
      return errorResponse('id', `Нет статьи с id: '${id}'`);
    }
    await this._articleRepository.remove(article);
    return null;
  }

  async getArticles() {
    const articles = await this._articleRepository.find();
    return articles;
  }

  async getArticleById(id: number) {
    const article = await this._articleRepository.findOne({ id });
    return article;
  }

  async getArticlesCount() {
    return this._articleRepository.count();
  }
}
