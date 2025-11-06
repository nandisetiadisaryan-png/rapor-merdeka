import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as T from '../types';
import {
    initialUsers, initialTeachers, initialClasses, initialStudents,
    initialStudentFamilyData, initialSubjects, initialLearningObjectives,
    initialGradePredicates, initialExtracurriculars, initialExtracurricularPredicates,
    initialStudentSubjectGrades, initialStudentExtracurriculars, initialStudentAttendances,
    initialStudentCoCurriculars, initialSchoolProfile
} from '../mockData';


// The full data context type definition
interface DataContextType {
    isLoading: boolean;
    users: T.User[];
    teachers: T.Teacher[];
    classes: T.ClassData[];
    students: T.Student[];
    studentFamilyData: T.StudentFamilyData[];
    subjects: T.Subject[];
    learningObjectives: T.LearningObjective[];
    gradePredicates: T.GradePredicate[];
    studentSubjectGrades: T.StudentSubjectGrade[];
    extracurriculars: T.Extracurricular[];
    extracurricularPredicates: T.ExtracurricularPredicate[];
    studentExtracurriculars: T.StudentExtracurricular[];
    studentAttendances: T.StudentAttendance[];
    studentCoCurriculars: T.StudentCoCurricular[];
    schoolProfile: T.SchoolProfile;

    // Functions
    addSubject: (data: Omit<T.Subject, 'id'>) => Promise<void>;
    updateSubject: (data: T.Subject) => Promise<void>;
    deleteSubject: (id: string) => Promise<void>;
    addClass: (data: Omit<T.ClassData, 'id'>) => Promise<void>;
    updateClass: (data: T.ClassData) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;
    addTeacher: (data: { name: string; nip: string; username: string; password?: string; }) => Promise<void>;
    updateTeacher: (teacherId: string, data: { userId: string; name: string; nip: string; username: string; password?: string; }) => Promise<void>;
    deleteTeacher: (id: string) => Promise<void>;
    addGradePredicate: (data: Omit<T.GradePredicate, 'id'>) => Promise<void>;
    updateGradePredicate: (data: T.GradePredicate) => Promise<void>;
    deleteGradePredicate: (id: string) => Promise<void>;
    addExtracurricular: (data: Omit<T.Extracurricular, 'id'>) => Promise<void>;
    updateExtracurricular: (data: T.Extracurricular) => Promise<void>;
    deleteExtracurricular: (id: string) => Promise<void>;
    addExtracurricularPredicate: (data: Omit<T.ExtracurricularPredicate, 'id'>) => Promise<void>;
    updateExtracurricularPredicate: (data: T.ExtracurricularPredicate) => Promise<void>;
    deleteExtracurricularPredicate: (id: string) => Promise<void>;
    addStudent: (studentData: Omit<T.Student, 'id'>, familyData: Omit<T.StudentFamilyData, 'studentId'>) => Promise<void>;
    updateStudent: (studentData: T.Student, familyData: T.StudentFamilyData) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
    bulkAddStudents: (data: { studentData: Omit<T.Student, 'id'>; familyData: Omit<T.StudentFamilyData, 'studentId'>; }[]) => Promise<void>;
    addLearningObjective: (data: Omit<T.LearningObjective, 'id'>) => Promise<void>;
    updateLearningObjective: (data: T.LearningObjective) => Promise<void>;
    deleteLearningObjective: (id: string) => Promise<void>;
    saveStudentSubjectGrades: (grades: T.StudentSubjectGrade[]) => Promise<void>;
    saveStudentExtracurriculars: (data: T.StudentExtracurricular[]) => Promise<void>;
    saveStudentAttendances: (data: T.StudentAttendance[]) => Promise<void>;
    saveStudentCoCurriculars: (data: T.StudentCoCurricular[]) => Promise<void>;
    updateSchoolProfile: (data: T.SchoolProfile) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3001/api';

// Helper for fetch requests
const apiRequest = async <T,>(url: string, method: string, body?: any): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Terjadi kesalahan pada server.' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    if (method === 'DELETE') return null as unknown as T;
    return response.json();
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [schoolProfile, setSchoolProfile] = useState<T.SchoolProfile>(initialSchoolProfile);
    
    // All data states
    const [users, setUsers] = useState<T.User[]>([]);
    const [teachers, setTeachers] = useState<T.Teacher[]>([]);
    const [classes, setClasses] = useState<T.ClassData[]>([]);
    const [students, setStudents] = useState<T.Student[]>([]);
    const [studentFamilyData, setStudentFamilyData] = useState<T.StudentFamilyData[]>([]);
    const [subjects, setSubjects] = useState<T.Subject[]>([]);
    const [learningObjectives, setLearningObjectives] = useState<T.LearningObjective[]>([]);
    const [gradePredicates, setGradePredicates] = useState<T.GradePredicate[]>([]);
    const [studentSubjectGrades, setStudentSubjectGrades] = useState<T.StudentSubjectGrade[]>([]);
    const [extracurriculars, setExtracurriculars] = useState<T.Extracurricular[]>([]);
    const [extracurricularPredicates, setExtracurricularPredicates] = useState<T.ExtracurricularPredicate[]>([]);
    const [studentExtracurriculars, setStudentExtracurriculars] = useState<T.StudentExtracurricular[]>([]);
    const [studentAttendances, setStudentAttendances] = useState<T.StudentAttendance[]>([]);
    const [studentCoCurriculars, setStudentCoCurriculars] = useState<T.StudentCoCurricular[]>([]);
    
    const fetchData = async () => {
        const endpoints: { key: keyof typeof setters; url: string }[] = [
            { key: 'users', url: `${API_BASE_URL}/users` },
            { key: 'teachers', url: `${API_BASE_URL}/teachers` },
            { key: 'classes', url: `${API_BASE_URL}/classes` },
            { key: 'students', url: `${API_BASE_URL}/students` },
            { key: 'studentFamilyData', url: `${API_BASE_URL}/student-family-data` },
            { key: 'subjects', url: `${API_BASE_URL}/subjects` },
            { key: 'learningObjectives', url: `${API_BASE_URL}/learning-objectives` },
            { key: 'gradePredicates', url: `${API_BASE_URL}/grade-predicates` },
            { key: 'extracurriculars', url: `${API_BASE_URL}/extracurriculars` },
            { key: 'extracurricularPredicates', url: `${API_BASE_URL}/extracurricular-predicates` },
            { key: 'studentSubjectGrades', url: `${API_BASE_URL}/student-subject-grades` },
            { key: 'studentExtracurriculars', url: `${API_BASE_URL}/student-extracurriculars` },
            { key: 'studentAttendances', url: `${API_BASE_URL}/student-attendances` },
            { key: 'studentCoCurriculars', url: `${API_BASE_URL}/student-cocurriculars` },
        ];

        const setters = {
            users: setUsers, teachers: setTeachers, classes: setClasses, students: setStudents, 
            studentFamilyData: setStudentFamilyData, subjects: setSubjects, learningObjectives: setLearningObjectives,
            gradePredicates: setGradePredicates, extracurriculars: setExtracurriculars,
            extracurricularPredicates: setExtracurricularPredicates, studentSubjectGrades: setStudentSubjectGrades,
            studentExtracurriculars: setStudentExtracurriculars, studentAttendances: setStudentAttendances,
            studentCoCurriculars: setStudentCoCurriculars,
        };

        try {
            const promises = endpoints.map(ep => fetch(ep.url).then(res => res.ok ? res.json() : Promise.reject(new Error(ep.url))));
            const results = await Promise.all(promises);
            
            endpoints.forEach((ep, i) => setters[ep.key](results[i]));

        } catch (error) {
            console.error("KRITIS: Gagal memuat data awal dari backend.", error);
            alert("Tidak dapat terhubung ke server. Aplikasi akan dimuat menggunakan data contoh (mock data). Beberapa fitur seperti menyimpan perubahan tidak akan berfungsi.");
            
            // Fallback to mock data if fetch fails
            setUsers(initialUsers);
            setTeachers(initialTeachers);
            setClasses(initialClasses);
            setStudents(initialStudents);
            setStudentFamilyData(initialStudentFamilyData);
            setSubjects(initialSubjects);
            setLearningObjectives(initialLearningObjectives);
            setGradePredicates(initialGradePredicates);
            setExtracurriculars(initialExtracurriculars);
            setExtracurricularPredicates(initialExtracurricularPredicates);
            setStudentSubjectGrades(initialStudentSubjectGrades);
            setStudentExtracurriculars(initialStudentExtracurriculars);
            setStudentAttendances(initialStudentAttendances);
            setStudentCoCurriculars(initialStudentCoCurriculars);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    // --- GENERIC CRUD HANDLERS ---
    const handleApiError = (action: string, error: any) => {
        console.error(`Error saat ${action}:`, error);
        alert(`Gagal ${action}. Periksa console untuk detail.`);
    };

    const createCrudHandlers = <T extends { id: string }>(entity: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => ({
        add: async (data: Omit<T, 'id'>) => {
            try {
                const newItem = await apiRequest<T>(`${API_BASE_URL}/${entity}`, 'POST', data);
                setter(prev => [...prev, newItem]);
            } catch (error) { handleApiError(`menambah ${entity}`, error); }
        },
        update: async (data: T) => {
            try {
                const updatedItem = await apiRequest<T>(`${API_BASE_URL}/${entity}/${data.id}`, 'PUT', data);
                setter(prev => prev.map(item => item.id === data.id ? updatedItem : item));
            } catch (error) { handleApiError(`mengupdate ${entity}`, error); }
        },
        remove: async (id: string) => {
            try {
                await apiRequest(`${API_BASE_URL}/${entity}/${id}`, 'DELETE');
                setter(prev => prev.filter(item => item.id !== id));
            } catch (error) { handleApiError(`menghapus ${entity}`, error); }
        },
    });

    const subjectHandlers = createCrudHandlers('subjects', setSubjects);
    const loHandlers = createCrudHandlers('learning-objectives', setLearningObjectives);
    const gradePredicateHandlers = createCrudHandlers('grade-predicates', setGradePredicates);
    const extraHandlers = createCrudHandlers('extracurriculars', setExtracurriculars);
    const extraPredicateHandlers = createCrudHandlers('extracurricular-predicates', setExtracurricularPredicates);
    const classHandlers = createCrudHandlers('classes', setClasses);

    // --- CUSTOM/COMPLEX CRUD ---
    const addTeacher = async (data: any) => { 
        try {
            await apiRequest(`${API_BASE_URL}/teachers`, 'POST', data);
            await fetchData(); // Refetch all data to get new user and teacher
        } catch (error) { handleApiError('menambah guru', error); }
    };
    const updateTeacher = async (teacherId: string, data: any) => { 
        try {
            await apiRequest(`${API_BASE_URL}/teachers/${teacherId}`, 'PUT', data);
            await fetchData();
        } catch(error) { handleApiError('mengupdate guru', error); }
    };
    const deleteTeacher = async (id: string) => { 
         try {
            await apiRequest(`${API_BASE_URL}/teachers/${id}`, 'DELETE');
            await fetchData();
        } catch(error) { handleApiError('menghapus guru', error); }
    };
    const addStudent = async (studentData: any, familyData: any) => { 
         try {
            await apiRequest(`${API_BASE_URL}/students`, 'POST', { studentData, familyData });
            await fetchData();
        } catch(error) { handleApiError('menambah siswa', error); }
    };
    const updateStudent = async (studentData: any, familyData: any) => { 
         try {
            await apiRequest(`${API_BASE_URL}/students/${studentData.id}`, 'PUT', { studentData, familyData });
            await fetchData();
        } catch(error) { handleApiError('mengupdate siswa', error); }
    };
    const deleteStudent = async (id: string) => { 
         try {
            await apiRequest(`${API_BASE_URL}/students/${id}`, 'DELETE');
            await fetchData();
        } catch(error) { handleApiError('menghapus siswa', error); }
    };
    const bulkAddStudents = async (data: any) => { 
         try {
            await apiRequest(`${API_BASE_URL}/students/bulk`, 'POST', data);
            await fetchData();
        } catch(error) { handleApiError('impor siswa massal', error); }
    };

    // --- SAVE HANDLERS (UPSERT) ---
    const createSaveHandler = <T,>(path: string, setter: React.Dispatch<React.SetStateAction<T[]>>, localState: T[]) => async (data: T[]) => {
        try {
            await apiRequest(`${API_BASE_URL}/${path}`, 'POST', { data });
            await fetchData(); // Simplest way to ensure data is consistent after mass update
            alert('Data berhasil disimpan!');
        } catch (error) { handleApiError(`menyimpan ${path}`, error); }
    };
    
    const saveStudentSubjectGrades = createSaveHandler('save-subject-grades', setStudentSubjectGrades, studentSubjectGrades);
    const saveStudentExtracurriculars = createSaveHandler('save-extracurriculars', setStudentExtracurriculars, studentExtracurriculars);
    const saveStudentAttendances = createSaveHandler('save-attendances', setStudentAttendances, studentAttendances);
    const saveStudentCoCurriculars = createSaveHandler('save-cocurriculars', setStudentCoCurriculars, studentCoCurriculars);

    const updateSchoolProfile = async (data: T.SchoolProfile) => {
        // This is still local as there's no DB table for it yet.
        setSchoolProfile(data);
        alert('Profil sekolah disimpan (lokal).');
    };

    const value: DataContextType = {
        isLoading, users, teachers, classes, students, studentFamilyData, subjects, learningObjectives,
        gradePredicates, studentSubjectGrades, extracurriculars, extracurricularPredicates, studentExtracurriculars,
        studentAttendances, studentCoCurriculars, schoolProfile,
        
        addSubject: subjectHandlers.add, 
        updateSubject: subjectHandlers.update, 
        deleteSubject: subjectHandlers.remove,
        addClass: classHandlers.add, 
        updateClass: classHandlers.update, 
        deleteClass: classHandlers.remove,
        addTeacher, updateTeacher, deleteTeacher,
        addStudent, updateStudent, deleteStudent, bulkAddStudents,
        addGradePredicate: gradePredicateHandlers.add, 
        updateGradePredicate: gradePredicateHandlers.update, 
        deleteGradePredicate: gradePredicateHandlers.remove,
        addExtracurricular: extraHandlers.add, 
        updateExtracurricular: extraHandlers.update, 
        deleteExtracurricular: extraHandlers.remove,
        addExtracurricularPredicate: extraPredicateHandlers.add, 
        updateExtracurricularPredicate: extraPredicateHandlers.update, 
        deleteExtracurricularPredicate: extraPredicateHandlers.remove,
        addLearningObjective: loHandlers.add, 
        updateLearningObjective: loHandlers.update, 
        deleteLearningObjective: loHandlers.remove,
        saveStudentSubjectGrades, saveStudentExtracurriculars, saveStudentAttendances, saveStudentCoCurriculars,
        updateSchoolProfile
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};