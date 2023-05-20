import { User } from '../user.entity';

export const shallowUser = (user: User) => {
  // only neccessary info
  return {
    email: user.email,
    id: user.id,
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    isPremium: user.isPremium,
    trophies: user.trophies,
    firstName: user.firstName,
    lastName: user.lastName,
    level: user.level,
    rank: user.rank,
    accuracyPercentage: user.accuracyPercentage,
    favouriteTopic: user.favouriteTopic,
    avatar: user.avatar,
    isOnline: user.isOnline,
    totalAnswers: user.totalAnswers,
    correctAnswers: user.correctAnswers,
  };
};
