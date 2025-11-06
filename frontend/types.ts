// Fix: Provide full content for types.ts
export interface User {
    id: string;
    username: string;
    password?: string;
    role: 'admin' | 'teacher' | 'headmaster';
}

export interface Teacher {
    id: string;
    userId: string;
    name: string;
    nip: string;
}

export interface ClassData {
    id: string;
    name: string;
    teacherId: string; 
    fase: string;
}

export interface Student {
    id: string;
    name: string;
    nis: string;
    nisn: string;
    classId: string;
    gender: 'L' | 'P';
    birthDate: string;
    birthPlace: string;
    religion: string;
    previousEducation: string;
    studentAddress: string;
}

export interface StudentFamilyData {
    studentId: string;
    fatherName: string;
    fatherJob: string;
    motherName: string;
    motherJob: string;
    parentAddress: {
        street: string;
        village: string;
        district: string;
        city: string;
        province: string;
    };
    parentPhone: string;
    guardianName: string;
    guardianJob: string;
    guardianAddress: string;
    guardianPhone: string;
}


export interface Subject {
    id: string;
    name: string;
    category: 'Wajib' | 'Pilihan' | 'Mulok';
}

export interface LearningObjective {
    id: string;
    code: string;
    description: string;
    subjectId: string;
    classId: string;
}

export interface GradePredicate {
    id: string;
    threshold: number;
    description: string;
}

export interface StudentSubjectGrade {
    id: string;
    studentId: string;
    subjectId: string;
    classId: string;
    tpGrades: { [learningObjectiveId: string]: number | null };
    summativeGrades: (number | null)[];
    finalExamScore: number | null;
}

export interface Extracurricular {
    id: string;
    name: string;
}

export interface ExtracurricularPredicate {
    id: string;
    extracurricularId: string;
    predicate: string; 
    description: string;
}

export interface StudentExtracurricular {
    id: string;
    studentId: string;
    extracurricularId: string;
    predicate: string;
}

export interface StudentAttendance {
    studentId: string;
    present: number;
    permitted: number;
    unpermitted: number;
    teacherNote: string;
}

export interface StudentCoCurricular {
    studentId: string;
    description: string;
}

export interface SchoolProfile {
    name: string;
    npsn: string;
    nss: string;
    principalName: string;
    principalNip: string;
    address: string;
    phone: string;
    email: string;
    academicYear: string;
    semester: 'Ganjil' | 'Genap';
    reportCardCity: string;
    reportCardDate: string;
    loginLogoUrl: string;
    reportCoverLogoUrl: string;
    reportPrefix: string;
    reportHighestPhrase: string;
    reportLowestPhrase: string;
}