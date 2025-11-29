import React, { useEffect, useState } from 'react';
import { User, Grade } from '../types';
import { db } from '../services/mockDb';
import { User as UserIcon, BookOpen, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  user: User;
}

export const StudentView: React.FC<Props> = ({ user }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [activeTab, setActiveTab] = useState<'grades' | 'profile'>('grades');
  const [profile, setProfile] = useState({ name: user.name, major: user.major || '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGrades();
  }, [user.id]);

  const loadGrades = async () => {
    const data = await db.getStudentGrades(user.id);
    setGrades(data);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    await db.updateStudentInfo(user.id, profile);
    setLoading(false);
    alert('个人信息更新成功');
  };

  const averageScore = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserIcon className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">当前用户</p>
            <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">学生</span>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Trophy className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">平均成绩</p>
            <h3 className="text-lg font-bold text-gray-900">{averageScore}</h3>
          </div>
        </div>

        {/* Courses Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <BookOpen className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已修课程</p>
            <h3 className="text-lg font-bold text-gray-900">{grades.length} 门</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'grades' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            成绩查询
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            个人信息
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'grades' ? (
            <div className="space-y-8">
               <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课程名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分数</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.score}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${grade.score >= 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {grade.score >= 60 ? '及格' : '不及格'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="h-64 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">成绩分布可视化</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={grades}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseName" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="分数" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">姓名</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">专业</label>
                <input
                  type="text"
                  value={profile.major}
                  onChange={(e) => setProfile({...profile, major: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                保存修改
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
