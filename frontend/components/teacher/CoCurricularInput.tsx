import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';

interface CoCurricularInputProps {
    students: Student[];
}

type LocalState = {
    [studentId: string]: string;
};

const CoCurricularInput: React.FC<CoCurricularInputProps> = ({ students }) => {
    const { studentCoCurriculars, saveStudentCoCurriculars } = useData();
    const [localData, setLocalData] = useState<LocalState>({});

    useEffect(() => {
        const initialState: LocalState = {};
        students.forEach(student => {
            const existing = studentCoCurriculars.find(co => co.studentId === student.id);
            initialState[student.id] = existing?.description || '';
        });
        setLocalData(initialState);
    }, [students, studentCoCurriculars]);

    const handleChange = (studentId: string, value: string) => {
        setLocalData(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSave = () => {
        const dataToSave = Object.entries(localData)
            // FIX: Add a type guard to ensure `description` is a string before calling `.trim()`.
            // This resolves an error where `description` was inferred as `unknown`.
            .filter(([, description]) => typeof description === 'string' && description.trim() !== '')
            .map(([studentId, description]) => ({
                studentId,
                description
            }));
        saveStudentCoCurriculars(dataToSave);
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold p-4 border-b">Input Deskripsi Kokurikuler (P5)</h3>
            <div className="p-4 space-y-4">
                {students.map(student => (
                    <div key={student.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {student.name}
                        </label>
                        <textarea
                            value={localData[student.id] || ''}
                            onChange={e => handleChange(student.id, e.target.value)}
                            rows={3}
                            className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`Tuliskan deskripsi kegiatan kokurikuler untuk ${student.name}...`}
                        />
                    </div>
                ))}
            </div>
            <div className="p-4 bg-gray-50 border-t">
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                    Simpan Deskripsi Kokurikuler
                </button>
            </div>
        </div>
    );
};

export default CoCurricularInput;