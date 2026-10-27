import fs from "fs/promises";

export function validate(schema) {
  return async (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (error) {
          console.error("Could not remove upload after invalid task data", error);
        }
      }

      return res.status(400).json({
        message: "Invalid request data",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join(""),
          message: issue.message,
        })),
      });
    }

    req.validatedBody = result.data;

    next();
  };
}
