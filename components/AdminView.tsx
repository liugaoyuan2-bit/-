import React, { useEffect, useState } from 'react';
import { User, Course, UserRole } from '../types';
import { db } from '../services/mockDb';
import { generateCourses } from '../services/geminiService';
import { Trash2, Plus, Server, Globe, Loader2 } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('courses');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Crawler State
  const [crawlTopic, setCrawlTopic] = useState('人工智能');
  const [isCrawling, setIsCrawling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [u, c] = await Promise.all([db.getAllUsers(), db.getAllCourses()]);
    setUsers(u);
    setCourses(c);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('确定要删除该用户吗？')) {
      await db.deleteUser(id);
      loadData();
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('确定要删除该课程吗？')) {
      await db.deleteCourse(id);
      loadData();
    }
  };

  const handleCrawlCourses = async () => {
    setIsCrawling(true);
    // Find a teacher to assign these courses to (just for demo)
    const teacher = users.find(u => u.role === UserRole.TEACHER);
    if (!teacher) {
        alert("系统中没有教师，无法导入课程");
        setIsCrawling(false);
        return;
    }

    const newCourses = await generateCourses(crawlTopic, teacher.name, teacher.id);
    
    // Add to DB
    for (const c of newCourses) {
        await db.addCourse(c);
    }
    
    await loadData();
    setIsCrawling(false);
    alert(`成功爬取并导入 ${newCourses.length} 门关于 "${crawlTopic}" 的课程`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-600" /> 系统管理后台
         </h2>
         <p className="text-sm text-gray-500 mt-1">数据维护与系统配置</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
            <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 py-3 font-medium ${activeTab === 'courses' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                课程管理
            </button>
            <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 font-medium ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                用户管理
            </button>
        </div>

        <div className="p-6">
            {activeTab === 'courses' && (
                <div className="space-y-6">
                    {/* Crawler Section */}
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> 智能课程导入 (模拟爬虫)
                        </h4>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={crawlTopic}
                                onChange={(e) => setCrawlTopic(e.target.value)}
                                className="flex-1 border border-indigo-200 rounded px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="输入课程主题 (例如: 大数据)"
                            />
                            <button 
                                onClick={handleCrawlCourses}
                                disabled={isCrawling}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isCrawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {isCrawling ? '正在获取...' : '生成并导入'}
                            </button>
                        </div>
                        <p className="text-xs text-indigo-500 mt-2">
                            注：此功能使用 Gemini API 生成逼真的课程数据，模拟从教务网站爬取课程信息的过程。
                        </p>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">课程名称</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">学分</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">授课教师</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {courses.map(c => (
                                <tr key={c.id}>
                                    <td className="px-4 py-3 text-sm text-gray-500">{c.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{c.credits}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{c.teacherName}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDeleteCourse(c.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3 text-sm text-gray-500">{u.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{u.username}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                            u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                            u.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)} 
                                            className="text-red-600 hover:text-red-900"
                                            disabled={u.role === 'ADMIN'}
                                        >
                                            <Trash2 className={`w-4 h-4 ${u.role === 'ADMIN' ? 'opacity-20 cursor-not-allowed' : ''}`} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
