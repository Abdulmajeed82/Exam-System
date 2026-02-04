'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const path = usePathname();

  return (
    <nav className="bg-white border-b border-primary/10 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <span className="font-semibold text-lg text-foreground">GMIS Exam Portal</span>
        </Link>

        <div className="flex gap-4 items-center">
          <a href="#home" className={`text-sm ${path === '/' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
            Home
          </a>
          <a href="#student" className="text-sm text-muted-foreground hover:text-foreground">Student</a>
          <a href="#teacher" className="text-sm text-muted-foreground hover:text-foreground">Teacher</a>
          <a href="#practice" className="text-sm text-muted-foreground hover:text-foreground">Practice</a>
        </div>
      </div>
    </nav>
  );
}
