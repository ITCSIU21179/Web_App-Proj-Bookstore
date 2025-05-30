const pool = require('../config/db'); // Assumes db.js now exports a pool

const getAllBooks = async () => {
  const [rows] = await pool.query(`
     SELECT 
      Books.book_id, 
      Books.title, 
      Books.price, 
      GROUP_CONCAT(DISTINCT Authors.name) AS author_names,
      GROUP_CONCAT(DISTINCT Disciplines.name) AS discipline_names,
      Books.image_path
    FROM Books
    JOIN BookAuthors ON Books.book_id = BookAuthors.book_id
    JOIN Authors ON BookAuthors.author_id = Authors.author_id
    JOIN BookDisciplines ON Books.book_id = BookDisciplines.book_id
    JOIN Disciplines ON BookDisciplines.discipline_id = Disciplines.discipline_id
    GROUP BY Books.book_id, Books.title, Books.price
  `);
  return rows;

}
const isItemInCart = async (cart_id, book_id) => {
  const [rows] = await pool.query(`
    SELECT 
      CartItems.item_id,
      CartItems.quantity
    FROM CartItems
    WHERE CartItems.cart_id = ? AND CartItems.item_id = ?
  `, [cart_id, book_id]);
  return rows;
}

const updateCartItemQuantity = async (cart_id, item_id, quantity) => {
  const [result] = await pool.query(`
    UPDATE CartItems
    SET quantity = ?
    WHERE cart_id = ? AND item_id = ?;
  `, [quantity, cart_id, item_id]);
  return result.affectedRows;
}

// const updateCartItemQuantityByItemId = async (item_id, quantity) => {
//   const [result] = await pool.query(`
//     UPDATE CartItems 
//     SET quantity = ?
//     WHERE item_id = ?
//   `, [quantity, item_id]);
//   return result;
// };

const getCartIdByCustomerId = async (customer_id) => {
  const [rows] = await pool.query(`
    SELECT 
      Carts.cart_id
    FROM Carts
    WHERE Carts.customer_id = ?
  `, [customer_id]);
  return rows[0];
}

const addBookToCart = async (cart_id, book_id, quantity) => {
  const [result] = await pool.query(`
    INSERT INTO CartItems (cart_id, item_id, item_type, quantity)
    VALUES (?, ?, ?, ?)
  `, [cart_id, book_id, 'book', quantity]
  );
  return result.insertId;
}

const getCartItems = async (cart_id) => {
  const [rows] = await pool.query(`
    SELECT 
      CartItems.item_id,
      CartItems.quantity,
      Books.title,
      Books.price,
      Books.image_path
    FROM CartItems
    JOIN Books ON CartItems.item_id = Books.book_id
    WHERE CartItems.cart_id = ?
  `, [cart_id]);
  return rows;
}

const removeCartItem = async (item_id) => {
  const [result] = await pool.query(`
    DELETE FROM CartItems 
    WHERE item_id = ?
  `, [item_id]);
  return result;
};

const createNewOrder = async (customer_id, cartItems, cart_id) => {
  // Get connection from pool for transaction
  const connection = await pool.getConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // Calculate total order amount
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Create new order
    const [orderResult] = await connection.query(
      `INSERT INTO Orders (customer_id, status, total_amount) 
       VALUES (?, 'pending', ?)`,
      [customer_id, totalAmount]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO OrderItems (order_id, item_type, item_id, quantity, price_at_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, 'book', item.item_id, item.quantity, item.price]
      );
    }

    // Release cart items
    await releaseCartItems( connection, cart_id);

    // Commit the transaction
    await connection.commit();

    // Return the new order ID and total
    return {
      order_id: orderId,
      total_amount: totalAmount,
      status: 'pending'
    };

  } catch (error) {
    // If error occurs, roll back changes
    await connection.rollback();
    console.error('Error creating new order:', error);
    throw error;
  } finally {
    // Release connection back to pool
    connection.release();
  }
};

const releaseCartItems = async (connection, cart_id) => {
  const [result] = await connection.query(`
    DELETE FROM CartItems 
    WHERE cart_id = ?
  `, [cart_id]);
  return result;
};

const getBookDetail = async (book_id) => {
  const [rows] = await pool.query(`
    SELECT 
      Books.book_id, 
      Books.title, 
      Books.price, 
      Books.description,
      GROUP_CONCAT(DISTINCT Authors.name) AS author_names,
      GROUP_CONCAT(DISTINCT Disciplines.name) AS discipline_names,
      Books.image_path
    FROM Books
    JOIN BookAuthors ON Books.book_id = BookAuthors.book_id
    JOIN Authors ON BookAuthors.author_id = Authors.author_id
    JOIN BookDisciplines ON Books.book_id = BookDisciplines.book_id
    JOIN Disciplines ON BookDisciplines.discipline_id = Disciplines.discipline_id
    WHERE Books.book_id = ?
    GROUP BY Books.book_id, Books.title, Books.price, Books.description, Books.image_path
  `, [book_id]);
  return rows[0];
}

module.exports = {
  getAllBooks,
  addBookToCart,
  getCartItems,
  isItemInCart,
  getCartIdByCustomerId,
  updateCartItemQuantity,
  // updateCartItemQuantityByItemId,
  removeCartItem,
  createNewOrder,
  getBookDetail,
};