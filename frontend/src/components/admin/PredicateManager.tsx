import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { GradePredicate } from '../../types';

const EMPTY_PREDICATE_FORM = { threshold: 0, description: '' };

const PredicateManager: React.FC = () => {
    const { gradePredicates, addGradePredicate, updateGradePredicate, deleteGradePredicate } = useData();
    const [formData, setFormData] = useState(EMPTY_PREDICATE_FORM);
    const [editingPredicate, setEditingPredicate] = useState<GradePredicate | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        if (editingPredicate) {
            setFormData({ threshold: editingPredicate.threshold, description: editingPredicate.description });
            setIsFormVisible(true);
        } else {
            setFormData(EMPTY_PREDICATE_FORM);
        }
    }, [editingPredicate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'threshold' ? Number(value) : value });
    };

    const handleCancelEdit = () => {
        setEditingPredicate(null);
        setIsFormVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description) {
            alert('Deskripsi Predikat tidak boleh kosong.');
            return;
        }

        if (editingPredicate) {
            updateGradePredicate({ ...editingPredicate, ...formData });
        } else {
            addGradePredicate(formData);
        }
        setEditingPredicate(null);
        setIsFormVisible(false);
    };

    const handleEditClick = (predicate: GradePredicate) => {
        setEditingPredicate(predicate);
    };

    const handleDeleteClick = (predicateId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus Predikat ini?')) {
            deleteGradePredicate(predicateId);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kelola Predikat Nilai</h2>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Predikat
                    </button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-md border space-y-4">
                    <h3 className="text-lg font-medium">{editingPredicate ? 'Edit Predikat' : 'Tambah Predikat Baru'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">Nilai Minimum (Threshold)</label>
                            <input type="number" id="threshold" name="threshold" value={formData.threshold} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Predikat</label>
                            <input type="text" id="description" name="description" value={formData.description} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            {editingPredicate ? 'Update' : 'Simpan'}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentang Nilai</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {gradePredicates.map((predicate, index) => {
                            const nextPredicate = gradePredicates[index - 1];
                            const range = nextPredicate ? `${predicate.threshold} - ${nextPredicate.threshold - 1}` : `>= ${predicate.threshold}`;
                            return (
                                <tr key={predicate.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{range}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{predicate.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleEditClick(predicate)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => handleDeleteClick(predicate.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PredicateManager;