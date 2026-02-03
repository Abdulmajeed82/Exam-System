'use client';

import React from "react"

import { useState } from 'react';
import { useTeacherAuth } from '@/lib/teacher-auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function TeacherLogin() {
  const { login } = useTeacherAuth();
  const [email, setEmail] = useState('adeyemi@gmisteach.edu');
  const [password, setPassword] = useState('password_1');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const success = login(email.trim(), password.trim());
      if (!success) {
        setError('Invalid email or password. Demo: adeyemi@gmisteach.edu / password_1');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('[v0] Teacher login error:', err);
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
          <CardTitle className="text-2xl">Teacher Portal</CardTitle>
          <CardDescription className="text-base">
            Great Model International School Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-primary/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-primary/30"
              />
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

            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Email: adeyemi@gmisteach.edu</p>
              <p>Password: password1</p>
            </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
