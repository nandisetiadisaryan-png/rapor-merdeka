const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',        // sesuaikan dengan user XAMPP / phpMyAdmin kamu
  password: '',         // kosong jika default XAMPP
  database: 'rapor_merdeka_db'
});

module.exports = db;
