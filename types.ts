export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  passwordHash?: string; // Simulated MD5
  // Student specific
  major?: string;
  classYear?: string;
}

export interface Course {
  id: string;
  name: string;
  credits: number;
  teacherId: string;
  teacherName: string;
  description?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  score: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
