import { Topic } from 'src/rooms/types/Topic';
import { User } from '../user.entity';

export const shallowUser = (user: User) => {
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
    friends: user.friends,
    color: user.color,
  } as ShallowUser;
};

export interface ShallowUser {
  // data in JWT token
  email: string;
  id: number;
  isAdmin: boolean;
  isBanned: boolean;
  isPremium: boolean;
  trophies: number;
  firstName: string;
  lastName: string;
  level: number;
  rank: number;
  accuracyPercentage: number;
  favouriteTopic: Topic;
  avatar: string;
  isOnline: boolean;
  totalAnswers: Record<Topic, number>;
  correctAnswers: Record<Topic, number>;
  friends: number[];
  color: string;
}
