import React, { useState, useEffect, useMemo } from 'react';
import { Student, StudentSubjectGrade } from '../../types';
import { useData } from '../../context/DataContext';

interface GradeInputTableProps {
    subjectId: string;
    students: Student[];
    classId: string;
}

const GradeInputTable: React.FC<GradeInputTableProps> = ({ subjectId, students, classId }) => {
    const { learningObjectives, gradePredicates, studentSubjectGrades, saveStudentSubjectGrades } = useData();
    const [grades, setGrades] = useState<{ [studentId: string]: StudentSubjectGrade }>({});
    const [summativeCount, setSummativeCount] = useState(2);
    
    const subjectLearningObjectives = useMemo(() => {
        return learningObjectives.filter(lo => lo.subjectId === subjectId && lo.classId === classId)
            .sort((a, b) => a.code.localeCompare(b.code));
    }, [subjectId, classId, learningObjectives]);

    useEffect(() => {
        if (!subjectId || students.length === 0) return;

        const initialGrades: { [studentId: string]: StudentSubjectGrade } = {};
        let maxSummative = 2;

        students.forEach(student => {
            const existingGrade = studentSubjectGrades.find(g => g.studentId === student.id && g.subjectId === subjectId);

            if (existingGrade) {
                initialGrades[student.id] = { ...existingGrade };
                if (existingGrade.summativeGrades.length > maxSummative) {
                    maxSummative = existingGrade.summativeGrades.length;
                }
            } else {
                const tpGrades: { [key: string]: number | null } = {};
                subjectLearningObjectives.forEach(lo => {
                    tpGrades[lo.id] = null;
                });
                initialGrades[student.id] = {
                    id: `new-${student.id}-${subjectId}`,
                    studentId: student.id,
                    subjectId: subjectId,
                    classId: classId,
                    tpGrades,
                    summativeGrades: Array(summativeCount).fill(null),
                    finalExamScore: null,
                };
            }
        });
        
        // Normalize summative counts for all students in the view
        students.forEach(student => {
            const currentSummativeLength = initialGrades[student.id].summativeGrades.length;
            if (currentSummativeLength < maxSummative) {
                initialGrades[student.id].summativeGrades = [
                    ...initialGrades[student.id].summativeGrades,
                    ...Array(maxSummative - currentSummativeLength).fill(null)
                ];
            }
        });

        setSummativeCount(maxSummative);
        setGrades(initialGrades);

    }, [students, subjectId, classId, subjectLearningObjectives, studentSubjectGrades]);

    const handleGradeChange = (studentId: string, type: 'tp' | 'summative' | 'finalExam', key: string | number, value: string) => {
        const numericValue = value === '' ? null : Math.max(0, Math.min(100, Number(value)));

        setGrades(prevGrades => {
            const newStudentGrades = { ...prevGrades[studentId] };
            if (type === 'tp') {
                newStudentGrades.tpGrades = { ...newStudentGrades.tpGrades, [key as string]: numericValue };
            } else if (type === 'summative') {
                const newSummativeGrades = [...newStudentGrades.summativeGrades];
                newSummativeGrades[key as number] = numericValue;
                newStudentGrades.summativeGrades = newSummativeGrades;
            } else if (type === 'finalExam') {
                newStudentGrades.finalExamScore = numericValue;
            }
            return { ...prevGrades, [studentId]: newStudentGrades };
        });
    };

    const calculateFinalScore = (studentId: string) => {
        const studentGrades = grades[studentId];
        if (!studentGrades) return 0;

        const allTpScores = Object.values(studentGrades.tpGrades).filter(v => v !== null) as number[];
        const avgTp = allTpScores.length > 0 ? allTpScores.reduce((a, b) => a + b, 0) / allTpScores.length : 0;

        const allSummativeScores = studentGrades.summativeGrades.filter(v => v !== null) as number[];
        const avgSummative = allSummativeScores.length > 0 ? allSummativeScores.reduce((a, b) => a + b, 0) / allSummativeScores.length : 0;

        const finalExam = studentGrades.finalExamScore ?? 0;

        const validScores = [avgTp, avgSummative, finalExam].filter(s => s > 0);
        if (validScores.length === 0) return 0;
        
        return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    };

    const getPredicate = (score: number) => {
        const sortedPredicates = [...gradePredicates].sort((a, b) => b.threshold - a.threshold);
        return sortedPredicates.find(p => score >= p.threshold)?.description || 'Perlu Bimbingan';
    };

    const getDescription = (studentId: string, type: 'highest' | 'lowest') => {
        const studentGrades = grades[studentId]?.tpGrades;
        if (!studentGrades) return '-';
        
        const validTpScores = Object.entries(studentGrades).filter(([, score]) => score !== null) as [string, number][];
        if (validTpScores.length === 0) return 'Belum ada nilai TP yang diisi.';

        const targetScore = type === 'highest' ? Math.max(...validTpScores.map(([,s]) => s)) : Math.min(...validTpScores.map(([,s]) => s));
        const targetTpId = validTpScores.find(([,score]) => score === targetScore)?.[0];
        const learningObjective = subjectLearningObjectives.find(lo => lo.id === targetTpId);

        return learningObjective ? learningObjective.description : '-';
    };
    
    const handleAddSummative = () => {
        setSummativeCount(prev => prev + 1);
        setGrades(prevGrades => {
            const newGrades = { ...prevGrades };
            for (const studentId in newGrades) {
                newGrades[studentId] = {
                    ...newGrades[studentId],
                    summativeGrades: [...newGrades[studentId].summativeGrades, null]
                };
            }
            return newGrades;
        });
    };

    const handleRemoveSummative = (indexToRemove: number) => {
        if (summativeCount <= 1) {
            alert("Minimal harus ada 1 nilai sumatif.");
            return;
        }
        setSummativeCount(prev => prev - 1);
        setGrades(prevGrades => {
            const newGrades = { ...prevGrades };
            for (const studentId in newGrades) {
                const newSummativeGrades = [...newGrades[studentId].summativeGrades];
                newSummativeGrades.splice(indexToRemove, 1);
                newGrades[studentId] = {
                    ...newGrades[studentId],
                    summativeGrades: newSummativeGrades
                };
            }
            return newGrades;
        });
    };

    const handleSaveGrades = () => {
        const gradesToSave = Object.values(grades);
        saveStudentSubjectGrades(gradesToSave);
        alert('Nilai berhasil disimpan!');
    }

    if (subjectLearningObjectives.length === 0) {
        return <div className="text-center text-gray-500 mt-8">Tujuan Pembelajaran untuk mata pelajaran ini belum ditambahkan.</div>
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-10">No</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-10 bg-gray-50 z-10 w-24">NIS</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10 w-48">Nama Murid</th>
                        {subjectLearningObjectives.map(lo => (
                            <th key={lo.id} scope="col" title={lo.description} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{lo.code}</th>
                        ))}
                        {Array.from({ length: summativeCount }).map((_, index) => (
                             <th key={index} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                <div className="flex items-center justify-center space-x-2">
                                    <span>Sumatif {index + 1}</span>
                                    <button onClick={() => handleRemoveSummative(index)} title="Hapus kolom sumatif" className="w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center text-sm font-bold pb-0.5">×</button>
                                </div>
                             </th>
                        ))}
                         <th scope="col" className="px-1 py-3 text-center text-xs font-medium text-gray-500 w-8">
                            <button onClick={handleAddSummative} title="Tambah kolom sumatif" className="w-6 h-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center text-lg">+</button>
                        </th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Nilai UAS</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Nilai Akhir</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Predikat</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-xs">Deskripsi (Capaian Tertinggi)</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-xs">Deskripsi (Perlu Peningkatan)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => {
                        const finalScore = calculateFinalScore(student.id);
                        return (
                            <tr key={student.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 sticky left-0 bg-white w-10">{index + 1}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 sticky left-10 bg-white w-24">{student.nis}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-32 bg-white w-48">{student.name}</td>
                                {subjectLearningObjectives.map(lo => (
                                    <td key={lo.id} className="px-2 py-1 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={grades[student.id]?.tpGrades[lo.id] ?? ''}
                                            onChange={(e) => handleGradeChange(student.id, 'tp', lo.id, e.target.value)}
                                            className="w-20 p-2 border rounded-md text-center"
                                        />
                                    </td>
                                ))}
                                {Array.from({ length: summativeCount }).map((_, sIndex) => (
                                    <td key={sIndex} className="px-2 py-1 whitespace-nowrap">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={grades[student.id]?.summativeGrades[sIndex] ?? ''}
                                            onChange={(e) => handleGradeChange(student.id, 'summative', sIndex, e.target.value)}
                                            className="w-20 p-2 border rounded-md text-center"
                                        />
                                    </td>
                                ))}
                                <td className="px-1 py-1"></td>
                                <td className="px-2 py-1 whitespace-nowrap">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={grades[student.id]?.finalExamScore ?? ''}
                                        onChange={(e) => handleGradeChange(student.id, 'finalExam', 'finalExamScore', e.target.value)}
                                        className="w-24 p-2 border rounded-md text-center"
                                    />
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-center text-gray-900">{finalScore > 0 ? finalScore : '-'}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-center text-gray-900">{finalScore > 0 ? getPredicate(finalScore) : '-'}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 text-wrap">{getDescription(student.id, 'highest')}</td>
                                <td className="px-4 py-2 text-sm text-gray-600 text-wrap">{getDescription(student.id, 'lowest')}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className="p-4 bg-gray-50 border-t">
                <button onClick={handleSaveGrades} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Simpan Nilai
                </button>
            </div>
        </div>
    );
};

export default GradeInputTable;