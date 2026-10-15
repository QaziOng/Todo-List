import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

export async function signupUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser(email, passwordHash);

  return user;
}

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}
