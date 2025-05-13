import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';

// JWT secret key - should be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'voltage-gpu-jwt-secret';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Password verification
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Set JWT cookie
export function setTokenCookie(res: any, token: string) {
  res.setHeader(
    'Set-Cookie',
    `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
      60 * 60 * 24 * 7
    }`
  );
}

// Clear JWT cookie
export function clearTokenCookie(res: any) {
  res.setHeader(
    'Set-Cookie',
    'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
  );
}

// Get token from cookies
export function getTokenFromCookies(cookies: string): string | null {
  if (!cookies) return null;
  
  const tokenCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('token='));
  
  if (!tokenCookie) return null;
  
  return tokenCookie.split('=')[1];
}
