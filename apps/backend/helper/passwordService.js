import { hash, compare } from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

export const hashPassword = (plainPassword) => {
  return hash(plainPassword, 15);
};

export const comparePassword = (plainPassword, password) => {
  return compare(plainPassword, password);
};

