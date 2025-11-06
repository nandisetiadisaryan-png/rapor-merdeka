import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';

interface AttendanceInputProps {
    students: Student[];
}

type LocalState = {
    [studentId: string]: {
        present: number;
        permitted: number;
        unpermitted: number;
        teacherNote: string;
    }
};

const AttendanceInput: React.FC<AttendanceInputProps> = ({ students }) => {
    const { studentAttendances, saveStudentAttendances } = useData();
    const [localData, setLocalData] = useState<LocalState>({});

    useEffect(() => {
        const initialState: LocalState = {};
        students.forEach(student => {
            const existing = studentAttendances.find(att => att.studentId === student.id);
            initialState[student.id] = {
                present: existing?.present || 0,
                permitted: existing?.permitted || 0,
                unpermitted: existing?.unpermitted || 0,
                teacherNote: existing?.teacherNote || '',
            };
        });
        setLocalData(initialState);
    }, [students, studentAttendances]);

    const handleChange = (studentId: string, field: 'present' | 'permitted' | 'unpermitted' | 'teacherNote', value: string) => {
        setLocalData(prev => {
            const studentData = { ...prev[studentId] };
            if (field === 'teacherNote') {
                studentData.teacherNote = value;
            } else {
                studentData[field] = Math.max(0, Number(value));
            }
            return {
                ...prev,
                [studentId]: studentData
            };
        });
    };
    
    const handleSave = () => {
        // FIX: Replaced Object.entries with Object.keys. This avoids a potential TypeScript
        // type inference issue where the `values` variable is not correctly identified as a spreadable object.
        const dataToSave = Object.keys(localData).map(studentId => ({
            studentId,
            ...localData[studentId]
        }));
        saveStudentAttendances(dataToSave);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold p-4 border-b">Input Kehadiran Siswa</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Siswa</th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">Sakit</th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">Izin</th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">Tanpa Keterangan</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                <td className="px-3 py-2 text-center">
                                    <input 
                                        type="number" 
                                        value={localData[student.id]?.present || 0}
                                        onChange={e => handleChange(student.id, 'present', e.target.value)}
                                        className="w-24 p-2 border rounded-md text-center"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <input 
                                        type="number" 
                                        value={localData[student.id]?.permitted || 0}
                                        onChange={e => handleChange(student.id, 'permitted', e.target.value)}
                                        className="w-24 p-2 border rounded-md text-center"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                     <input 
                                        type="number" 
                                        value={localData[student.id]?.unpermitted || 0}
                                        onChange={e => handleChange(student.id, 'unpermitted', e.target.value)}
                                        className="w-24 p-2 border rounded-md text-center"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-semibold p-4 border-b border-t mt-4">Catatan Guru</h3>
             <div className="p-4 space-y-4">
                {students.map(student => (
                    <div key={student.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {student.name}
                        </label>
                        <textarea
                            value={localData[student.id]?.teacherNote || ''}
                            onChange={e => handleChange(student.id, 'teacherNote', e.target.value)}
                            rows={2}
                            className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`Tuliskan catatan umum untuk ${student.name}...`}
                        />
                    </div>
                ))}
            </div>

            <div className="p-4 bg-gray-50 border-t">
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                    Simpan Kehadiran & Catatan
                </button>
            </div>
        </div>
    );
};

export default AttendanceInput;