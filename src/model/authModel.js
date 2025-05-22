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

const createCart = async (user_id) => {
  const [result] = await pool.execute(
    'INSERT INTO Carts (customer_id) VALUES (?)',
    [user_id]
  );
  return result.insertId;
};

module.exports = {
  createUser,
  getUserByEmail,
  createCart
};