

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { LearningObjective } from '../../types';

interface LearningObjectiveManagerProps {
    classId: string;
}

const EMPTY_OBJECTIVE_FORM = {
    code: '',
    description: '',
    subjectId: '',
    classId: '',
};

const LearningObjectiveManager: React.FC<LearningObjectiveManagerProps> = ({ classId }) => {
    const { learningObjectives, subjects, addLearningObjective, updateLearningObjective, deleteLearningObjective } = useData();
    const [formData, setFormData] = useState({ ...EMPTY_OBJECTIVE_FORM, classId });
    const [editingObjective, setEditingObjective] = useState<LearningObjective | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        if (!classId) {
            setIsFormVisible(false);
            setEditingObjective(null);
        }
        setFormData(prev => ({ ...prev, classId }));
    }, [classId]);
    
    useEffect(() => {
        if (editingObjective) {
            setFormData({
                code: editingObjective.code,
                description: editingObjective.description,
                subjectId: editingObjective.subjectId,
                classId: editingObjective.classId,
            });
            setIsFormVisible(true);
        } else {
            setFormData({ ...EMPTY_OBJECTIVE_FORM, classId });
        }
    }, [editingObjective, classId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCancelEdit = () => {
        setEditingObjective(null);
        setIsFormVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.code && formData.description && formData.subjectId && formData.classId) {
            if (editingObjective) {
                updateLearningObjective({ ...editingObjective, ...formData });
            } else {
                addLearningObjective(formData);
            }
            setEditingObjective(null);
            setIsFormVisible(false);
        } else {
            alert('Harap isi semua kolom.');
        }
    };

    const handleEditClick = (objective: LearningObjective) => {
        setEditingObjective(objective);
    };

    const handleDeleteClick = (objectiveId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus Tujuan Pembelajaran ini?')) {
            deleteLearningObjective(objectiveId);
        }
    };
    
    const objectivesWithDetails = useMemo(() => {
        return learningObjectives
            .filter(lo => lo.classId === classId)
            .map(lo => ({
                ...lo,
                subjectName: subjects.find(s => s.id === lo.subjectId)?.name || 'N/A',
            }))
            .sort((a,b) => `${a.subjectName}-${a.code}`.localeCompare(`${b.subjectName}-${b.code}`));
    }, [learningObjectives, subjects, classId]);

    return (
        <div className="p-4 border rounded-lg bg-white shadow mt-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kelola Tujuan Pembelajaran (TP)</h2>
                {!isFormVisible && (
                     <button 
                        onClick={() => setIsFormVisible(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                        + Tambah TP Baru
                    </button>
                )}
            </div>
            
            {isFormVisible && (
                 <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md border space-y-4">
                    <h3 className="text-lg font-medium">{editingObjective ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">Mata Pelajaran</label>
                            <select id="subjectId" name="subjectId" value={formData.subjectId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" required>
                                <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Kode TP (e.g., TP1, TP2)</label>
                            <input type="text" id="code" name="code" value={formData.code} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Tujuan Pembelajaran</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                             {editingObjective ? 'Update TP' : 'Simpan TP'}
                        </button>
                        <button type="button" onClick={handleCancelEdit} className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400">
                            Batal
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Pelajaran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode TP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {objectivesWithDetails.map(lo => (
                            <tr key={lo.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lo.subjectName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lo.code}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-wrap">{lo.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEditClick(lo)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeleteClick(lo.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                         {objectivesWithDetails.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    Belum ada Tujuan Pembelajaran untuk kelas ini. Silakan tambahkan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LearningObjectiveManager;