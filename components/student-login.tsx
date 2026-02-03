'use client';

import React from "react"

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function StudentLogin() {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const success = login(fullName.trim(), password.trim());
      if (!success) {
        setError('Invalid credentials. For the Common Entrance exam use password: GMIS123');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('[v0] Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              G
            </div>
          </div>
          <CardTitle className="text-2xl">Great Model International School</CardTitle>
          <CardDescription className="text-base">
            Student Exam Portal Login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground required:[fullName]">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter your full name (First and Last name)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className="border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-2">Use the school entrance password (GMIS123) to access the Common Entrance exam.</p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              If you don't have login credentials, please contact your teacher or school administrator
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
