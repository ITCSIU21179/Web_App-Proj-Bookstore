const productModel = require('../model/productModel');

const getAllBooks = async (req, res) => {
  try {
    const books = await productModel.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

module.exports = {
  getAllBooks
};