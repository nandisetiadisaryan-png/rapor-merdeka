import React, { useState, useEffect, useMemo } from 'react';
import { Student, StudentExtracurricular } from '../../types';
import { useData } from '../../context/DataContext';

interface StudentExtracurricularInputProps {
    students: Student[];
    classId: string;
}

type LocalState = {
    [studentId: string]: {
        [extracurricularId: string]: string; // Store only the predicate
    }
};

const StudentExtracurricularInput: React.FC<StudentExtracurricularInputProps> = ({ students, classId }) => {
    const { extracurriculars, extracurricularPredicates, studentExtracurriculars, saveStudentExtracurriculars } = useData();
    const [localPredicates, setLocalPredicates] = useState<LocalState>({});

    const predicatesByExtraId = useMemo(() => {
        const grouped: {[key: string]: typeof extracurricularPredicates} = {};
        extracurriculars.forEach(extra => {
            grouped[extra.id] = extracurricularPredicates.filter(p => p.extracurricularId === extra.id);
        });
        return grouped;
    }, [extracurriculars, extracurricularPredicates]);

    useEffect(() => {
        const initialState: LocalState = {};
        students.forEach(student => {
            initialState[student.id] = {};
            const studentData = studentExtracurriculars.filter(se => se.studentId === student.id);
            extracurriculars.forEach(extra => {
                const existingData = studentData.find(se => se.extracurricularId === extra.id);
                initialState[student.id][extra.id] = existingData?.predicate || '';
            });
        });
        setLocalPredicates(initialState);
    }, [students, extracurriculars, studentExtracurriculars]);

    const handlePredicateChange = (studentId: string, extracurricularId: string, predicate: string) => {
        setLocalPredicates(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [extracurricularId]: predicate
            }
        }));
    };
    
    const handleSave = () => {
        const dataToSave: StudentExtracurricular[] = [];
        Object.entries(localPredicates).forEach(([studentId, extraData]) => {
            Object.entries(extraData).forEach(([extracurricularId, predicate]) => {
                if (predicate) { // Only save if a predicate is selected
                    const existing = studentExtracurriculars.find(se => se.studentId === studentId && se.extracurricularId === extracurricularId);
                    dataToSave.push({
                        id: existing?.id || `new-${studentId}-${extracurricularId}`,
                        studentId,
                        extracurricularId,
                        predicate,
                    });
                }
            });
        });
        // This logic also needs to account for un-setting a predicate
        const classStudentIds = students.map(s => s.id);
        const allCurrentDataForClass = studentExtracurriculars.filter(se => classStudentIds.includes(se.studentId));
        
        const finalData = allCurrentDataForClass.filter(d => {
            // Remove old data if predicate is now empty
            return localPredicates[d.studentId]?.[d.extracurricularId];
        }).map(d => ({
            ...d,
            predicate: localPredicates[d.studentId][d.extracurricularId]
        }));

        const newData = dataToSave.filter(d => d.id.startsWith('new-'));
        
        saveStudentExtracurriculars([...finalData, ...newData]);
    };

    const getDescription = (extracurricularId: string, predicate: string) => {
        return predicatesByExtraId[extracurricularId]?.find(p => p.predicate === predicate)?.description || '-';
    };

    if (extracurriculars.length === 0) {
        return <div className="text-center text-gray-500 mt-8">Belum ada data Ekstrakurikuler. Silakan tambahkan melalui menu admin.</div>
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
            <h3 className="text-xl font-semibold p-4">Input Nilai Ekstrakurikuler</h3>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48">Nama Murid</th>
                        {extracurriculars.map(extra => (
                             <th key={extra.id} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                                {extra.name}
                             </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                     {students.map(student => (
                        <tr key={student.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white w-48">{student.name}</td>
                            {extracurriculars.map(extra => {
                                const selectedPredicate = localPredicates[student.id]?.[extra.id] || '';
                                return (
                                <td key={extra.id} className="px-2 py-2 whitespace-nowrap align-top">
                                    <div className="flex flex-col space-y-2">
                                        <select
                                            value={selectedPredicate}
                                            onChange={e => handlePredicateChange(student.id, extra.id, e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="">-- Pilih Predikat --</option>
                                            {predicatesByExtraId[extra.id]?.map(p => (
                                                <option key={p.id} value={p.predicate}>{p.predicate}</option>
                                            ))}
                                        </select>
                                        <div className="w-full p-2 bg-gray-100 rounded-md min-h-[60px] text-sm text-gray-700">
                                           {getDescription(extra.id, selectedPredicate)}
                                        </div>
                                    </div>
                                </td>
                            )})}
                        </tr>
                     ))}
                </tbody>
            </table>
             <div className="p-4 bg-gray-50 border-t">
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Simpan Nilai Ekstrakurikuler
                </button>
            </div>
        </div>
    );
};

export default StudentExtracurricularInput;