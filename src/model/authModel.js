const pool = require('../config/db'); // Assumes db.js now exports a pool

/**
 * Create a new user in the database
 */
const createUser = async (name, email, password_hash, phone, address) => {
  const [result] = await pool.execute(
    'INSERT INTO Customers (name, email, password_hash, phone, address) VALUES (?, ?, ?, ?, ?)',
    [name, email, password_hash, phone, address]
  );
  return result.insertId;
};

/**
 * Find a user by email address
 */
const getUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM Customers WHERE email = ?',
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
};

module.exports = {
  createUser,
  getUserByEmail
};