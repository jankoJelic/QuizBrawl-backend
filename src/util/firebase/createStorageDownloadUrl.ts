export const createStorageDownloadUrl = (pathToFile, downloadToken) => {
  const bucket = 'crabjourney-a62d3.appspot.com';

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    pathToFile,
  )}?alt=media&token=${downloadToken}`;
};
