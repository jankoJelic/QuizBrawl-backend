export const createOtpCode = () =>
  String(Math.floor(100000 + Math.random() * 900000));
