import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ClassData } from '../../types';

const EMPTY_CLASS_FORM = { name: '', teacherId: '', fase: '' };

const ClassManager: React.FC = () => {
    const { classes, teachers, addClass, updateClass, deleteClass } = useData();
    const [formData, setFormData] = useState(EMPTY_CLASS_FORM);
    const [editingClass, setEditingClass] = useState<ClassData | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        if (editingClass) {
            setFormData({ name: editingClass.name, teacherId: editingClass.teacherId, fase: editingClass.fase });
            setIsFormVisible(true);
        } else {
            setFormData(EMPTY_CLASS_FORM);
        }
    }, [editingClass]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        setEditingClass(null);
        setIsFormVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.teacherId || !formData.fase) {
            alert('Harap isi semua kolom.');
            return;
        }

        if (editingClass) {
            updateClass({ ...editingClass, ...formData });
        } else {
            addClass(formData);
        }
        setEditingClass(null);
        setIsFormVisible(false);
    };

    const handleEditClick = (classData: ClassData) => {
        setEditingClass(classData);
    };

    const handleDeleteClick = (classId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus Kelas ini?')) {
            deleteClass(classId);
        }
    };
    
    const classesWithDetails = useMemo(() => {
        return classes.map(c => ({
            ...c,
            teacherName: teachers.find(t => t.id === c.teacherId)?.name || 'N/A',
        })).sort((a,b) => a.name.localeCompare(b.name));
    }, [classes, teachers]);


    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kelola Kelas</h2>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Kelas
                    </button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-md border space-y-4">
                    <h3 className="text-lg font-medium">{editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kelas</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="fase" className="block text-sm font-medium text-gray-700">Fase (A/B/C)</label>
                            <input type="text" id="fase" name="fase" value={formData.fase} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Wali Kelas</label>
                            <select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" required>
                                <option value="" disabled>-- Pilih Guru --</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            {editingClass ? 'Update' : 'Simpan'}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fase</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wali Kelas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {classesWithDetails.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.fase}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.teacherName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEditClick(c)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeleteClick(c.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClassManager;