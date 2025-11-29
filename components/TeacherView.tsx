import React, { useEffect, useState } from 'react';
import { User, Course, Grade } from '../types';
import { db } from '../services/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, BookOpen, Save } from 'lucide-react';

interface Props {
  user: User;
}

export const TeacherView: React.FC<Props> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  
  // For adding new grades
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [newGradeStudentId, setNewGradeStudentId] = useState('');
  const [newGradeScore, setNewGradeScore] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses]);

  useEffect(() => {
    if (selectedCourseId) {
      loadGrades(selectedCourseId);
    }
  }, [selectedCourseId]);

  const loadData = async () => {
    const [c, u] = await Promise.all([
      db.getTeacherCourses(user.id),
      db.getAllUsers()
    ]);
    setCourses(c);
    setAllStudents(u.filter(user => user.role === 'STUDENT'));
  };

  const loadGrades = async (courseId: string) => {
    setLoading(true);
    const g = await db.getCourseGrades(courseId);
    setGrades(g);
    setLoading(false);
  };

  const handleScoreChange = async (gradeId: string, newScore: string) => {
    const score = parseFloat(newScore);
    if (!isNaN(score)) {
      await db.updateGrade(gradeId, score);
      // Optimistic update
      setGrades(grades.map(g => g.id === gradeId ? { ...g, score } : g));
    }
  };

  const handleAddGrade = async () => {
    if (!newGradeStudentId || !newGradeScore) return;
    await db.addGrade(newGradeStudentId, selectedCourseId, parseFloat(newGradeScore));
    setNewGradeStudentId('');
    setNewGradeScore('');
    loadGrades(selectedCourseId); // Refresh
  };

  // Stats Logic
  const averageScore = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length).toFixed(1) 
    : 0;
  
  const passCount = grades.filter(g => g.score >= 60).length;
  const failCount = grades.length - passCount;
  const pieData = [
    { name: '及格', value: passCount },
    { name: '不及格', value: failCount },
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">课程管理面板</h2>
          <p className="text-sm text-gray-500">欢迎, {user.name} 老师</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <label className="mr-2 text-sm font-medium text-gray-700">选择课程:</label>
          <select 
            value={selectedCourseId} 
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade List & Entry */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4" /> 学生成绩录入
            </h3>
          </div>
          <div className="p-4">
             {/* Add Grade Form */}
             <div className="flex gap-2 mb-6 bg-blue-50 p-3 rounded-lg">
                <select 
                  className="flex-1 border border-gray-300 rounded p-2 text-sm"
                  value={newGradeStudentId}
                  onChange={(e) => setNewGradeStudentId(e.target.value)}
                >
                  <option value="">选择学生录入...</option>
                  {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.major})</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="分数" 
                  className="w-20 border border-gray-300 rounded p-2 text-sm"
                  value={newGradeScore}
                  onChange={(e) => setNewGradeScore(e.target.value)}
                />
                <button 
                  onClick={handleAddGrade}
                  className="bg-blue-600 text-white px-4 rounded text-sm hover:bg-blue-700"
                >
                  添加
                </button>
             </div>

             <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">学生</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">成绩</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grades.map(grade => (
                      <tr key={grade.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{grade.studentName}</td>
                        <td className="px-4 py-3 text-sm">
                          <input 
                            type="number" 
                            className="w-16 border rounded px-1 py-0.5 text-center focus:ring-blue-500 focus:border-blue-500"
                            defaultValue={grade.score}
                            onBlur={(e) => handleScoreChange(grade.id, e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <Save className="w-4 h-4 text-gray-400" />
                        </td>
                      </tr>
                    ))}
                    {grades.length === 0 && (
                      <tr><td colSpan={3} className="text-center py-4 text-gray-500">暂无成绩数据</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
             <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 班级平均分
             </h3>
             <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-600">{averageScore}</span>
                  <p className="text-gray-500 text-sm mt-1">总平均分</p>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-64">
            <h3 className="font-semibold text-gray-700 mb-2">及格率统计</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-700 mb-6">全班成绩分布 (柱状图)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="studentName" />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="score" fill="#6366f1" name="分数" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
