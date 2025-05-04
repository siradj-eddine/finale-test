import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/navbar.css';
import { useCart } from '../Context/cartContext';
import { FaUser, FaSignInAlt, FaBars, FaTimes } from 'react-icons/fa';
import ShopCategories from '../pages/shop-categories';
import logo from '../photo/homePhoto/Artboard 3.png';
import axios from 'axios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/me', {
          withCredentials: true
        });
        setCurrentUser(response.data.user);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', {}, {
        withCredentials: true
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };
  

  // Check if user is admin or superadmin
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin');

  if (loadingUser) {
    return <nav className="navbar">Loading...</nav>;
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo"><img src={logo} alt="logo" /></div>

      <div className="menu-icon" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
        <li><Link to="/about-us" onClick={toggleMenu}>About</Link></li>
        <li><Link to="/shop" onClick={toggleMenu}><ShopCategories /></Link></li>
        <li><Link to="/contact" onClick={toggleMenu}>Contact</Link></li>
        
        {/* Show Admin link only for admin/superadmin */}
        {isAdmin && (
          <li><Link to="/admin" onClick={toggleMenu}>Admin</Link></li>
        )}

        <div className="navbar-icons">
          <li>
            <Link to="/cart" onClick={toggleMenu}>
              Cart
              {cart.length > 0 && (
                <span className="cart-notification">
                  {cart.length}
                </span>
              )}
            </Link>
          </li>
          <li>
            {currentUser ? (
              <Link to="/login" onClick={() => { handleLogout(); toggleMenu(); }}>
              <span className='login-icon'><FaSignInAlt/></span>
            </Link>
            ) : (
              <Link to="/login" onClick={toggleMenu}>
                <span className='login-icon'><FaUser /></span>
              </Link>
            )}
          </li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;