const pool = require('../config/db');

/**
 * Get customer by ID
 */
const getCustomerById = async (customerId) => {
  const [rows] = await pool.execute(
    'SELECT customer_id, name, email, phone, address FROM Customers WHERE customer_id = ?',
    [customerId]
  );
  return rows.length > 0 ? rows[0] : null;
};

/**
 * Get customer's order history
 */
const getCustomerOrders = async (customerId) => {
  const [rows] = await pool.execute(
    `SELECT o.order_id, o.order_date, o.total_amount, o.status 
     FROM Orders o 
     WHERE o.customer_id = ? 
     ORDER BY o.order_date DESC`,
    [customerId]
  );
  return rows;
};

const updateCustomer = async (customerId, updatedData) => {
  const { name, email, phone, address } = updatedData;

  const [result] = await pool.execute(
    `UPDATE Customers 
     SET name = ?, email = ?, phone = ?, address = ? 
     WHERE customer_id = ?`,
    [name, email, phone, address, customerId]
  );

  if (result.affectedRows === 0) {
    return null; // No rows updated
  }

  return getCustomerById(customerId);
}

module.exports = {
  getCustomerById,
  getCustomerOrders,
  updateCustomer
};