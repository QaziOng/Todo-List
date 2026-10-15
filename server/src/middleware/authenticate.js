import AppError from "../utils/app-error.js";
import { findUserById } from "../repositories/user.repository.js";

export default async function authenticate(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      throw new AppError("Authentication Required", 401);
    }

    const user = await findUserById(userId);

    if (!user) {
      req.session.destroy(() => {});

      throw new AppError("Authentication Required", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
