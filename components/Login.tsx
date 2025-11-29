import React, { useState } from 'react';
import { UserRole, AuthState } from '../types';
import { db } from '../services/mockDb';
import { KeyRound, User as UserIcon, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (auth: AuthState) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await db.login(username);
      if (user) {
        // In a real app, we would hash the input password (MD5) and compare with user.passwordHash
        // For this demo, we assume the password is correct if the user exists to simplify interaction
        onLogin({ isAuthenticated: true, user });
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('连接服务器失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <Shield className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white">教务管理系统</h1>
          <p className="text-blue-100 mt-2">身份验证入口</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入账号"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? '登录中...' : '安全登录'}
            </button>
          </form>

          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-gray-500 text-center">
              测试账号提示: <br/>
              管理员: admin / 教师: teacher / 学生: student <br/>
              (密码任意)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
