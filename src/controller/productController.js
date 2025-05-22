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

const addBookToCart = async (req, res) => {
  try {
    const { book_id, quantity } = req.body;
    const customerId = req.session.user.id;

    // Get cart ID for the customer
    const cart = await productModel.getCartIdByCustomerId(customerId);
    if (!cart || cart.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    // Check if the book already exists in the cart
    const isItemInCart = await productModel.isItemInCart(cart[0].cart_id, book_id);
    if (isItemInCart && isItemInCart.length > 0) {
      // Update quantity if item already exists in cart
      const updatedQuantity = isItemInCart[0].quantity + quantity;
      await productModel.updateCartItemQuantity(cart[0].cart_id, book_id, updatedQuantity);
      return res.status(200).json({ message: 'Book quantity updated in cart' });
    }

    // Add book to cart
    const result = await productModel.addBookToCart(cart[0].cart_id, book_id, quantity);
    res.status(200).json({ message: 'Book added to cart', itemId: result });
  } catch (error) {
    console.error('Error adding book to cart:', error);
    res.status(500).json({ error: 'Failed to add book to cart' });
  }
}

const getCartItems = async (req, res) => {
  try {
    const customerId = req.session.user.id;
    const cart = await productModel.getCartIdByCustomerId(customerId);
    if (!cart || cart.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItems = await productModel.getCartItems(cart[0].cart_id);
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
};

module.exports = {
  getAllBooks,
  addBookToCart,
  getCartItems,
  addBookToCart
};