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

const updateCartItemQuantity = async (cart_id, book_id, quantity) => {
  const [result] = await pool.query(`
    UPDATE CartItems
    SET quantity = ?
    WHERE cart_id = ? AND item_id = ?
  `, [quantity, cart_id, book_id]);
  return result.affectedRows;
}

const getCartIdByCustomerId = async (customer_id) => {
  const [rows] = await pool.query(`
    SELECT 
      Carts.cart_id
    FROM Carts
    WHERE Carts.customer_id = ?
  `, [customer_id]);
  return rows;
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

module.exports = {
  getAllBooks,
  getCartIdByCustomerId,
  addBookToCart,
  isItemInCart,
  getCartItems,
  updateCartItemQuantity
};