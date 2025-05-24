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
    const cart_id = req.session.user.cart_id;
    const cartItems = await productModel.getCartItems(cart_id);
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
};

const updateCartItems = async (req, res) => {
  try {
    const { updates } = req.body;
    const cart_id = req.session.user.cart_id;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Invalid updates format' });
    }
    for (const update of updates) {
      await productModel.updateCartItemQuantity( cart_id, update.item_id, update.quantity);
    }
    
    res.status(200).json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart items:', error);
    res.status(500).json({ error: 'Failed to update cart items' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { item_id } = req.body;
    await productModel.removeCartItem(item_id);
    res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

const checkout = async (req, res) => {
  try {
    // This is a placeholder - you would implement actual checkout logic here
    res.render('checkout', { 
      isLoggedIn: req.session?.user ? true : false,
      NameOfUser: req.session?.user?.name || null 
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).send('Error processing checkout');
  }
};

module.exports = {
  getAllBooks,
  addBookToCart,
  getCartItems,
  updateCartItems,
  removeFromCart,
  checkout
};