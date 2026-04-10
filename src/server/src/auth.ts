import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// 记得改加密盐
const JWT_SECRET = process.env.JWT_SECRET || 'A-SALT-EDIT-THIS';
const TOKEN_EXPIRES = '7d';

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}