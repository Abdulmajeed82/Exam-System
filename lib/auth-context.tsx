'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { Student } from './types';
import { getStudentBySchoolId } from './db';

interface AuthContextType {
  student: Student | null;
  isAuthenticated: boolean;
  login: (fullName: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gmiStudentAuth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setStudent(data);
      } catch (error) {
        console.log('[v0] Error loading stored auth:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (fullName: string, password: string): boolean => {
    // Require both fullname and password
    if (!fullName || !password) {
      return false;
    }

    // Enforce common entrance password (configurable via env)
    const CE_PASSWORD = process.env.NEXT_PUBLIC_COMMON_ENTRANCE_PASSWORD || 'GMIS123';
    if (password !== CE_PASSWORD) {
      return false;
    }

    // For demo purposes, we'll use a simple authentication
    // In production, this should verify against a database
    const { getAllStudents, createStudent } = require('./db');
    const students = getAllStudents();
    
    // Check if student with this full name exists
    let existingStudent = students.find(
      (s: Student) => s.name === fullName
    );

    if (!existingStudent) {
      // New student registration - require password
      if (!password || password.trim() === '') {
        return false;
      }
      const schoolId = `STU${Date.now()}`;
      existingStudent = createStudent(fullName, schoolId, password);
    } else {
      // For existing students, check password
      // If no password exists, reject (since password is now required)
      // If password exists, verify it
      if (!existingStudent.password) {
        return false;
      }
      if (existingStudent.password !== password) {
        return false; // Invalid password
      }
    }

    setStudent(existingStudent || null);
    localStorage.setItem('gmiStudentAuth', JSON.stringify(existingStudent));
    return true;
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('gmiStudentAuth');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background" />;
  }

  return (
    <AuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
