import User from "../models/user.model.js";

export async function findUserByEmail(email) {
  const user = await User.findOne({
    where: { email },
  });
  return user;
}

export async function findUserById(id) {
  const user = await User.findOne({
    where: { id },
    attributes: {
      exclude: ["password_hash"],
    },
  });
  return user;
}

export async function createUser(email, password_hash) {
  const user = await User.create({
    email,
    password_hash,
  });
  return {
    id: user.id,
    email: user.email,
  };
}
