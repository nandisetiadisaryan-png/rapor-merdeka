
import { User, Teacher, ClassData, Student, StudentFamilyData, Subject, LearningObjective, GradePredicate, Extracurricular, ExtracurricularPredicate, SchoolProfile, StudentSubjectGrade, StudentExtracurricular, StudentAttendance, StudentCoCurricular } from './types';

export const initialUsers: User[] = [
    { id: 'user-admin', username: 'admin', password: 'admin', role: 'admin' },
    { id: 'user-kepsek', username: 'kepsek', password: 'kepsek', role: 'headmaster' },
    { id: 'user-guru1', username: 'guru1', password: 'guru1', role: 'teacher' },
    { id: 'user-guru2', username: 'guru2', password: 'guru2', role: 'teacher' },
    { id: 'user-guru3', username: 'guru3', password: 'guru3', role: 'teacher' },
    { id: 'user-guru4', username: 'guru4', password: 'guru4', role: 'teacher' },
    { id: 'user-guru5', username: 'guru5', password: 'guru5', role: 'teacher' },
    { id: 'user-guru6', username: 'guru6', password: 'guru6', role: 'teacher' },
];

export const initialTeachers: Teacher[] = [
    { id: '1', userId: 'user-guru1', name: 'Drs. Budi Santoso', nip: '198001012005011001' },
    { id: '2', userId: 'user-guru2', name: 'Ani Lestari, S.Pd.', nip: '198502022008012002' },
    { id: '3', userId: 'user-guru3', name: 'Candra Wijaya, S.Ag.', nip: '198203032007011003' },
    { id: '4', userId: 'user-guru4', name: 'Dewi Anggraini, S.S.', nip: '198804042010012004' },
    { id: '5', userId: 'user-guru5', name: 'Eko Prasetyo, M.Pd.', nip: '197905052004011005' },
    { id: '6', userId: 'user-guru6', name: 'Fitriani, S.Kom.', nip: '199006062012012006' },
];

export const initialClasses: ClassData[] = [
    { id: '1', name: 'Kelas 1', teacherId: '1', fase: 'A' },
    { id: '2', name: 'Kelas 2', teacherId: '2', fase: 'A' },
    { id: '3', name: 'Kelas 3', teacherId: '3', fase: 'B' },
    { id: '4', name: 'Kelas 4', teacherId: '4', fase: 'B' },
    { id: '5', name: 'Kelas 5', teacherId: '5', fase: 'C' },
    { id: '6', name: 'Kelas 6', teacherId: '6', fase: 'C' },
];

export const initialStudents: Student[] = [
    { id: '1', name: 'Adi Saputra', nis: '232401001', nisn: '0012345678', classId: '1', gender: 'L', birthDate: '2017-05-10', birthPlace: 'Cirebon', religion: 'Islam', previousEducation: 'TK Tunas Bangsa', studentAddress: 'Jl. Merdeka No. 10' },
    { id: '2', name: 'Bunga Citra', nis: '232401002', nisn: '0012345679', classId: '1', gender: 'P', birthDate: '2017-06-15', birthPlace: 'Jakarta', religion: 'Kristen', previousEducation: 'PAUD Ceria', studentAddress: 'Jl. Pahlawan No. 20' },
    { id: '3', name: 'Cahyo Wibowo', nis: '232402001', nisn: '0022345678', classId: '2', gender: 'L', birthDate: '2016-07-20', birthPlace: 'Bandung', religion: 'Islam', previousEducation: 'TK Pelita Harapan', studentAddress: 'Jl. Kartini No. 30' },
];

export const initialStudentFamilyData: StudentFamilyData[] = [
    { studentId: '1', fatherName: 'Agus Saputra', fatherJob: 'Wiraswasta', motherName: 'Siti Aminah', motherJob: 'Ibu Rumah Tangga', parentAddress: { street: 'Jl. Merdeka No. 10', village: 'Pulasaren', district: 'Pekalipan', city: 'Cirebon', province: 'Jawa Barat' }, parentPhone: '081234567890', guardianName: '', guardianJob: '', guardianAddress: '', guardianPhone: '' },
    { studentId: '2', fatherName: 'Bambang Hartono', fatherJob: 'Karyawan Swasta', motherName: 'Christina', motherJob: 'Perawat', parentAddress: { street: 'Jl. Pahlawan No. 20', village: 'Kesenden', district: 'Kejaksan', city: 'Cirebon', province: 'Jawa Barat' }, parentPhone: '081234567891', guardianName: '', guardianJob: '', guardianAddress: '', guardianPhone: '' },
    { studentId: '3', fatherName: 'Joko Widodo', fatherJob: 'PNS', motherName: 'Iriana', motherJob: 'Ibu Rumah Tangga', parentAddress: { street: 'Jl. Kartini No. 30', village: 'Sukapura', district: 'Kejaksan', city: 'Cirebon', province: 'Jawa Barat' }, parentPhone: '081234567892', guardianName: '', guardianJob: '', guardianAddress: '', guardianPhone: '' },
];


export const initialSubjects: Subject[] = [
    { id: 'subject-1', name: 'Pendidikan Agama Islam', category: 'Wajib' },
    { id: 'subject-2', name: 'Pendidikan Pancasila', category: 'Wajib' },
    { id: 'subject-3', name: 'Bahasa Indonesia', category: 'Wajib' },
    { id: 'subject-4', name: 'Matematika', category: 'Wajib' },    
    { id: 'subject-5', name: 'IPAS', category: 'Wajib' },
    { id: 'subject-6', name: 'PJOK', category: 'Wajib' },
    { id: 'subject-7', name: 'Seni Rupa', category: 'Wajib' },
    { id: 'subject-8', name: 'Bahasa Inggris', category: 'Wajib' },
    { id: 'subject-9', name: 'Koding dan KA', category: 'Pilihan' },
    { id: 'subject-10', name: 'Bahasa Cirebon', category: 'Mulok' },
    { id: 'subject-11', name: 'Bahasa Sunda', category: 'Mulok' },
];

export const initialLearningObjectives: LearningObjective[] = [
    { id: 'lo-1', subjectId: 'subject-4', classId: '1', code: 'TP1', description: 'Mengenal bilangan cacah sampai 100.' },
    { id: 'lo-2', subjectId: 'subject-4', classId: '1', code: 'TP2', description: 'Melakukan penjumlahan dan pengurangan sederhana.' },
    { id: 'lo-3', subjectId: 'subject-3', classId: '1', code: 'TP1', description: 'Membaca dan menulis huruf.' },
];

export const initialGradePredicates: GradePredicate[] = [
    { id: 'pred-1', threshold: 90, description: 'Sangat Baik' },
    { id: 'pred-2', threshold: 80, description: 'Baik' },
    { id: 'pred-3', threshold: 70, description: 'Cukup' },
    { id: 'pred-4', threshold: 0, description: 'Perlu Bimbingan' },
].sort((a, b) => b.threshold - a.threshold);

export const initialExtracurriculars: Extracurricular[] = [
    { id: 'extra-1', name: 'Pramuka' },
    { id: 'extra-2', name: 'Futsal' },
];

export const initialExtracurricularPredicates: ExtracurricularPredicate[] = [
    { id: 'ep-1', extracurricularId: 'extra-1', predicate: 'A', description: 'Sangat aktif dan menunjukkan kepemimpinan.' },
    { id: 'ep-2', extracurricularId: 'extra-1', predicate: 'B', description: 'Aktif mengikuti kegiatan.' },
    { id: 'ep-3', extracurricularId: 'extra-1', predicate: 'C', description: 'Cukup aktif, perlu lebih inisiatif.' },
    { id: 'ep-4', extracurricularId: 'extra-2', predicate: 'A', description: 'Menunjukkan kemampuan teknik yang baik dan kerjasama tim.' },
    { id: 'ep-5', extracurricularId: 'extra-2', predicate: 'B', description: 'Berpartisipasi aktif dalam latihan dan pertandingan.' },
];

export const initialSchoolProfile: SchoolProfile = {
    name: "SDN PULASAREN 4",
    npsn: "20218733",
    nss: "101026401004",
    principalName: "PIPIT GARNIS SEPTIYANI, M.Pd.",
    principalNip: "19860924 200902 2 002",
    address: "Jl. Pulasaren no.35",
    phone: "0231-123456",
    email: "sdnpulasaren4@gmail.com",
    academicYear: "2023/2024",
    semester: "Genap",
    reportCardCity: "Cirebon",
    reportCardDate: "2024-06-22",
    loginLogoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtjQv4n-R3yGyi25p-naT3lW_8S2xJcgAdNA&s",
    reportCoverLogoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtjQv4n-R3yGyi25p-naT3lW_8S2xJcgAdNA&s",
    reportPrefix: "Ananda",
    reportHighestPhrase: "baik dalam",
    reportLowestPhrase: "perlu peningkatan dalam",
};

export const initialStudentSubjectGrades: StudentSubjectGrade[] = [];
export const initialStudentExtracurriculars: StudentExtracurricular[] = [];
export const initialStudentAttendances: StudentAttendance[] = [];
export const initialStudentCoCurriculars: StudentCoCurricular[] = [];