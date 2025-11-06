

// Fix: Provide full content for SchoolProfileManager.tsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { SchoolProfile } from '../../types';

const SchoolProfileManager: React.FC = () => {
    // FIX: Correctly used updateSchoolProfile from context which was causing a property not exist error.
    const { schoolProfile, updateSchoolProfile } = useData();
    const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);

    useEffect(() => {
        setFormData(schoolProfile);
    }, [schoolProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Used the correct update function from context.
        updateSchoolProfile(formData);
        alert('Profil sekolah berhasil diperbarui!');
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Kelola Profil Sekolah</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Identitas Sekolah</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="npsn" className="block text-sm font-medium text-gray-700">NPSN</label>
                            <input type="text" id="npsn" name="npsn" value={formData.npsn} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="nss" className="block text-sm font-medium text-gray-700">NSS</label>
                            <input type="text" id="nss" name="nss" value={formData.nss} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="principalName" className="block text-sm font-medium text-gray-700">Nama Kepala Sekolah</label>
                            <input type="text" id="principalName" name="principalName" value={formData.principalName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="principalNip" className="block text-sm font-medium text-gray-700">NIP Kepala Sekolah</label>
                            <input type="text" id="principalNip" name="principalNip" value={formData.principalNip} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Sekolah</label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">No. Telepon</label>
                            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Pengaturan Rapor</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
                            <input type="text" id="academicYear" name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., 2023/2024" />
                        </div>
                        <div>
                            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">Semester</label>
                            <select id="semester" name="semester" value={formData.semester} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="reportCardCity" className="block text-sm font-medium text-gray-700">Kota/Kabupaten untuk Rapor</label>
                            <input type="text" id="reportCardCity" name="reportCardCity" value={formData.reportCardCity} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Cirebon" />
                        </div>
                        <div>
                            <label htmlFor="reportCardDate" className="block text-sm font-medium text-gray-700">Tanggal Cetak Rapor</label>
                            <input type="date" id="reportCardDate" name="reportCardDate" value={formData.reportCardDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div className="md:col-span-2">
                             <h4 className="text-md font-medium text-gray-800 border-b pb-2 mb-2">Teks Narasi Rapor</h4>
                        </div>
                        <div>
                            <label htmlFor="reportPrefix" className="block text-sm font-medium text-gray-700">Kata Sapaan (contoh: Ananda)</label>
                            <input type="text" id="reportPrefix" name="reportPrefix" value={formData.reportPrefix} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                         <div>
                            <label htmlFor="reportHighestPhrase" className="block text-sm font-medium text-gray-700">Frasa Capaian Tertinggi</label>
                            <input type="text" id="reportHighestPhrase" name="reportHighestPhrase" value={formData.reportHighestPhrase} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="reportLowestPhrase" className="block text-sm font-medium text-gray-700">Frasa Perlu Peningkatan</label>
                            <input type="text" id="reportLowestPhrase" name="reportLowestPhrase" value={formData.reportLowestPhrase} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border p-4 rounded-md">
                     <legend className="text-lg font-semibold px-2">Aset Visual</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="loginLogoUrl" className="block text-sm font-medium text-gray-700">URL Logo Halaman Login</label>
                            <input type="text" id="loginLogoUrl" name="loginLogoUrl" value={formData.loginLogoUrl} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="reportCoverLogoUrl" className="block text-sm font-medium text-gray-700">URL Logo Cover Rapor</label>
                            <input type="text" id="reportCoverLogoUrl" name="reportCoverLogoUrl" value={formData.reportCoverLogoUrl} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                </fieldset>

                <div className="pt-4">
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SchoolProfileManager;