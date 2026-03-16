import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
  req.user = payload;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ message: "Forbidden: admin access required" });
      return;
    }
    next();
  });
}
