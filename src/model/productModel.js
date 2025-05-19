const pool = require('../config/db'); // Assumes db.js now exports a pool

const getAllBooks = async () => {
  const [rows] = await pool.query(`
     SELECT 
      Books.book_id, 
      Books.title, 
      Books.price, 
      Authors.name AS author_name,
      Disciplines.name AS discipline_name
    FROM Books
    JOIN BookAuthors ON Books.book_id = BookAuthors.book_id
    JOIN Authors ON BookAuthors.author_id = Authors.author_id
    JOIN BookDisciplines ON Books.book_id = BookDisciplines.book_id
    JOIN Disciplines ON BookDisciplines.discipline_id = Disciplines.discipline_id
  `);
  return rows;
  
}



module.exports = {
  getAllBooks
};