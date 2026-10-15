import { signupSchema } from "../validators/auth.validator.js";
import { signupUser, loginUser } from "../services/auth.services.js";
import { findUserById } from "../repositories/user.repository.js";
import AppError from "../utils/app-error.js";

export async function signup(req, res, next) {
  try {
    const { email, password } = req.validatedBody;
    const user = await signupUser(email, password);

    return res.status(201).json({
      message: "Account created Successfully",
      user,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;
    const user = await loginUser(email, password);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    await new Promise((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    req.session.userId = user.id;

    await new Promise((resolve, reject) => {
      req.session.save((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    return res.status(200).json({
      message: "Login Successful",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    res.clearCookie("task.sid");

    return res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}
