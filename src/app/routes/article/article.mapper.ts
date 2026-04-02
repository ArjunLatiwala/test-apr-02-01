import { Article, Tag, User } from '@prisma/client';
import authorMapper from './author.mapper';

interface ArticleWithRelations extends Article {
  tagList: Tag[];
  favoritedBy: User[];
  author: User & { followedBy: User[] };
}

const articleMapper = (article: ArticleWithRelations, id?: number) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  body: article.body,
  tagList: article.tagList.map((tag: Tag) => tag.name),
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  favorited: article.favoritedBy.some((item: User) => item.id === id),
  favoritesCount: article.favoritedBy.length,
  author: authorMapper(article.author, id),
});

export default articleMapper;
