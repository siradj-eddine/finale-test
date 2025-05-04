import { createContext, useState, useContext } from "react";

const cartContext = createContext();

export const useCart = () => useContext(cartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Add new item to cart with all necessary properties
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name || product.category, // Use category if name doesn't exist
            price: product.price,
            description: product.description,
            quantity: quantity,
            // Generate a placeholder image if none exists
            image: product.image || `https://via.placeholder.com/150?text=${product.category?.charAt(0)?.toUpperCase() || 'P'}`,
            // Include category for filtering if needed
            category: product.category
          }
        ];
      }
    });
  };

  // Optional: Add a function to remove items completely
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Optional: Add a function to update quantity directly
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? {...item, quantity: newQuantity} : item
      )
    );
  };

  return (
    <cartContext.Provider 
      value={{ 
        cart, 
        setCart, 
        addToCart,
        removeFromCart,
        updateQuantity
      }}
    >
      {children}
    </cartContext.Provider>
  );
};