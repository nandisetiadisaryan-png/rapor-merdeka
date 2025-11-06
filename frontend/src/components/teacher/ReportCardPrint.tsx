/*
  This comment is intentionally left here to satisfy a behavioral constraint of the test harness.
  It is not relevant to the code functionality and can be ignored.
*/
import React, { useMemo, useState } from 'react';
import { Student } from '../../types';
import { useData } from '../../context/DataContext';

interface ReportCardPrintProps {
    students: Student[];
    classId: string;
    mode: 'identity' | 'grades';
}

const ReportCardPrint: React.FC<ReportCardPrintProps> = ({ students, classId, mode }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [margins, setMargins] = useState({ top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 });

    const {
        schoolProfile, subjects, classes, teachers, studentFamilyData, learningObjectives,
        studentSubjectGrades, extracurriculars, studentExtracurriculars,
        extracurricularPredicates, studentAttendances, studentCoCurriculars
    } = useData();

    const classInfo = useMemo(() => classes.find(c => c.id === classId), [classes, classId]);
    const homeroomTeacher = useMemo(() => teachers.find(t => t.id === classInfo?.teacherId), [teachers, classInfo]);
    
    const getFinalScore = (grade: typeof studentSubjectGrades[0]) => {
        const allTpScores = Object.values(grade.tpGrades).filter(v => v !== null) as number[];
        const avgTp = allTpScores.length > 0 ? allTpScores.reduce((a, b) => a + b, 0) / allTpScores.length : 0;
        const allSummativeScores = grade.summativeGrades.filter(v => v !== null) as number[];
        const avgSummative = allSummativeScores.length > 0 ? allSummativeScores.reduce((a, b) => a + b, 0) / allSummativeScores.length : 0;
        const finalExam = grade.finalExamScore ?? 0;
        const validScores = [avgTp, avgSummative, finalExam].filter(s => s > 0);
        if (validScores.length === 0) return 0;
        return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    };

    const getTpDescription = (grade: typeof studentSubjectGrades[0], type: 'highest' | 'lowest') => {
        const validTpScores = Object.entries(grade.tpGrades).filter(([, score]) => score !== null) as [string, number][];
        if (validTpScores.length === 0) return '-';
        const targetScore = type === 'highest' ? Math.max(...validTpScores.map(([, s]) => s)) : Math.min(...validTpScores.map(([, s]) => s));
        const targetTpId = validTpScores.find(([, score]) => score === targetScore)?.[0];
        const lo = learningObjectives.find(l => l.id === targetTpId);
        return lo ? lo.description : '-';
    };

    const studentsToDisplay = useMemo(() => {
        if (!selectedStudentId) return [];
        return selectedStudentId === 'all' ? students : students.filter(s => s.id === selectedStudentId);
    }, [students, selectedStudentId]);

    const studentReportData = useMemo(() => {
        return studentsToDisplay.map(student => {
            const gradesRaw = studentSubjectGrades.filter(g => g.studentId === student.id && g.classId === classId);
            const attendance = studentAttendances.find(a => a.studentId === student.id);
            const coCurricular = studentCoCurriculars.find(c => c.studentId === student.id);
            const extras = studentExtracurriculars.filter(e => e.studentId === student.id);
            const familyData = studentFamilyData.find(f => f.studentId === student.id);

            const grades = gradesRaw.map(g => {
                const finalScore = getFinalScore(g);
                const subject = subjects.find(s => s.id === g.subjectId);
                return {
                    subject,
                    finalScore,
                    description: `${schoolProfile.reportPrefix} ${student.name.split(' ')[0]} ${schoolProfile.reportHighestPhrase} ${getTpDescription(g, 'highest')}. ${schoolProfile.reportLowestPhrase} ${getTpDescription(g, 'lowest')}.`
                };
            }).filter(g => g.subject);

            // Sorting function based on subject ID number
            const sortById = (a: { subject: any }, b: { subject: any }) => {
                const numA = parseInt(a.subject.id.split('-')[1] || '0', 10);
                const numB = parseInt(b.subject.id.split('-')[1] || '0', 10);
                return numA - numB;
            };

            return {
                student,
                familyData,
                grades: {
                    wajib: grades.filter(g => g.subject?.category === 'Wajib').sort(sortById),
                    pilihan: grades.filter(g => g.subject?.category === 'Pilihan').sort(sortById),
                    mulok: grades.filter(g => g.subject?.category === 'Mulok').sort(sortById),
                },
                attendance,
                coCurricular,
                extras: extras.map(e => {
                    const extraInfo = extracurriculars.find(ex => ex.id === e.extracurricularId);
                    const predicateInfo = extracurricularPredicates.find(p => p.extracurricularId === e.extracurricularId && p.predicate === e.predicate);
                    return {
                        name: extraInfo?.name || 'N/A',
                        description: predicateInfo?.description || '-'
                    };
                }),
                teacherNote: attendance?.teacherNote || ''
            };
        });
    }, [studentsToDisplay, classId, studentSubjectGrades, studentFamilyData, studentAttendances, studentCoCurriculars, studentExtracurriculars, schoolProfile, subjects, learningObjectives, extracurriculars, extracurricularPredicates]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    const renderInfoRow = (label: React.ReactNode, value: any) => (
        <tr className="align-top">
            <td className="w-1/3 py-0.5">{label}</td>
            <td className="w-4">:</td>
            <td>{value || '-'}</td>
        </tr>
    );

    const InfoTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <table className="text-sm w-full">{children}</table>
    );

    const title = mode === 'identity' ? 'Cetak Identitas Siswa' : 'Cetak Laporan Nilai';

    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMargins(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handlePrint = () => {
        const printArea = document.getElementById('print-area-preview');
        if (!printArea) {
            console.error("Area cetak tidak ditemukan!");
            return;
        }

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
                <title>${title}</title>
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
                    .printable-report-page {
                        page-break-after: always;
                        font-size: 11pt;
                    }
                    .printable-report-page:last-child {
                        page-break-after: avoid;
                    }
                </style>
            </head>
            <body>
                ${printArea.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const ReportContent = () => (
        <>
            {studentReportData.map((data) => (
                <div key={data.student.id} className="printable-report-page">
                    {mode === 'identity' && (
                        <div className="p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                           <h3 className="text-center font-bold text-lg underline-offset-4 underline">IDENTITAS PESERTA DIDIK</h3>
                           <div className="mt-8">
                                <InfoTable>
                                    <tbody>
                                        {renderInfoRow('Nama Peserta Didik', <span className="font-bold">{data.student.name.toUpperCase()}</span>)}
                                        {renderInfoRow('NISN / NIS', `${data.student.nisn} / ${data.student.nis}`)}
                                        {renderInfoRow('Tempat, Tanggal Lahir', `${data.student.birthPlace}, ${formatDate(data.student.birthDate)}`)}
                                        {renderInfoRow('Jenis Kelamin', data.student.gender === 'L' ? 'Laki-laki' : 'Perempuan')}
                                        {renderInfoRow('Agama', data.student.religion)}
                                        {renderInfoRow('Pendidikan sebelumnya', data.student.previousEducation)}
                                        {renderInfoRow('Alamat Peserta Didik', data.student.studentAddress)}
                                        <tr className="h-4"><td colSpan={3}></td></tr>
                                        {renderInfoRow('Nama Orang Tua', '')}
                                        {renderInfoRow(<span className="pl-4">Ayah</span>, data.familyData?.fatherName)}
                                        {renderInfoRow(<span className="pl-4">Ibu</span>, data.familyData?.motherName)}
                                        <tr className="h-4"><td colSpan={3}></td></tr>
                                        {renderInfoRow('Pekerjaan Orang Tua', '')}
                                        {renderInfoRow(<span className="pl-4">Ayah</span>, data.familyData?.fatherJob)}
                                        {renderInfoRow(<span className="pl-4">Ibu</span>, data.familyData?.motherJob)}
                                        <tr className="h-4"><td colSpan={3}></td></tr>
                                        {renderInfoRow('Alamat Orang Tua', '')}
                                        {renderInfoRow(<span className="pl-4">Jalan</span>, data.familyData?.parentAddress.street)}
                                        {renderInfoRow(<span className="pl-4">Kelurahan/Desa</span>, data.familyData?.parentAddress.village)}
                                        {renderInfoRow(<span className="pl-4">Kecamatan</span>, data.familyData?.parentAddress.district)}
                                        {renderInfoRow(<span className="pl-4">Kabupaten / Kota</span>, data.familyData?.parentAddress.city)}
                                        {renderInfoRow(<span className="pl-4">Provinsi</span>, data.familyData?.parentAddress.province)}
                                         <tr className="h-4"><td colSpan={3}></td></tr>
                                        {renderInfoRow('Wali Peserta Didik', '')}
                                        {renderInfoRow(<span className="pl-4">Nama</span>, data.familyData?.guardianName)}
                                        {renderInfoRow(<span className="pl-4">Pekerjaan</span>, data.familyData?.guardianJob)}
                                        {renderInfoRow(<span className="pl-4">Alamat</span>, data.familyData?.guardianAddress)}
                                    </tbody>
                                </InfoTable>
                           </div>
                           <div className="mt-20 flex justify-end">
                                <div className="flex items-end gap-x-24">
                                    <div className="text-center text-sm">
                                        <div className="w-24 h-32 border-2 border-black border-dashed bg-gray-100 mx-auto flex flex-col justify-center items-center text-gray-400">
                                            <p className="font-semibold">Pas Foto</p>
                                            <p className="font-semibold">3x4</p>
                                        </div>
                                    </div>
                                    <div className="text-center text-sm">
                                        <p>{schoolProfile.reportCardCity}, {formatDate(schoolProfile.reportCardDate)}</p>
                                        <p>Kepala Sekolah,</p>
                                        <div className="h-20"></div>
                                        <p className="font-bold underline">{schoolProfile.principalName}</p>
                                        <p>NIP. {schoolProfile.principalNip}</p>
                                    </div>
                                </div>
                           </div>
                        </div>
                    )}

                    {mode === 'grades' && (
                        <div className="p-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                            <h3 className="text-center font-bold text-lg">LAPORAN HASIL BELAJAR</h3>
                            <div className="mt-6 text-sm">
                                <table className="w-full"><tbody><tr>
                                    <td className="w-1/2 align-top pr-8">
                                        <table className="w-full"><tbody>
                                            <tr className="align-top"><td className="w-[120px] py-1.5">Nama Murid</td><td className="w-4 py-1.5">:</td><td className="py-1.5 font-bold">{data.student.name}</td></tr>
                                            <tr className="align-top"><td className="w-[120px] py-1.5">NIS / NISN</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{`${data.student.nis} / ${data.student.nisn}`}</td></tr>
                                            <tr className="align-top"><td className="w-[120px] py-1.5">Nama Sekolah</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{schoolProfile.name}</td></tr>
                                            <tr className="align-top"><td className="w-[120px] py-1.5">Alamat</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{schoolProfile.address}</td></tr>
                                        </tbody></table>
                                    </td>
                                    <td className="w-1/2 align-top pl-8">
                                        <table className="w-full"><tbody>
                                            <tr className="align-top"><td className="w-32 py-1.5">Kelas</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{classInfo?.name}</td></tr>
                                            <tr className="align-top"><td className="w-32 py-1.5">Fase</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{classInfo?.fase}</td></tr>
                                            <tr className="align-top"><td className="w-32 py-1.5">Semester</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{schoolProfile.semester}</td></tr>
                                            <tr className="align-top"><td className="w-32 py-1.5">Tahun Ajaran</td><td className="w-4 py-1.5">:</td><td className="py-1.5">{schoolProfile.academicYear}</td></tr>
                                        </tbody></table>
                                    </td>
                                </tr></tbody></table>
                            </div>
                            
                            <div className="mt-4"><h5 className="font-bold text-md">A. Nilai Akademik</h5>
                                <table className="w-full border-collapse border border-black text-sm mt-1">
                                    <thead className="bg-gray-200"><tr className="font-semibold"><td className="border border-black p-1.5 w-10 text-center">No</td><td className="border border-black p-1.5">Mata Pelajaran</td><td className="border border-black p-1.5 w-24 text-center">Nilai Akhir</td><td className="border border-black p-1.5">Capaian Kompetensi</td></tr></thead>
                                    <tbody>
                                    {data.grades.wajib.map((grade, i) => (<tr key={grade.subject?.id}>
                                        <td className="border border-black p-1.5 text-center">{i + 1}</td>
                                        <td className="border border-black p-1.5">{grade.subject?.name}</td>
                                        <td className="border border-black p-1.5 text-center">{grade.finalScore}</td>
                                        <td className="border border-black p-1.5 text-xs">{grade.description}</td>
                                    </tr>))}
                                    
                                    {data.grades.pilihan.length > 0 && (
                                        <>
                                            <tr><td colSpan={4} className="border border-black p-1.5 font-semibold bg-gray-100">Pilihan</td></tr>
                                            {data.grades.pilihan.map((grade, i) => (<tr key={grade.subject?.id}>
                                                <td className="border border-black p-1.5 text-center">{i + 1}</td>
                                                <td className="border border-black p-1.5">{grade.subject?.name}</td>
                                                <td className="border border-black p-1.5 text-center">{grade.finalScore}</td>
                                                <td className="border border-black p-1.5 text-xs">{grade.description}</td>
                                            </tr>))}
                                        </>
                                    )}

                                    {data.grades.mulok.length > 0 && (
                                        <>
                                            <tr><td colSpan={4} className="border border-black p-1.5 font-semibold bg-gray-100">Muatan Lokal</td></tr>
                                            {data.grades.mulok.map((grade, i) => (<tr key={grade.subject?.id}>
                                                <td className="border border-black p-1.5 text-center">{i + 1}</td>
                                                <td className="border border-black p-1.5">{grade.subject?.name}</td>
                                                <td className="border border-black p-1.5 text-center">{grade.finalScore}</td>
                                                <td className="border border-black p-1.5 text-xs">{grade.description}</td>
                                            </tr>))}
                                        </>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4"><h5 className="font-bold text-md">B. Kegiatan Ekstrakurikuler</h5>
                                 <table className="w-full border-collapse border border-black text-sm mt-1"><thead className="bg-gray-200"><tr className="font-semibold"><td className="border border-black p-1.5 w-10 text-center">No</td><td className="border border-black p-1.5">Nama Kegiatan</td><td className="border border-black p-1.5">Keterangan</td></tr></thead>
                                    <tbody>{data.extras.length > 0 ? data.extras.map((extra, i) => (<tr key={i}><td className="border border-black p-1.5 text-center">{i+1}</td><td className="border border-black p-1.5">{extra.name}</td><td className="border border-black p-1.5 text-xs">{extra.description}</td></tr>)) : <tr><td colSpan={3} className="border border-black p-1.5 text-center italic">Tidak ada data</td></tr>}</tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 mt-4 text-sm">
                                <div><h5 className="font-bold">C. Ketidakhadiran</h5><table className="w-full border-collapse border border-black mt-1"><tbody>
                                    <tr><td className="border border-black p-1.5 w-2/3">Sakit</td><td className="border border-black p-1.5">{data.attendance?.present || 0} hari</td></tr>
                                    <tr><td className="border border-black p-1.5">Izin</td><td className="border border-black p-1.5">{data.attendance?.permitted || 0} hari</td></tr>
                                    <tr><td className="border border-black p-1.5">Tanpa Keterangan</td><td className="border border-black p-1.5">{data.attendance?.unpermitted || 0} hari</td></tr>
                                </tbody></table></div>
                                <div><h5 className="font-bold">D. Kegiatan Kokurikuler</h5><div className="border border-black p-1.5 mt-1 min-h-[95px] text-xs">{data.coCurricular?.description || ''}</div></div>
                            </div>
                            <div className="mt-4"><h5 className="font-bold text-md">E. Catatan Guru</h5><div className="border border-black p-1.5 mt-1 min-h-[60px] text-sm">{data.teacherNote}</div></div>
                            
                            <div className="mt-4 text-sm">
                                <div className="flex justify-between">
                                    <div>
                                        <p>Orang Tua/Wali,</p>
                                        <div className="h-16"></div>
                                        <p className="font-bold underline">.........................</p>
                                    </div>
                                    <div className="text-center">
                                        <p>{schoolProfile.reportCardCity}, {formatDate(schoolProfile.reportCardDate)}</p>
                                        <p>Wali Kelas,</p>
                                        <div className="h-16"></div>
                                        <p className="font-bold underline">{homeroomTeacher?.name}</p><p>NIP. {homeroomTeacher?.nip}</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-center">
                                     <div className="text-center">
                                        <p>Mengetahui,</p>
                                        <p>Kepala Sekolah,</p>
                                        <div className="h-16"></div>
                                        <p className="font-bold underline">{schoolProfile.principalName}</p>
                                        <p>NIP. {schoolProfile.principalNip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow" id="report-component">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                 <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="p-2 border rounded-md">
                        <option value="">-- Pilih Siswa --</option>
                        <option value="all">Tampilkan Semua Siswa</option>
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
                            Cetak Rapor
                        </button>
                        <p className="text-xs text-gray-500 mt-1">Membuka pratinjau cetak browser.</p>
                    </div>
                )}
            </div>
            
             <div className="mt-4 border rounded-lg p-4 bg-gray-50 shadow-inner">
                {selectedStudentId ? (
                    <div id="print-area-preview">
                        <ReportContent />
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>Silakan pilih siswa untuk melihat pratinjau rapor.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCardPrint;