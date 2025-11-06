import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Teacher, User } from '../../types';

const EMPTY_TEACHER_FORM = { name: '', nip: '', username: '', password: '' };

const TeacherManager: React.FC = () => {
    const { teachers, users, addTeacher, updateTeacher, deleteTeacher } = useData();
    const [formData, setFormData] = useState(EMPTY_TEACHER_FORM);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const teacherUsers = useMemo(() => {
        return teachers.map(teacher => {
            const user = users.find(u => u.id === teacher.userId);
            return {
                ...teacher,
                username: user?.username || 'N/A',
            };
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [teachers, users]);

    useEffect(() => {
        if (editingTeacher) {
            const user = users.find(u => u.id === editingTeacher.userId);
            setFormData({
                name: editingTeacher.name,
                nip: editingTeacher.nip,
                username: user?.username || '',
                password: '', // Password is not shown, only for update
            });
            setIsFormVisible(true);
        } else {
            setFormData(EMPTY_TEACHER_FORM);
        }
    }, [editingTeacher, users]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancelEdit = () => {
        setEditingTeacher(null);
        setIsFormVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.nip || !formData.username) {
            alert('Harap isi Nama, NIP, dan Username.');
            return;
        }
        if (!editingTeacher && !formData.password) {
            alert('Password wajib diisi untuk guru baru.');
            return;
        }

        const submitData = {
            name: formData.name,
            nip: formData.nip,
            username: formData.username,
            ...(formData.password && { password: formData.password }),
        };

        if (editingTeacher) {
            // FIX: The updateTeacher function expects a userId, which was missing from the payload. Added userId from editingTeacher.
            updateTeacher(editingTeacher.id, { ...submitData, userId: editingTeacher.userId });
        } else {
            addTeacher(submitData);
        }
        setEditingTeacher(null);
        setIsFormVisible(false);
    };

    const handleEditClick = (teacher: Teacher) => {
        setEditingTeacher(teacher);
    };

    const handleDeleteClick = (teacherId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data Guru ini? Akun login yang terkait juga akan dihapus.')) {
            deleteTeacher(teacherId);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kelola Guru dan Pengguna</h2>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Guru
                    </button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-md border space-y-4">
                    <h3 className="text-lg font-medium">{editingTeacher ? 'Edit Guru' : 'Tambah Guru Baru'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="nip" className="block text-sm font-medium text-gray-700">NIP</label>
                            <input type="text" id="nip" name="nip" value={formData.nip} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                         <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder={editingTeacher ? 'Isi untuk mengubah' : ''} required={!editingTeacher} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            {editingTeacher ? 'Update' : 'Simpan'}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Guru</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teacherUsers.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.nip}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEditClick(t)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeleteClick(t.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherManager;