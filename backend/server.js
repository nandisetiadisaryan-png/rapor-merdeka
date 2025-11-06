// backend/server.js

const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
const PORT = 3001;

// MIDDLEWARE
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));

// Helper untuk mengubah snake_case (db) ke camelCase (frontend)
const toCamelCase = (rows) => {
    if (!rows) return [];
    // Ensure we are always working with an array
    const data = Array.isArray(rows) ? rows : [rows];
    return data.map(row => {
        if (row === null || typeof row !== 'object') return row;
        const newRow = {};
        for (let key in row) {
            // Check for own properties to avoid iterating over prototype properties
            if (Object.prototype.hasOwnProperty.call(row, key)) {
                const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                // FIX: Correctly assign the value from the original key (`key`) to the new key (`newKey`)
                newRow[newKey] = row[key];
            }
        }
        return newRow;
    });
};

// Helper untuk mengubah camelCase (frontend) ke snake_case (db)
const toSnakeCase = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    const newObj = {};
    for (let key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            newObj[newKey] = obj[key];
        }
    }
    return newObj;
};

// Helper to parse JSON fields from DB
const parseJsonFields = (rows, fields) => {
    return rows.map(row => {
        const newRow = { ...row };
        fields.forEach(field => {
            if (newRow[field] && typeof newRow[field] === 'string') {
                try {
                    newRow[field] = JSON.parse(newRow[field]);
                } catch (e) {
                    console.warn(`Could not parse JSON for field ${field} in row:`, row);
                }
            }
        });
        return newRow;
    });
};


// === GET ALL (READ) ENDPOINTS ===
const setupGetEndpoint = (app, path, tableName, orderBy = null, jsonFields = []) => {
    app.get(`/api/${path}`, async (req, res) => {
        try {
            const query = `SELECT * FROM ${tableName}${orderBy ? ` ORDER BY ${orderBy}` : ''}`;
            let [rows] = await db.query(query);
            
            if (jsonFields.length > 0) {
                rows = parseJsonFields(rows, jsonFields);
            }
            
            res.json(toCamelCase(rows));
        } catch (error) {
            console.error(`Error fetching ${tableName}:`, error);
            res.status(500).json({ message: `Gagal mengambil data ${tableName}.` });
        }
    });
};
setupGetEndpoint(app, 'users', 'users');
setupGetEndpoint(app, 'teachers', 'teachers', 'name ASC');
setupGetEndpoint(app, 'classes', 'classes', 'name ASC');
setupGetEndpoint(app, 'students', 'students', 'name ASC');
setupGetEndpoint(app, 'student-family-data', 'student_family_data', null, ['parent_address']);
setupGetEndpoint(app, 'subjects', 'subjects', 'name ASC');
setupGetEndpoint(app, 'learning-objectives', 'learning_objectives');
setupGetEndpoint(app, 'grade-predicates', 'grade_predicates', 'threshold DESC');
setupGetEndpoint(app, 'extracurriculars', 'extracurriculars', 'name ASC');
setupGetEndpoint(app, 'extracurricular-predicates', 'extracurricular_predicates');
setupGetEndpoint(app, 'student-subject-grades', 'student_subject_grades', null, ['tp_grades', 'summative_grades']);
setupGetEndpoint(app, 'student-extracurriculars', 'student_extracurriculars');
setupGetEndpoint(app, 'student-attendances', 'student_attendances');
setupGetEndpoint(app, 'student-cocurriculars', 'student_cocurriculars');


// === GENERIC CRUD ENDPOINTS ===
const setupCrudEndpoints = (app, entity, tableName, idField = 'id') => {
    // CREATE
    app.post(`/api/${entity}`, async (req, res) => {
        try {
            const snakeData = toSnakeCase(req.body);
            // Hapus id jika ada, karena akan di-generate oleh DB
            delete snakeData.id;
            const [result] = await db.query(`INSERT INTO ${tableName} SET ?`, [snakeData]);
            const newId = result.insertId || req.body.id;
            const [[newItem]] = await db.query(`SELECT * FROM ${tableName} WHERE ${idField} = ?`, [newId]);
            res.status(201).json(toCamelCase([newItem])[0]);
        } catch (error) {
            console.error(`Error creating ${entity}:`, error);
            res.status(500).json({ message: `Gagal menyimpan ${entity}.` });
        }
    });
    // UPDATE
    app.put(`/api/${entity}/:id`, async (req, res) => {
        try {
            const data = toSnakeCase(req.body);
            delete data[idField];
            await db.query(`UPDATE ${tableName} SET ? WHERE ${idField} = ?`, [data, req.params.id]);
            const [[updatedItem]] = await db.query(`SELECT * FROM ${tableName} WHERE ${idField} = ?`, [req.params.id]);
            res.json(toCamelCase([updatedItem])[0]);
        } catch (error) {
            console.error(`Error updating ${entity}:`, error);
            res.status(500).json({ message: `Gagal mengupdate ${entity}.` });
        }
    });
    // DELETE
    app.delete(`/api/${entity}/:id`, async (req, res) => {
        try {
            await db.query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [req.params.id]);
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting ${entity}:`, error);
            res.status(500).json({ message: `Gagal menghapus ${entity}.` });
        }
    });
};

setupCrudEndpoints(app, 'subjects', 'subjects');
setupCrudEndpoints(app, 'learning-objectives', 'learning_objectives');
setupCrudEndpoints(app, 'grade-predicates', 'grade_predicates');
setupCrudEndpoints(app, 'extracurriculars', 'extracurriculars');
setupCrudEndpoints(app, 'extracurricular-predicates', 'extracurricular_predicates');
setupCrudEndpoints(app, 'classes', 'classes');


// === CUSTOM CRUD ENDPOINTS ===

// --- Guru (terkait dengan users) ---
app.post('/api/teachers', async (req, res) => {
    const { name, nip, username, password } = req.body;
    if (!name || !nip || !username || !password) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [userResult] = await connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'teacher']);
        const newUserId = userResult.insertId;
        await connection.query('INSERT INTO teachers (user_id, name, nip) VALUES (?, ?, ?)', [newUserId, name, nip]);
        await connection.commit();
        res.status(201).json({ message: "Guru berhasil dibuat." });
    } catch (error) {
        await connection.rollback();
        console.error("Error saat menambah guru:", error);
        res.status(500).json({ message: "Gagal menyimpan guru ke database." });
    } finally {
        connection.release();
    }
});
app.put('/api/teachers/:id', async (req, res) => {
    const teacherId = req.params.id;
    const { userId, name, nip, username, password } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE teachers SET name = ?, nip = ? WHERE id = ?', [name, nip, teacherId]);
        if (password) {
            await connection.query('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, userId]);
        } else {
            await connection.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
        }
        await connection.commit();
        res.json({ message: 'Guru berhasil diupdate' });
    } catch (error) {
        await connection.rollback();
        console.error("Error saat update guru:", error);
        res.status(500).json({ message: "Gagal mengupdate guru." });
    } finally {
        connection.release();
    }
});
app.delete('/api/teachers/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[teacher]] = await connection.query('SELECT user_id FROM teachers WHERE id = ?', [req.params.id]);
        if (teacher) {
            await connection.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
            await connection.query('DELETE FROM users WHERE id = ?', [teacher.user_id]);
        }
        await connection.commit();
        res.status(204).send();
    } catch (error) {
        await connection.rollback();
        console.error("Error saat menghapus guru:", error);
        res.status(500).json({ message: "Gagal menghapus guru." });
    } finally {
        connection.release();
    }
});

// --- Siswa (terkait dengan family data) ---
app.post('/api/students', async (req, res) => {
    const { studentData, familyData } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // Stringify parentAddress before insertion
        if (familyData.parentAddress) {
            familyData.parentAddress = JSON.stringify(familyData.parentAddress);
        }
        const [studentResult] = await connection.query('INSERT INTO students SET ?', [toSnakeCase(studentData)]);
        const newStudentId = studentResult.insertId;
        await connection.query('INSERT INTO student_family_data SET ?', [{ ...toSnakeCase(familyData), student_id: newStudentId }]);
        await connection.commit();
        res.status(201).json({ message: 'Siswa berhasil dibuat' });
    } catch (error) {
        await connection.rollback();
        console.error("Error saat menambah siswa:", error);
        res.status(500).json({ message: "Gagal menyimpan siswa ke database." });
    } finally {
        connection.release();
    }
});
app.put('/api/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const { studentData, familyData } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
         // Stringify parentAddress before update
        if (familyData.parentAddress) {
            familyData.parentAddress = JSON.stringify(familyData.parentAddress);
        }
        await connection.query('UPDATE students SET ? WHERE id = ?', [toSnakeCase(studentData), studentId]);
        const snakeFamilyData = { ...toSnakeCase(familyData), student_id: studentId };
        await connection.query('INSERT INTO student_family_data SET ? ON DUPLICATE KEY UPDATE ?', [snakeFamilyData, snakeFamilyData]);
        await connection.commit();
        res.json({ message: 'Data siswa berhasil diupdate' });
    } catch (error) {
        await connection.rollback();
        console.error("Error saat update siswa:", error);
        res.status(500).json({ message: "Gagal mengupdate data siswa." });
    } finally {
        connection.release();
    }
});
app.delete('/api/students/:id', async (req, res) => {
    try {
        // ON DELETE CASCADE akan menghapus data keluarga
        await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error("Error saat menghapus siswa:", error);
        res.status(500).json({ message: "Gagal menghapus siswa." });
    }
});
app.post('/api/students/bulk', async (req, res) => {
    const studentsToImport = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const { studentData, familyData } of studentsToImport) {
            // Stringify parentAddress before insertion
            if (familyData.parentAddress) {
                familyData.parentAddress = JSON.stringify(familyData.parentAddress);
            }
            const [studentResult] = await connection.query('INSERT INTO students SET ?', [toSnakeCase(studentData)]);
            const newStudentId = studentResult.insertId;
            await connection.query('INSERT INTO student_family_data SET ?', [{ ...toSnakeCase(familyData), student_id: newStudentId }]);
        }
        await connection.commit();
        res.status(201).json({ message: 'Impor siswa berhasil.'});
    } catch (error) {
        await connection.rollback();
        console.error("Error saat impor massal siswa:", error);
        res.status(500).json({ message: "Gagal impor massal siswa." });
    } finally {
        connection.release();
    }
});


// --- SAVE GRADE/ATTENDANCE DATA (UPSERT) ---
const setupUpsertEndpoint = (app, path, tableName, primaryKey) => {
    app.post(`/api/save-${path}`, async (req, res) => {
        const { data: records } = req.body;
        if (!Array.isArray(records)) {
            return res.status(400).json({ message: "Data tidak valid, harus berupa array." });
        }
        if (records.length === 0) {
            return res.status(200).json({ message: `Tidak ada data ${path} untuk disimpan.` });
        }
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            for (const record of records) {
                // Konversi JSON field ke string sebelum insert
                if (record.tpGrades) record.tpGrades = JSON.stringify(record.tpGrades);
                if (record.summativeGrades) record.summativeGrades = JSON.stringify(record.summativeGrades);
                
                const recordDb = toSnakeCase(record);
                await connection.query(`INSERT INTO ${tableName} SET ? ON DUPLICATE KEY UPDATE ?`, [recordDb, recordDb]);
            }
            await connection.commit();
            res.status(200).json({ message: `${path} berhasil disimpan.` });
        } catch (error) {
            await connection.rollback();
            console.error(`Error upserting ${path}:`, error);
            res.status(500).json({ message: `Gagal menyimpan ${path}.` });
        } finally {
            connection.release();
        }
    });
};
setupUpsertEndpoint(app, 'subject-grades', 'student_subject_grades', 'id');
setupUpsertEndpoint(app, 'extracurriculars', 'student_extracurriculars', 'id');
setupUpsertEndpoint(app, 'attendances', 'student_attendances', 'student_id');
setupUpsertEndpoint(app, 'cocurriculars', 'student_cocurriculars', 'student_id');


app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});