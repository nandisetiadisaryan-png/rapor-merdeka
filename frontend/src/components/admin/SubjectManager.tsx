// Fix: Provide full content for SubjectManager.tsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Subject } from '../../types';

const EMPTY_SUBJECT_FORM: Omit<Subject, 'id'> = { name: '', category: 'Wajib' };

const SubjectManager: React.FC = () => {
    const { subjects, addSubject, updateSubject, deleteSubject } = useData();
    const [formData, setFormData] = useState(EMPTY_SUBJECT_FORM);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        if (editingSubject) {
            setFormData({ name: editingSubject.name, category: editingSubject.category });
            setIsFormVisible(true);
        } else {
            setFormData(EMPTY_SUBJECT_FORM);
        }
    }, [editingSubject]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value as any });
    };

    const handleCancelEdit = () => {
        setEditingSubject(null);
        setIsFormVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Nama Mata Pelajaran tidak boleh kosong.');
            return;
        }

        if (editingSubject) {
            updateSubject({ ...editingSubject, ...formData });
        } else {
            addSubject(formData);
        }
        setEditingSubject(null);
        setIsFormVisible(false);
    };

    const handleEditClick = (subject: Subject) => {
        setEditingSubject(subject);
    };

    const handleDeleteClick = (subjectId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus Mata Pelajaran ini?')) {
            deleteSubject(subjectId);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kelola Mata Pelajaran</h2>
                {!isFormVisible && (
                     <button onClick={() => setIsFormVisible(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Mapel
                    </button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-md border space-y-4">
                    <h3 className="text-lg font-medium">{editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Mata Pelajaran</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Kategori</label>
                            <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" required>
                                <option value="Wajib">Wajib</option>
                                <option value="Pilihan">Pilihan</option>
                                <option value="Mulok">Mulok</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            {editingSubject ? 'Update Mapel' : 'Simpan Mapel'}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mata Pelajaran</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[...subjects].sort((a,b) => a.name.localeCompare(b.name)).map(s => (
                            <tr key={s.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEditClick(s)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
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

export default SubjectManager;