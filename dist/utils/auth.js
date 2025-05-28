import { SignJWT, jwtVerify } from 'jose';
// JWTの署名と検証に使用するシークレットキー
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
// JWTトークンを生成する関数
export async function generateToken(payload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
    return token;
}
// JWTトークンを検証する関数
export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
// パスワードをハッシュ化する関数
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
// パスワードを検証する関数
export async function verifyPassword(password, hashedPassword) {
    const hashedInput = await hashPassword(password);
    return hashedInput === hashedPassword;
}
