import React, { useState } from 'react';
import { Login } from './components/Login';
import { StudentView } from './components/StudentView';
import { TeacherView } from './components/TeacherView';
import { AdminView } from './components/AdminView';
import { AuthState, UserRole } from './types';
import { LogOut, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLogin={setAuth} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">大学本科教学管理系统</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                <p className="text-xs text-gray-500">
                  {auth.user.role === UserRole.ADMIN ? '管理员' : 
                   auth.user.role === UserRole.TEACHER ? '教师' : '学生'}
                </p>
             </div>
             <button 
               onClick={handleLogout}
               className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
               title="退出登录"
             >
               <LogOut className="h-5 w-5" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {auth.user.role === UserRole.STUDENT && <StudentView user={auth.user} />}
        {auth.user.role === UserRole.TEACHER && <TeacherView user={auth.user} />}
        {auth.user.role === UserRole.ADMIN && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} 教务管理系统 | 基于 React + Tailwind 
        </div>
      </footer>
    </div>
  );
};

export default App;
