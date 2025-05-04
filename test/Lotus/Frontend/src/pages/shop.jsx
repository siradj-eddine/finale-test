import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/shop.css';
import '../css/Responsive.css';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { useCart } from '../Context/cartContext';

const Shop = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/products', {
          withCredentials: true
        });
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Filter products by category and search query
  const filteredProducts = items.filter((product) => {
    const productCategory = String(product.category || '').toLowerCase();
    const productDescription = String(product.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    // Check if the product matches the category and search query
    const matchesCategory = !category || productCategory === category.toLowerCase();
    const matchesSearch = productCategory.includes(query) || productDescription.includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.category, // Using category as name since name isn't in the database
      price: product.price,
      description: product.description,
      quantity: 1
    };
    addToCart(cartItem);
  };

  if (loading) return <div className="shop">Loading products…</div>;
  if (error) return <div className="shop error">{error}</div>;

  return (
    <div className="shop">
      <section className="title">
        <h1>Welcome to the Shop</h1>
        <p>Here you can find a variety of products.</p>
        <input 
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products..."
          className='search' 
        />
      </section>

      <section className="products">
        <h2 className="categ">{category ? `${category}` : 'All Products'}</h2>
        <div className="product-list">
          {filteredProducts.map((product) => (
            <div className="product" key={product.id}>
              <Link to={`/productDetails/${product.id}`}>
                <div className="product-image-placeholder">
                  {product.category.charAt(0).toUpperCase()}
                </div>
              </Link>
              <h3>{product.category}</h3>
              <p>{product.description}</p>
              <p>${product.price.toFixed(2)}</p>
              <button 
                className="btn" 
                onClick={() => handleAddToCart(product)}
              >
                <FaPlus /> Add to cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shop;