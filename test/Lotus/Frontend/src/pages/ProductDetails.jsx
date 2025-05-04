import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../Context/cartContext';
import axios from 'axios';
import '../css/ProductDetails.css';

const ProductDetails = () => {
  const { addToCart } = useCart();
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/admin/products`, {
          withCredentials: true
        });
        const foundProduct = response.data.find(p => p.id === Number(id));
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantity = (e) => {
    setQuantity(Number(e.target.value));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-details">
      <div className="product-image">
        <div className="product-image-placeholder">
          {product.category.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="product-info">
        <h1>{product.category}</h1>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <div className="quantity-selector">
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            min="1"
            value={quantity}
            onChange={handleQuantity}
          />
        </div>
        <button
          className="add-to-cart-btn"
          onClick={() => addToCart({
            ...product,
            name: product.category,
            quantity: quantity
          })}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;