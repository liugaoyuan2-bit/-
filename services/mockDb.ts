import { User, UserRole, Course, Grade } from '../types';

// Mock Data Store
class MockDatabase {
  private users: User[] = [
    { id: '1', name: '管理员', username: 'admin', role: UserRole.ADMIN, passwordHash: '21232f297a57a5a743894a0e4a801fc3' }, // admin
    { id: '2', name: '李老师', username: 'teacher', role: UserRole.TEACHER, passwordHash: '8d7883854312738362e21ee94a5b294d' }, // 123456
    { id: '3', name: '张三', username: 'student', role: UserRole.STUDENT, major: '计算机科学', classYear: '2021级', passwordHash: 'e10adc3949ba59abbe56e057f20f883e' }, // 123456
    { id: '4', name: '李四', username: 'student2', role: UserRole.STUDENT, major: '计算机科学', classYear: '2021级', passwordHash: 'e10adc3949ba59abbe56e057f20f883e' },
  ];

  private courses: Course[] = [
    { id: '101', name: '高等数学', credits: 4, teacherId: '2', teacherName: '李老师', description: '理工科基础必修课' },
    { id: '102', name: 'Python程序设计', credits: 3, teacherId: '2', teacherName: '李老师', description: '编程入门与实践' },
    { id: '103', name: '数据结构', credits: 4, teacherId: '2', teacherName: '李老师', description: '核心算法与存储结构' },
    { id: '104', name: '计算机网络', credits: 3, teacherId: '2', teacherName: '李老师', description: '网络协议与体系结构' },
    { id: '105', name: '操作系统', credits: 4, teacherId: '2', teacherName: '李老师', description: '进程管理与内存调度' },
  ];

  private grades: Grade[] = [
    { id: 'g1', studentId: '3', studentName: '张三', courseId: '101', courseName: '高等数学', score: 85 },
    { id: 'g2', studentId: '3', studentName: '张三', courseId: '102', courseName: 'Python程序设计', score: 92 },
    { id: 'g3', studentId: '4', studentName: '李四', courseId: '101', courseName: '高等数学', score: 78 },
    { id: 'g4', studentId: '4', studentName: '李四', courseId: '102', courseName: 'Python程序设计', score: 88 },
    { id: 'g5', studentId: '3', studentName: '张三', courseId: '104', courseName: '计算机网络', score: 89 },
    { id: 'g6', studentId: '3', studentName: '张三', courseId: '105', courseName: '操作系统', score: 95 },
    { id: 'g7', studentId: '4', studentName: '李四', courseId: '104', courseName: '计算机网络', score: 76 },
    { id: 'g8', studentId: '4', studentName: '李四', courseId: '105', courseName: '操作系统', score: 82 },
  ];

  // Simple simulation of network delay
  private async delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Auth ---
  async login(username: string): Promise<User | null> {
    await this.delay();
    const user = this.users.find(u => u.username === username);
    return user || null;
  }

  // --- Student Methods ---
  async getStudentGrades(studentId: string): Promise<Grade[]> {
    await this.delay();
    return this.grades.filter(g => g.studentId === studentId);
  }

  async updateStudentInfo(studentId: string, info: Partial<User>): Promise<User> {
    await this.delay();
    const idx = this.users.findIndex(u => u.id === studentId);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...info };
      return this.users[idx];
    }
    throw new Error("User not found");
  }

  // --- Teacher Methods ---
  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    await this.delay();
    return this.courses.filter(c => c.teacherId === teacherId);
  }

  async getCourseGrades(courseId: string): Promise<Grade[]> {
    await this.delay();
    return this.grades.filter(g => g.courseId === courseId);
  }

  async updateGrade(gradeId: string, newScore: number): Promise<void> {
    await this.delay();
    const idx = this.grades.findIndex(g => g.id === gradeId);
    if (idx !== -1) {
      this.grades[idx].score = newScore;
    }
  }

  async addGrade(studentId: string, courseId: string, score: number): Promise<void> {
    await this.delay();
    const student = this.users.find(u => u.id === studentId);
    const course = this.courses.find(c => c.id === courseId);
    if (student && course) {
        const newGrade: Grade = {
            id: Math.random().toString(36).substr(2, 9),
            studentId,
            studentName: student.name,
            courseId,
            courseName: course.name,
            score
        };
        this.grades.push(newGrade);
    }
  }

  // --- Admin Methods ---
  async getAllUsers(): Promise<User[]> {
    await this.delay();
    return [...this.users];
  }

  async getAllCourses(): Promise<Course[]> {
    await this.delay();
    return [...this.courses];
  }

  async deleteUser(userId: string): Promise<void> {
    await this.delay();
    this.users = this.users.filter(u => u.id !== userId);
    // Cascade delete grades
    this.grades = this.grades.filter(g => g.studentId !== userId);
  }

  async addCourse(course: Omit<Course, 'id'>): Promise<Course> {
    await this.delay();
    const newCourse = { ...course, id: Math.random().toString(36).substr(2, 9) };
    this.courses.push(newCourse);
    return newCourse;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.delay();
    this.courses = this.courses.filter(c => c.id !== courseId);
    this.grades = this.grades.filter(g => g.courseId !== courseId);
  }

  // Helper for admin adding users
  async addUser(user: Omit<User, 'id'>): Promise<User> {
    await this.delay();
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    this.users.push(newUser);
    return newUser;
  }
}

export const db = new MockDatabase();