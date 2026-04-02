import prismaMock from '../prisma-mock';
import {
  deleteComment,
  favoriteArticle,
  unfavoriteArticle,
} from '../../app/routes/article/article.service';

describe('ArticleService', () => {
  describe('deleteComment', () => {
    test('should throw an error ', () => {
      // Given
      const id = 123;
      const idUser = 456;

      // When
      // @ts-expect-error: prismaMock is not perfectly typed for all relations
      prismaMock.comment.findFirst.mockResolvedValue(null);

      // Then
      expect(deleteComment(id, idUser)).rejects.toThrowError();
    });
  });

  describe('favoriteArticle', () => {
    test('should return the favorited article', async () => {
      // Given
      const slug = 'How-to-train-your-dragon';

      const mockedUserResponse = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      const mockedArticleResponse = {
        id: 123,
        slug: 'How-to-train-your-dragon',
        title: 'How to train your dragon',
        description: '',
        body: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 456,
        tagList: [],
        favoritedBy: [],
        author: {
          username: 'RealWorld',
          bio: null,
          image: null,
          followedBy: [],
        },
        _count: {
          favoritedBy: 0,
        },
      };

      // When
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock as any).user.findUnique.mockResolvedValue(mockedUserResponse as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock as any).article.update.mockResolvedValue(mockedArticleResponse as any);

      // Then
      await expect(favoriteArticle(slug, mockedUserResponse.id)).resolves.toHaveProperty(
        'favoritesCount',
      );
    });

    test('should throw an error if no user is found', async () => {
      // Given
      const id = 123;
      const slug = 'how-to-train-your-dragon';

      // When
      (prismaMock as any).user.findUnique.mockResolvedValue(null);

      // Then
      await expect(favoriteArticle(slug, id)).rejects.toThrowError();
    });
  });
  describe('unfavoriteArticle', () => {
    test('should return the unfavorited article', async () => {
      // Given
      const slug = 'How-to-train-your-dragon';

      const mockedUserResponse = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        bio: null,
        image: null,
        token: '',
        demo: false,
      };

      const mockedArticleResponse = {
        id: 123,
        slug: 'How-to-train-your-dragon',
        title: 'How to train your dragon',
        description: '',
        body: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 456,
        tagList: [],
        favoritedBy: [],
        author: {
          username: 'RealWorld',
          bio: null,
          image: null,
          followedBy: [],
        },
        _count: {
          favoritedBy: 0,
        },
      };

      // When
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock as any).user.findUnique.mockResolvedValue(mockedUserResponse as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prismaMock as any).article.update.mockResolvedValue(mockedArticleResponse as any);

      // Then
      await expect(unfavoriteArticle(slug, mockedUserResponse.id)).resolves.toHaveProperty(
        'favoritesCount',
      );
    });

    test('should throw an error if no user is found', async () => {
      // Given
      const id = 123;
      const slug = 'how-to-train-your-dragon';

      // When
      (prismaMock as any).user.findUnique.mockResolvedValue(null);

      // Then
      await expect(unfavoriteArticle(slug, id)).rejects.toThrowError();
    });
  });
});
