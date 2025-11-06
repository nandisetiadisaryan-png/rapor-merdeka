import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';

interface ReportCoverPrintProps {
    students: Student[];
    classId: string;
}

const ReportCoverPrint: React.FC<ReportCoverPrintProps> = ({ students, classId }) => {
    const { schoolProfile } = useData();
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [margins, setMargins] = useState({ top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 });
    
    const studentsToDisplay = useMemo(() => {
        if (!selectedStudentId) return [];
        return selectedStudentId === 'all' ? students : students.filter(s => s.id === selectedStudentId);
    }, [students, selectedStudentId]);

    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMargins(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handlePrint = () => {
        const printArea = document.getElementById('print-cover-area-preview');
        if (!printArea) return;

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => el.outerHTML)
            .join('');

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) {
            alert("Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Cover Rapor</title>
                <script src="https://cdn.tailwindcss.com"></script>
                ${styles}
                <style>
                    @page {
                        size: 8.5in 13in;
                        margin: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
                    }
                    body {
                        margin: 0;
                        font-family: 'Times New Roman', serif;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    .printable-cover-page {
                        page-break-after: always;
                        box-sizing: border-box;
                    }
                     .printable-cover-page:last-child {
                        page-break-after: avoid;
                    }
                </style>
            </head>
            <body>${printArea.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const ReportCoverContent = () => (
        <>
            {studentsToDisplay.map(student => (
                <div key={student.id} className="printable-cover-page h-[12in] flex flex-col justify-between items-center p-8 border-4 border-double border-black" style={{ fontFamily: "'Times New Roman', serif" }}>
                    <div className="w-full text-center space-y-4">
                        <img 
                            src={schoolProfile.reportCoverLogoUrl} 
                            alt="Logo Sekolah" 
                            className="w-40 h-40 mx-auto object-contain" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <h1 className="text-3xl font-bold">LAPORAN HASIL BELAJAR</h1>
                        <h2 className="text-3xl font-bold">(RAPOR)</h2>
                    </div>

                    <div className="w-full text-center space-y-4">
                        <h3 className="text-2xl font-bold">{schoolProfile.name.toUpperCase()}</h3>
                        <p className="text-md">{schoolProfile.address}</p>
                    </div>

                    <div className="w-full max-w-md text-center space-y-6 text-xl">
                        <div className="space-y-2">
                             <p className="font-semibold">Nama Peserta Didik:</p>
                             <div className="border-b-2 border-dotted border-black p-2 text-center font-bold">{student.name.toUpperCase()}</div>
                        </div>
                         <div className="space-y-2">
                             <p className="font-semibold">NISN / NIS:</p>
                             <div className="border-b-2 border-dotted border-black p-2 text-center font-bold">{`${student.nisn || '-'} / ${student.nis || '-'}`}</div>
                        </div>
                    </div>
                    
                    <div className="w-full text-center">
                        <h3 className="text-2xl font-bold">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN,</h3>
                        <h3 className="text-2xl font-bold">RISET, DAN TEKNOLOGI</h3>
                        <h3 className="text-2xl font-bold">REPUBLIK INDONESIA</h3>
                    </div>
                </div>
            ))}
        </>
    );

    return (
         <div className="bg-white p-4 rounded-lg shadow" id="report-cover-component">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">Cetak Cover Rapor</h2>
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="p-2 border rounded-md">
                        <option value="">-- Pilih Siswa --</option>
                        <option value="all">Cetak Semua Siswa</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                
                <div className="p-3 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Pengaturan Jarak Tepi Cetak</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label htmlFor="margin-top" className="block text-xs font-medium text-gray-600">Atas (inci)</label>
                            <input type="number" name="top" id="margin-top" value={margins.top} onChange={handleMarginChange} step="0.1" className="mt-1 p-2 border rounded-md w-full text-sm" />
                        </div>
                         <div>
                            <label htmlFor="margin-bottom" className="block text-xs font-medium text-gray-600">Bawah (inci)</label>
                            <input type="number" name="bottom" id="margin-bottom" value={margins.bottom} onChange={handleMarginChange} step="0.1" className="mt-1 p-2 border rounded-md w-full text-sm" />
                        </div>
                         <div>
                            <label htmlFor="margin-left" className="block text-xs font-medium text-gray-600">Kiri (inci)</label>
                            <input type="number" name="left" id="margin-left" value={margins.left} onChange={handleMarginChange} step="0.1" className="mt-1 p-2 border rounded-md w-full text-sm" />
                        </div>
                         <div>
                            <label htmlFor="margin-right" className="block text-xs font-medium text-gray-600">Kanan (inci)</label>
                            <input type="number" name="right" id="margin-right" value={margins.right} onChange={handleMarginChange} step="0.1" className="mt-1 p-2 border rounded-md w-full text-sm" />
                        </div>
                    </div>
                </div>

                {selectedStudentId && (
                     <div className="text-right">
                        <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                            Cetak Cover
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 border rounded-lg p-4 bg-gray-50 shadow-inner">
                {selectedStudentId ? (
                    <div id="print-cover-area-preview">
                        <ReportCoverContent />
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>Silakan pilih siswa untuk melihat pratinjau cover rapor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCoverPrint;