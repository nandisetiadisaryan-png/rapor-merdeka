import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Student, StudentFamilyData } from '../../types';

// This lets TypeScript know that 'Papa' is a global variable from the script tag
declare const Papa: any;

const EMPTY_STUDENT_FORM: Omit<Student, 'id'> = {
    name: '', nis: '', nisn: '', classId: '', gender: 'L',
    birthDate: '', birthPlace: '', religion: '', previousEducation: '', studentAddress: ''
};

const EMPTY_FAMILY_FORM: Omit<StudentFamilyData, 'studentId'> = {
    fatherName: '', fatherJob: '', motherName: '', motherJob: '',
    parentAddress: { street: '', village: '', district: '', city: '', province: '' },
    parentPhone: '', guardianName: '', guardianJob: '', guardianAddress: '', guardianPhone: ''
};

const StudentManager: React.FC = () => {
    const { students, studentFamilyData, classes, addStudent, updateStudent, deleteStudent, bulkAddStudents } = useData();
    const [studentForm, setStudentForm] = useState(EMPTY_STUDENT_FORM);
    const [familyForm, setFamilyForm] = useState(EMPTY_FAMILY_FORM);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isModalOpen && editingStudent) {
            const familyData = studentFamilyData.find(f => f.studentId === editingStudent.id);
            setStudentForm({
                name: editingStudent.name, nis: editingStudent.nis, nisn: editingStudent.nisn, classId: editingStudent.classId,
                gender: editingStudent.gender, birthDate: editingStudent.birthDate, birthPlace: editingStudent.birthPlace,
                religion: editingStudent.religion, previousEducation: editingStudent.previousEducation, studentAddress: editingStudent.studentAddress
            });
            setFamilyForm(familyData || EMPTY_FAMILY_FORM);
        } else {
            setStudentForm(EMPTY_STUDENT_FORM);
            setFamilyForm(EMPTY_FAMILY_FORM);
        }
    }, [editingStudent, isModalOpen, studentFamilyData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (Object.keys(studentForm).includes(name)) {
            setStudentForm(prev => ({ ...prev, [name]: value }));
        } else if (Object.keys(familyForm).includes(name)) {
            setFamilyForm(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleParentAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFamilyForm(prev => ({
            ...prev,
            parentAddress: { ...prev.parentAddress, [name]: value }
        }));
    };

    const openModal = (student: Student | null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentForm.name || !studentForm.classId) {
            alert('Nama Siswa dan Kelas wajib diisi.');
            return;
        }

        if (editingStudent) {
            const familyDataToUpdate = { ...familyForm, studentId: editingStudent.id };
            updateStudent({ ...editingStudent, ...studentForm }, familyDataToUpdate);
        } else {
            addStudent(studentForm, familyForm);
        }
        closeModal();
    };

    const handleDeleteClick = (studentId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data Siswa ini beserta data keluarganya?')) {
            deleteStudent(studentId);
        }
    };
    
    const studentsWithClass = useMemo(() => {
        return students.map(s => ({
            ...s,
            className: classes.find(c => c.id === s.classId)?.name || 'N/A'
        })).sort((a,b) => `${a.className}-${a.name}`.localeCompare(`${b.className}-${a.name}`));
    }, [students, classes]);

    const handleDownloadCSV = () => {
        const dataForCsv = students.map(student => {
            const family = studentFamilyData.find(f => f.studentId === student.id) || EMPTY_FAMILY_FORM;
            const class_name = classes.find(c => c.id === student.classId)?.name || '';
            return {
                class_name,
                name: student.name,
                nis: student.nis,
                nisn: student.nisn,
                gender: student.gender,
                birthPlace: student.birthPlace,
                birthDate: student.birthDate,
                religion: student.religion,
                previousEducation: student.previousEducation,
                studentAddress: student.studentAddress,
                fatherName: family.fatherName,
                fatherJob: family.fatherJob,
                motherName: family.motherName,
                motherJob: family.motherJob,
                parentPhone: family.parentPhone,
                parent_street: family.parentAddress.street,
                parent_village: family.parentAddress.village,
                parent_district: family.parentAddress.district,
                parent_city: family.parentAddress.city,
                parent_province: family.parentAddress.province,
                guardianName: family.guardianName,
                guardianJob: family.guardianJob,
                guardianAddress: family.guardianAddress,
                guardianPhone: family.guardianPhone,
            };
        });

        const csv = Papa.unparse(dataForCsv);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "template_siswa.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results: { data: any[] }) => {
                    const classMap = new Map(classes.map(c => [c.name, c.id]));
                    let addedCount = 0;
                    
                    const newStudentsData = results.data.map((row: any) => {
                        // FIX: The value from PapaParse can be inferred as 'unknown'. Using String() and a fallback
                        // ensures that the value passed to classMap.get is always a string.
                        const classId = classMap.get(String(row.class_name || ''));
                        
                        // FIX: Explicitly cast row values to string to prevent 'unknown' type errors when checking for truthiness or assigning to string properties.
                        // Use a `typeof` check to properly narrow the type of `classId` from `unknown` to `string`.
                        if (!String(row.name || '') || typeof classId !== 'string') {
                            console.warn("Skipping row due to missing name or invalid class:", row);
                            return null;
                        }
                        
                        const studentData: Omit<Student, 'id'> = {
                            name: String(row.name || ''),
                            nis: String(row.nis || ''),
                            nisn: String(row.nisn || ''),
                            classId: classId,
                            gender: String(row.gender || '').toUpperCase() === 'P' ? 'P' : 'L',
                            birthPlace: String(row.birthPlace || ''),
                            birthDate: String(row.birthDate || ''),
                            religion: String(row.religion || ''),
                            previousEducation: String(row.previousEducation || ''),
                            studentAddress: String(row.studentAddress || ''),
                        };
                        
                        const familyData: Omit<StudentFamilyData, 'studentId'> = {
                            fatherName: String(row.fatherName || ''),
                            fatherJob: String(row.fatherJob || ''),
                            motherName: String(row.motherName || ''),
                            motherJob: String(row.motherJob || ''),
                            parentPhone: String(row.parentPhone || ''),
                            parentAddress: {
                                street: String(row.parent_street || ''),
                                village: String(row.parent_village || ''),
                                district: String(row.parent_district || ''),
                                city: String(row.parent_city || ''),
                                province: String(row.parent_province || ''),
                            },
                            guardianName: String(row.guardianName || ''),
                            guardianJob: String(row.guardianJob || ''),
                            guardianAddress: String(row.guardianAddress || ''),
                            guardianPhone: String(row.guardianPhone || ''),
                        };

                        addedCount++;
                        return { studentData, familyData };
                    }).filter(Boolean); // Remove null entries

                    if (newStudentsData.length > 0) {
                        bulkAddStudents(newStudentsData as any);
                    }

                    alert(`${addedCount} siswa berhasil diimpor dari file CSV.`);
                }
            });
        }
        // Reset file input to allow uploading the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-xl font-semibold">Kelola Biodata Siswa</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleDownloadCSV} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                        Unduh Template CSV
                    </button>
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">
                        Unggah Siswa via CSV
                    </button>
                    <button onClick={() => openModal(null)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Siswa
                    </button>
                </div>
            </div>
            
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-6">{editingStudent ? 'Edit Biodata Siswa' : 'Tambah Siswa Baru'}</h3>
                                
                                <fieldset className="border p-4 rounded-md mb-4">
                                    <legend className="font-semibold px-2">Data Diri Siswa</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <input name="name" placeholder="Nama Lengkap *" value={studentForm.name} onChange={handleInputChange} className="p-2 border rounded" required />
                                        <input name="nis" placeholder="NIS" value={studentForm.nis} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="nisn" placeholder="NISN" value={studentForm.nisn} onChange={handleInputChange} className="p-2 border rounded" />
                                        <select name="classId" value={studentForm.classId} onChange={handleInputChange} className="p-2 border rounded" required>
                                            <option value="">-- Pilih Kelas * --</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <select name="gender" value={studentForm.gender} onChange={handleInputChange} className="p-2 border rounded">
                                            <option value="L">Laki-laki</option><option value="P">Perempuan</option>
                                        </select>
                                        <input name="birthPlace" placeholder="Tempat Lahir" value={studentForm.birthPlace} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input type="date" name="birthDate" value={studentForm.birthDate} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="religion" placeholder="Agama" value={studentForm.religion} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="previousEducation" placeholder="Pendidikan Sebelumnya" value={studentForm.previousEducation} onChange={handleInputChange} className="p-2 border rounded" />
                                        <textarea name="studentAddress" placeholder="Alamat Siswa" value={studentForm.studentAddress} onChange={handleInputChange} className="p-2 border rounded md:col-span-2" rows={2}></textarea>
                                    </div>
                                </fieldset>

                                <fieldset className="border p-4 rounded-md mb-4">
                                    <legend className="font-semibold px-2">Data Orang Tua</legend>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="fatherName" placeholder="Nama Ayah" value={familyForm.fatherName} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="fatherJob" placeholder="Pekerjaan Ayah" value={familyForm.fatherJob} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="motherName" placeholder="Nama Ibu" value={familyForm.motherName} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="motherJob" placeholder="Pekerjaan Ibu" value={familyForm.motherJob} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="parentPhone" placeholder="No. Telp Orang Tua" value={familyForm.parentPhone} onChange={handleInputChange} className="p-2 border rounded md:col-span-2" />
                                        <input name="street" placeholder="Jalan" value={familyForm.parentAddress.street} onChange={handleParentAddressChange} className="p-2 border rounded md:col-span-2" />
                                        <input name="village" placeholder="Kelurahan/Desa" value={familyForm.parentAddress.village} onChange={handleParentAddressChange} className="p-2 border rounded" />
                                        <input name="district" placeholder="Kecamatan" value={familyForm.parentAddress.district} onChange={handleParentAddressChange} className="p-2 border rounded" />
                                        <input name="city" placeholder="Kabupaten/Kota" value={familyForm.parentAddress.city} onChange={handleParentAddressChange} className="p-2 border rounded" />
                                        <input name="province" placeholder="Provinsi" value={familyForm.parentAddress.province} onChange={handleParentAddressChange} className="p-2 border rounded" />
                                     </div>
                                </fieldset>

                                 <fieldset className="border p-4 rounded-md">
                                    <legend className="font-semibold px-2">Data Wali (jika berbeda)</legend>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="guardianName" placeholder="Nama Wali" value={familyForm.guardianName} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="guardianJob" placeholder="Pekerjaan Wali" value={familyForm.guardianJob} onChange={handleInputChange} className="p-2 border rounded" />
                                        <input name="guardianPhone" placeholder="No. Telp Wali" value={familyForm.guardianPhone} onChange={handleInputChange} className="p-2 border rounded" />
                                        <textarea name="guardianAddress" placeholder="Alamat Wali" value={familyForm.guardianAddress} onChange={handleInputChange} className="p-2 border rounded md:col-span-2" rows={2}></textarea>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="bg-gray-100 px-6 py-3 flex justify-end items-center space-x-2">
                                <button type="button" onClick={closeModal} className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400">Batal</button>
                                <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">{editingStudent ? 'Update Siswa' : 'Simpan Siswa'}</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS / NISN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {studentsWithClass.map(s => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.nis} / {s.nisn}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.className}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => openModal(s)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeleteClick(s.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentManager;