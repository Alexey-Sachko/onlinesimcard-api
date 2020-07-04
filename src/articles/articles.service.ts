import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleORM } from './article.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';

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
        return null;
      }
      throw error;
    }
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
