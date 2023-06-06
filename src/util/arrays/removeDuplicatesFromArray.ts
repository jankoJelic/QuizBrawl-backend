export const removeDuplicatesFromArray = (arr: any[]) => {
  let uniqueChars = [];
  arr.forEach((c) => {
    if (!uniqueChars.includes(c)) {
      uniqueChars.push(c);
    }
  });

  return uniqueChars;
};
