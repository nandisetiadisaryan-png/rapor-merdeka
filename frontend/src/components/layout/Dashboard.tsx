

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// Admin Components
import TeacherManager from '../admin/TeacherManager';
import ClassManager from '../admin/ClassManager';
import StudentManager from '../admin/StudentManager';
import SubjectManager from '../admin/SubjectManager';
import PredicateManager from '../admin/PredicateManager';
import ExtracurricularManager from '../admin/ExtracurricularManager';
import SchoolProfileManager from '../admin/SchoolProfileManager';

// Teacher Components
import GradeInputTable from '../teacher/GradeInputTable';
import LearningObjectiveManager from '../teacher/LearningObjectiveManager';
import StudentExtracurricularInput from '../teacher/StudentExtracurricularInput';
import AttendanceInput from '../teacher/AttendanceInput';
import CoCurricularInput from '../teacher/CoCurricularInput';
import ReportCardPrint from '../teacher/ReportCardPrint';
import ReportCoverPrint from '../teacher/ReportCoverPrint';


const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { classes, teachers, subjects, students } = useData();
    const [activeView, setActiveView] = useState('home');

    // Teacher specific state
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const teacherInfo = useMemo(() => {
        return teachers.find(t => t.userId === user?.id);
    }, [teachers, user]);

    const teacherClasses = useMemo(() => {
        if (user?.role === 'teacher' && teacherInfo) {
            // A teacher might be a homeroom teacher for multiple classes
            return classes.filter(c => c.teacherId === teacherInfo.id);
        }
        return [];
    }, [classes, teacherInfo, user]);
    
    // Set default class for teacher when component mounts or classes change
    useEffect(() => {
        if (teacherClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(teacherClasses[0].id);
        }
    }, [teacherClasses, selectedClassId]);

    const studentsInSelectedClass = useMemo(() => {
        return students.filter(s => s.classId === selectedClassId).sort((a,b) => a.name.localeCompare(b.name));
    }, [students, selectedClassId]);

    const renderAdminDashboard = () => (
        <>
            <div className="grid grid-cols-1 gap-6">
                {activeView === 'home' && <div className="p-4 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="mt-2">Selamat datang, Admin! Silakan pilih menu di samping untuk mengelola data.</p></div>}
                {activeView === 'teachers' && <TeacherManager />}
                {activeView === 'classes' && <ClassManager />}
                {activeView === 'students' && <StudentManager />}
                {activeView === 'subjects' && <SubjectManager />}
                {activeView === 'predicates' && <PredicateManager />}
                {activeView === 'extracurriculars' && <ExtracurricularManager />}
                {activeView === 'school-profile' && <SchoolProfileManager />}
            </div>
        </>
    );
    
    const renderTeacherDashboard = () => (
         <>
            <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="class-select" className="font-semibold">Pilih Kelas Wali:</label>
                    <select id="class-select" value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); setSelectedSubjectId(''); }} className="p-2 border rounded-md">
                        <option value="">-- Pilih Kelas --</option>
                        {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {['grades', 'learning-objectives'].includes(activeView) && (
                     <div className="flex items-center space-x-2">
                        <label htmlFor="subject-select" className="font-semibold">Pilih Mata Pelajaran:</label>
                        <select id="subject-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="p-2 border rounded-md">
                            <option value="">-- Pilih Mapel --</option>
                            {[...subjects].sort((a,b) => a.name.localeCompare(b.name)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                )}
            </div>
            {activeView === 'home' && <div className="p-4 bg-white rounded-lg shadow"><h1 className="text-2xl font-bold">Teacher Dashboard</h1><p className="mt-2">Selamat datang, Guru! Silakan pilih menu dan kelas untuk mulai mengelola data siswa.</p></div>}
            {activeView === 'learning-objectives' && selectedClassId && <LearningObjectiveManager classId={selectedClassId} />}
            {activeView === 'grades' && selectedClassId && selectedSubjectId && <GradeInputTable classId={selectedClassId} subjectId={selectedSubjectId} students={studentsInSelectedClass} />}
            {activeView === 'extracurriculars' && selectedClassId && <StudentExtracurricularInput classId={selectedClassId} students={studentsInSelectedClass} />}
            {activeView === 'attendance' && selectedClassId && <AttendanceInput students={studentsInSelectedClass} />}
            {activeView === 'cocurricular' && selectedClassId && <CoCurricularInput students={studentsInSelectedClass} />}
            {activeView === 'print-cover' && selectedClassId && <ReportCoverPrint students={studentsInSelectedClass} classId={selectedClassId} />}
            {activeView === 'print-identity' && selectedClassId && <ReportCardPrint students={studentsInSelectedClass} classId={selectedClassId} mode="identity" />}
            {activeView === 'print-grades' && selectedClassId && <ReportCardPrint students={studentsInSelectedClass} classId={selectedClassId} mode="grades" />}
        </>
    );

    const renderHeadmasterDashboard = () => (
         <div className="p-4 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Headmaster Dashboard</h1>
            <p>Selamat datang, Kepala Sekolah! Halaman ini masih dalam pengembangan.</p>
        </div>
    );

    const navLinks = {
        admin: [
            { key: 'home', label: 'Home' },
            { key: 'school-profile', label: 'Profil Sekolah' },
            { key: 'teachers', label: 'Guru & Pengguna' },
            { key: 'classes', label: 'Kelas' },
            { key: 'students', label: 'Siswa' },
            { key: 'subjects', label: 'Mata Pelajaran' },
            { key: 'predicates', label: 'Predikat Nilai' },
            { key: 'extracurriculars', label: 'Ekstrakurikuler' },
        ],
        teacher: [
            { key: 'home', label: 'Home' },
            { key: 'learning-objectives', label: 'Kelola Tujuan Pembelajaran' },
            { key: 'grades', label: 'Input Nilai Akademik' },
            { key: 'extracurriculars', label: 'Input Nilai Ekstrakurikuler' },
            { key: 'attendance', label: 'Input Absensi & Catatan' },
            { key: 'cocurricular', label: 'Input Catatan P5' },
            { key: 'print-cover', label: 'Cetak Cover Rapor' },
            { key: 'print-identity', label: 'Cetak Identitas Siswa' },
            { key: 'print-grades', label: 'Cetak Laporan Nilai' },
        ],
        headmaster: [
            { key: 'home', label: 'Home' },
        ]
    };

    const currentNav = user?.role ? navLinks[user.role as keyof typeof navLinks] : [];
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col flex-shrink-0">
                <div className="p-4 text-xl font-bold border-b border-slate-700">Rapor Digital</div>
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {currentNav.map(link => (
                        <button
                            key={link.key}
                            onClick={() => setActiveView(link.key)}
                            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${activeView === link.key ? 'bg-slate-900 text-white' : 'hover:bg-slate-700'}`}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="text-sm truncate">Masuk sebagai: <strong>{user?.username} ({user?.role})</strong></div>
                    <button onClick={logout} className="w-full mt-2 text-left px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-150">
                        Logout
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {user?.role === 'admin' && renderAdminDashboard()}
                {user?.role === 'teacher' && renderTeacherDashboard()}
                {user?.role === 'headmaster' && renderHeadmasterDashboard()}
            </main>
        </div>
    );
};

export default Dashboard;