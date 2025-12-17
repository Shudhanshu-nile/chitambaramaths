import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  academicYear?: string;
  isExamCenter?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  signIn: (email: string, password: string, userData?: Partial<UserProfile>) => void;
  signUp: (fullName: string, email: string, password: string, additionalData?: Partial<UserProfile>) => void;
  signOut: () => void;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);

  const signIn = (email: string, password: string, userData?: Partial<UserProfile>) => {
    // Simulate API call - in production, this would validate credentials
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: userData?.fullName || 'Sarah Johnson',
      email: email,
      profileImage: userData?.profileImage,
      phone: userData?.phone,
      dateOfBirth: userData?.dateOfBirth,
      country: userData?.country,
      academicYear: userData?.academicYear,
      isExamCenter: userData?.isExamCenter,
    };
    setUserState(newUser);
  };

  const signUp = (fullName: string, email: string, password: string, additionalData?: Partial<UserProfile>) => {
    // Simulate API call - in production, this would create a new account
    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: fullName,
      email: email,
      profileImage: additionalData?.profileImage,
      phone: additionalData?.phone,
      dateOfBirth: additionalData?.dateOfBirth,
      country: additionalData?.country || 'Sri Lanka',
      academicYear: additionalData?.academicYear,
      isExamCenter: additionalData?.isExamCenter ?? true,
    };
    setUserState(newUser);
  };

  const signOut = () => {
    setUserState(null);
  };

  const setUser = (newUser: UserProfile | null) => {
    setUserState(newUser);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: user !== null,
    signIn,
    signUp,
    signOut,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
