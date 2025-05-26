const customerModel = require('../model/customerModel');

const getProfile = async (req, res) => {
  try {
    // Get customer ID from session
    const customerId = req.session.user.id;
    
    // Fetch customer data
    const customer = await customerModel.getCustomerById(customerId);
    
    // Fetch order history
    const orders = await customerModel.getCustomerOrders(customerId);
    
    if (!customer) {
      return res.status(404).render('error', { 
        isLoggedIn: true, 
        message: 'Customer profile not found' 
      });
    }
    
    // Render profile page with customer data
    res.render('profile', { 
      // isLoggedIn: true,
      NameOfUser: customer.name,
      customer,
      orders
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).render('error', { 
      // isLoggedIn: true,
      message: 'Error loading profile' 
    });
  }
};

const editProfile = async (req, res) => {
  try {
    // Get customer ID from session
    const customerId = req.session.user.id;
    
    // Get updated data from request body
    const { name, email, phone, address } = req.body;
    
    // Update customer data
    const updatedCustomer = await customerModel.updateCustomer(customerId, { name, email, phone, address });
    
    if (!updatedCustomer) {
      return res.status(404).render('error', { 
        // isLoggedIn: true,
        message: 'Error updating profile' 
      });
    }
    req.session.user.name = updatedCustomer.name; // Update session data
    req.session.user.email = updatedCustomer.email; // Update session data
    // Render profile page with updated data
    res.render('profile', { 
      // isLoggedIn: true,
      NameOfUser: updatedCustomer.name,
      customer: updatedCustomer
    });
    
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).render('error', { 
      // isLoggedIn: true,
      message: 'Error updating profile' 
    });
  }
}
module.exports = {
  getProfile,
  editProfile
};