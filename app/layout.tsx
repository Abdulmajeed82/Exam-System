'use client'; // Add this to the very top to handle the hydration check

import React, { useState, useEffect } from "react"
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navbar } from '@/components/navbar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // LAYER 3: The "Hydration Guard"
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="antialiased" 
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        {/* Only render the UI once the client has "mounted". 
            This prevents the server/client mismatch entirely. */}
        {mounted ? (
          <>
            <Navbar />
            {children}
            <Analytics />
          </>
        ) : (
          /* Show a simple empty state or loader while mounting to avoid the crash */
          <div style={{ visibility: 'hidden' }}>
            <Navbar />
            {children}
          </div>
        )}
      </body>
    </html>
  )
}