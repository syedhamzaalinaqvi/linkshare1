import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST /api/auth/login - Admin login
export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        const isValid = await verifyPassword(password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // Set auth cookie (simple token for now)
        const cookieStore = await cookies();
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

        cookieStore.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return NextResponse.json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}

// GET /api/auth/check - Check if logged in
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}

// DELETE /api/auth/logout - Logout
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('admin_token');

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
