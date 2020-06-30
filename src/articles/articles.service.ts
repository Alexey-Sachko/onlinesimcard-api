import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleORM } from './article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { NotFoundException, ConflictException } from 'src/exceptions';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleORM)
    private readonly _articleRepository: Repository<ArticleORM>,
  ) {}

  async createArticle(createArticleDto: CreateArticleDto) {
    const { title, text, alias } = createArticleDto;
    const article = new ArticleORM();
    article.title = title;
    article.text = text;
    article.alias = alias;
    try {
      await article.save();
      return article;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Article with alias ${alias} already exists`,
        );
      }
      throw error;
    }
  }

  async getArticles() {
    const articles = await this._articleRepository.find();
    return articles;
  }

  async getArticleByAlias(alias: string) {
    const article = await this._articleRepository.findOne({ alias });
    if (!article) {
      throw new NotFoundException(`Не найдено article с alias: '${alias}'`);
    }

    return article;
  }

  async getArticlesCount() {
    return this._articleRepository.count();
  }
}
