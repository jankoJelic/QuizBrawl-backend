import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export const hashAndSalt = async (string: string) => {
  const salt = randomBytes(8).toString('hex');

  // Hash the password with the salt
  const hash = (await scrypt(string, salt, 32)) as Buffer;

  // Join the hashed password with the salt
  const result = salt + '.' + hash.toString('hex');

  return result;
};

export const entryMatchesHash = async (entry: string, hash: string) => {
  const [salt, storedHash] = hash.split('.');

  const entryHashed = (await scrypt(entry, salt, 32)) as Buffer;

  return storedHash === entryHashed.toString('hex');
};
