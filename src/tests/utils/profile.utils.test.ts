import profileMapper from '../../app/routes/profile/profile.utils';

describe('ProfileUtils', () => {
  describe('profileMapper', () => {
    test('should return a profile', () => {
      // Given
      const user = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        demo: false,
        bio: 'My happy life',
        image: null,
        followedBy: [],
      };
      const id = 123;

      // When
      const expected = {
        username: 'RealWorld',
        bio: 'My happy life',
        image: null,
        following: false,
      };

      // Then
      expect(profileMapper(user as any, id)).toEqual(expected);
    });

    test('should return a profile followed by the user', () => {
      // Given
      const user = {
        id: 123,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        demo: false,
        bio: 'My happy life',
        image: null,
        followedBy: [
          {
            id: 123,
            username: 'RealWorld',
            email: 'realworld@me',
            password: '1234',
            bio: null,
            image: null,
            token: '',
            demo: false,
          },
        ],
      };
      const id = 123;

      // When
      const expected = {
        username: 'RealWorld',
        bio: 'My happy life',
        image: null,
        following: true,
      };

      // Then
      expect(profileMapper(user as any, id)).toEqual(expected);
    });

    test('should return a profile not followed by the user', () => {
      // Given
      const user = {
        id: 456,
        username: 'RealWorld',
        email: 'realworld@me',
        password: '1234',
        demo: false,
        bio: 'My happy life',
        image: null,
        followedBy: [
          {
            id: 789,
            username: 'NotRealWorld',
            email: 'notrealworld@me',
            password: '1234',
            bio: null,
            image: null,
            token: '',
            demo: false,
          },
        ],
      };
      const id = 123;

      // When
      const expected = {
        username: 'RealWorld',
        bio: 'My happy life',
        image: null,
        following: false,
      };

      // Then
      expect(profileMapper(user as any, id)).toEqual(expected);
    });
  });
});
