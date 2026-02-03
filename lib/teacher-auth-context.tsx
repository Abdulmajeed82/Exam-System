'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Teacher } from './types';
import { getTeacherByEmail } from './db';

interface TeacherAuthContextType {
  teacher: Teacher | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(
  undefined
);

export function TeacherAuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gmiTeacherAuth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTeacher(data);
      } catch (error) {
        console.log('[v0] Error loading stored teacher auth:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const existingTeacher = getTeacherByEmail(email);

    // Simple password check (in production, use bcrypt)
    if (!existingTeacher) {
      return false;
    }

    // For demo, we'll just check if password matches the stored hash
    if (existingTeacher.password === `hashed_${password}`) {
      setTeacher(existingTeacher);
      localStorage.setItem('gmiTeacherAuth', JSON.stringify(existingTeacher));
      return true;
    }

    return false;
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('gmiTeacherAuth');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background" />;
  }

  return (
    <TeacherAuthContext.Provider
      value={{
        teacher,
        isAuthenticated: !!teacher,
        login,
        logout,
      }}
    >
      {children}
    </TeacherAuthContext.Provider>
  );
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext);
  if (context === undefined) {
    throw new Error('useTeacherAuth must be used within TeacherAuthProvider');
  }
  return context;
}
