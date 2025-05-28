const pool = require('../config/db');


const getAdminByEmail = async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM Admins WHERE email = ?',
        [email]
    );
    return rows.length > 0 ? rows[0] : null;
}

const createAdmin = async (name, email, password_hash) => {
    const [result] = await pool.execute(
        'INSERT INTO Admins (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, password_hash]
    );
    return result.insertId;
}
const getAllOrdersWithStatus = async (status) => {
    if (status === 'all') {
        const [rows] = await pool.execute('SELECT * FROM Orders');
        return rows;
    } else {
        const [rows] = await pool.execute(`
            SELECT 
             o.order_id, 
             c.name, 
             c.email, 
             c.address, 
             o.total_amount, 
             o.order_date
            FROM Orders AS o 
            INNER JOIN Customers AS c 
            ON o.customer_id = c.customer_id
            WHERE status = ?;`,
            [status]
        );
        return rows;
    }

}
const confirmPayment = async (orderId) => {
    const connection = await pool.getConnection();
    try {
        // Start transaction
        await connection.beginTransaction();

        const [result] = await connection.execute(
            UPDATE Orders SET status = 'paid' WHERE order_id = ?,
            [orderId]
        );
        if (result.affectedRows === 0) {
            throw new Error('Order not found or already confirmed');
        }
        
        // Pass the connection to reduceStock
        await reduceStock(connection, orderId);

        // Commit the transaction
        await connection.commit();
        return true;
    } catch (error) {
        // If error occurs, roll back changes
        await connection.rollback();
        console.error('Error confirming payment:', error);
        throw error;
    } finally {
        // Release connection back to pool
        connection.release();
    }
}

const reduceStock = async (connection, orderId) => {
    const [rows] = await connection.execute(
        SELECT item_id, quantity FROM OrderItems WHERE order_id = ?,
        [orderId]
    );
    for (const item of rows) {
        await connection.execute(
            UPDATE Books SET stock_quantity = stock_quantity - ? WHERE book_id = ?,
            [item.quantity, item.item_id]
        );
    }
}

module.exports = {
    getAdminByEmail,
    createAdmin,
    getAllOrdersWithStatus,
    confirmPayment
}