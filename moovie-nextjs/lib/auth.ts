// Simple authentication helper
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'moovi3admin2025';

export async function verifyPassword(password: string): Promise<boolean> {
    // For now, simple comparison. In production, use hashed passwords
    return password === ADMIN_PASSWORD;
}

export function generatePasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export function comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
