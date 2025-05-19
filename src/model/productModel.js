const pool = require('../config/db'); // Assumes db.js now exports a pool

const getAllBooks = async () => {
  const [rows] = await pool.query(`
     SELECT 
      Books.book_id, 
      Books.title, 
      Books.price, 
      GROUP_CONCAT(DISTINCT Authors.name) AS author_names,
      GROUP_CONCAT(DISTINCT Disciplines.name) AS discipline_names
    FROM Books
    JOIN BookAuthors ON Books.book_id = BookAuthors.book_id
    JOIN Authors ON BookAuthors.author_id = Authors.author_id
    JOIN BookDisciplines ON Books.book_id = BookDisciplines.book_id
    JOIN Disciplines ON BookDisciplines.discipline_id = Disciplines.discipline_id
    GROUP BY Books.book_id, Books.title, Books.price
  `);
  return rows;
  
}



module.exports = {
  getAllBooks
};