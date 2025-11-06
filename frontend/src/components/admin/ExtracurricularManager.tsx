import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Extracurricular, ExtracurricularPredicate } from '../../types';

const EMPTY_EXTRA_FORM = { name: '' };
const EMPTY_PREDICATE_FORM = { predicate: '', description: '' };

const PredicateEditor: React.FC<{
    extracurricularId: string;
    predicates: ExtracurricularPredicate[];
    onAdd: (data: Omit<ExtracurricularPredicate, 'id' | 'extracurricularId'>) => void;
    onUpdate: (data: ExtracurricularPredicate) => void;
    onDelete: (id: string) => void;
}> = ({ extracurricularId, predicates, onAdd, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState(EMPTY_PREDICATE_FORM);
    const [editing, setEditing] = useState<ExtracurricularPredicate | null>(null);

    useEffect(() => {
        setEditing(null);
        setFormData(EMPTY_PREDICATE_FORM);
    }, [extracurricularId]);

    useEffect(() => {
        if (editing) {
            setFormData({ predicate: editing.predicate, description: editing.description });
        } else {
            setFormData(EMPTY_PREDICATE_FORM);
        }
    }, [editing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.predicate || !formData.description) {
            alert("Predikat dan Deskripsi harus diisi.");
            return;
        }
        if (editing) {
            onUpdate({ ...editing, ...formData });
        } else {
            onAdd(formData);
        }
        setEditing(null);
        setFormData(EMPTY_PREDICATE_FORM);
    };

    return (
        <div className="mt-4 p-4 border rounded-md bg-white">
            <h4 className="text-md font-semibold mb-2">Kelola Predikat & Deskripsi</h4>
            <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium">Predikat (A/B/C)</label>
                        <input type="text" value={formData.predicate} onChange={e => setFormData({...formData, predicate: e.target.value.toUpperCase()})} maxLength={1} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Deskripsi Otomatis</label>
                        <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">{editing ? 'Update' : 'Tambah'}</button>
                    {editing && <button type="button" onClick={() => setEditing(null)} className="px-4 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400">Batal</button>}
                </div>
            </form>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr><th className="px-2 py-1 text-left">Predikat</th><th className="px-2 py-1 text-left">Deskripsi</th><th className="px-2 py-1 text-left">Aksi</th></tr></thead>
                <tbody>
                    {predicates.map(p => (
                        <tr key={p.id}>
                            <td className="px-2 py-1 font-bold">{p.predicate}</td>
                            <td className="px-2 py-1">{p.description}</td>
                            <td className="px-2 py-1 space-x-2">
                                <button onClick={() => setEditing(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const ExtracurricularManager: React.FC = () => {
    const { extracurriculars, extracurricularPredicates, addExtracurricular, updateExtracurricular, deleteExtracurricular, addExtracurricularPredicate, updateExtracurricularPredicate, deleteExtracurricularPredicate } = useData();
    const [formData, setFormData] = useState(EMPTY_EXTRA_FORM);
    const [editing, setEditing] = useState<Extracurricular | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedExtra, setSelectedExtra] = useState<Extracurricular | null>(null);

    useEffect(() => {
        if (editing) {
            setFormData({ name: editing.name });
            setIsFormVisible(true);
        } else {
            setFormData(EMPTY_EXTRA_FORM);
        }
    }, [editing]);

    const handleCancel = () => {
        setEditing(null);
        setIsFormVisible(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Nama Ekstrakurikuler tidak boleh kosong.');
            return;
        }

        if (editing) {
            updateExtracurricular({ ...editing, ...formData });
        } else {
            addExtracurricular(formData);
        }
        handleCancel();
    };

    const handleDeleteClick = (id: string) => {
        if (window.confirm('Yakin ingin menghapus ekstrakurikuler ini beserta semua predikatnya?')) {
            deleteExtracurricular(id);
            if (selectedExtra?.id === id) setSelectedExtra(null);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kelola Ekstrakurikuler & Predikat</h2>
                {!isFormVisible && (
                    <button onClick={() => setIsFormVisible(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        + Tambah Kegiatan
                    </button>
                )}
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-md border space-y-4">
                    <h3 className="text-lg font-medium">{editing ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</h3>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Kegiatan</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={e => setFormData({ name: e.target.value })} className="mt-1 block w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">{editing ? 'Update' : 'Simpan'}</button>
                        <button type="button" onClick={handleCancel} className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Batal</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Ekstrakurikuler</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {extracurriculars.map(item => (
                            <tr key={item.id} onClick={() => setSelectedExtra(item)} className={`cursor-pointer hover:bg-blue-50 ${selectedExtra?.id === item.id ? 'bg-blue-100' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); setEditing(item); }} className="text-indigo-600 hover:text-indigo-900">Edit Nama</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id); }} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!selectedExtra && (
                <div className="mt-6 p-4 text-center bg-blue-100 border border-blue-200 text-blue-800 rounded-lg">
                    <p className="font-semibold">Pilih salah satu kegiatan di atas untuk mengelola predikat dan deskripsinya.</p>
                </div>
            )}

            {selectedExtra && (
                <PredicateEditor 
                    extracurricularId={selectedExtra.id}
                    predicates={extracurricularPredicates.filter(p => p.extracurricularId === selectedExtra.id)}
                    onAdd={(data) => addExtracurricularPredicate({ ...data, extracurricularId: selectedExtra.id })}
                    onUpdate={updateExtracurricularPredicate}
                    onDelete={deleteExtracurricularPredicate}
                />
            )}
        </div>
    );
};

export default ExtracurricularManager;