import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // validating token
    if (!authHeader || authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    // adding id extracted from token to req payload for next request
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      message: "Invalid or expired token",
    });

  }
};

export default authMiddleware
