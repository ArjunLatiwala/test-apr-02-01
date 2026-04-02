import { User } from '@prisma/client';

const authorMapper = (author: User & { followedBy: User[] }, id?: number) => ({
  username: author.username,
  bio: author.bio,
  image: author.image,
  following: id
    ? author?.followedBy.some((followingUser: User) => followingUser.id === id)
    : false,
});

export default authorMapper;
