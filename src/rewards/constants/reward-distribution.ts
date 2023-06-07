export const rewardDistribution = (playersCount: number) => {
  switch (playersCount) {
    case 2:
      return [2, -2];
    case 3:
      return [3, 0, -3];
    case 4:
      return [4, 2, -2, -4];
    case 5:
      return [5, 3, 0, -3, -5];
    case 6:
      return [6, 4, 2, -2, -4, -6];
    case 7:
      return [7, 5, 2, 0, -2, -5, -7];
    case 8:
      return [8, 6, 4, 2, -2, -4, -6, -8];
    case 9:
      return [9, 7, 5, 3, 0, -3, -5, -7, -9];
    case 10:
      return [10, 8, 6, 4, 2, -2, -4, -6, -8, -10];
    default:
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
};
