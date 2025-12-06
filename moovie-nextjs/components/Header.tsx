'use client';

import Link from 'next/link';

export default function Header() {
    return (
        <header className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-800 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                        MOOVI3
                    </Link>

                    <nav className="hidden md:flex gap-6">
                        <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
                        <Link href="/#categories" className="text-gray-300 hover:text-white transition">Categories</Link>
                        <Link href="/#popular" className="text-gray-300 hover:text-white transition">Popular</Link>
                    </nav>

                    <Link
                        href="https://linkshare.online"
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
                    >
                        Back to LinkShare
                    </Link>
                </div>
            </div>
        </header>
    );
}
