const productModel = require('../model/productModel');

const getAllBooks = async (req, res) => {
  console.log("GET /allbooks called"); // Add this line
  try {
    const books = await productModel.getAllBooks();
    console.log("Books fetched:", books); // Add this line
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error); // This should print the real error
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

module.exports = {
  getAllBooks
};