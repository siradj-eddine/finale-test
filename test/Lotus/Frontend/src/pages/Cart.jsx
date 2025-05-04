import { useCart } from '../Context/cartContext';
import '../css/Cart.css';
import { Link, useNavigate } from 'react-router-dom';
// import { useEffect } from 'react';
import { checkAuth } from '../Context/AuthContext'; // You'll need to create this utility

const Cart = () => {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();

  // Function to handle checkout
  const handleCheckout = () => {
    // Check if user is authenticated
    const isAuthenticated = checkAuth(); // Implement this function
    
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    // Proceed to checkout if authenticated
    navigate('/checkout');
  };

  // Rest of your existing cart component...
  const handleQuantityChange = (index, newQuantity) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p className="empty-cart-message">Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <h2>{item.name}</h2>
                <p className="item-category">{item.category}</p>
                <p className="item-price">${item.price}</p>
                <div className="quantity-control">
                  <label htmlFor={`quantity-${index}`}>Quantity:</label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                  />
                </div>
                <button
                  className="remove-item-btn"
                  onClick={() => handleRemoveItem(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {cart.length > 0 && (
        <div className="cart-summary">
          <h2>Total: ${totalPrice.toFixed(2)}</h2>
          <button 
            className="checkout-btn" 
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;