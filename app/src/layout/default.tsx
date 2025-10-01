import React from 'react';

interface DefaultLayoutProps {
    children: React.ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
