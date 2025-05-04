import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiUsers, FiPackage, FiPieChart, FiSettings, FiLogOut, 
  FiSearch, FiBell, FiUser, FiChevronDown, FiEdit2, FiTrash2, FiShield
} from 'react-icons/fi';
import '../css/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [secondaryNav, setSecondaryNav] = useState('users');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    category: '',
    price: '',
    description: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch current user session
  useEffect(() => {
    axios.get('http://localhost:3000/api/me', { withCredentials: true })
      .then(res => {
        setCurrentUser(res.data.user);
      })
      .catch(() => window.location.href = '/login');
  }, []);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/users', {
          withCredentials: true
        });
        setUsers(response.data);
        setLoadingUsers(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsersError(error.response?.data?.error || 'Failed to load users');
        setLoadingUsers(false);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          window.location.href = '/login';
        }
      }
    };

    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Fetch products data
  useEffect(() => {
    if (activeTab !== 'products') return;
    setLoadingProducts(true);
    axios.get('http://localhost:3000/api/admin/products', { withCredentials: true })
      .then(res => {
        setProducts(res.data);
        setLoadingProducts(false);
      })
      .catch(err => {
        console.error("Error loading products:", err);
        setProductsError(err.response?.data?.error || "Failed to load products");
        setLoadingProducts(false);
      });
  }, [activeTab]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/admin/add-item',
        {
          category: newProduct.category,
          price: parseFloat(newProduct.price),
          description: newProduct.description
        },
        { withCredentials: true }
      );

      // Refresh products list
      const response = await axios.get('http://localhost:3000/api/admin/products', { 
        withCredentials: true 
      });
      setProducts(response.data);
      setNewProduct({ category: '', price: '', description: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Add product error:', err);
      alert(err.response?.data?.error || 'Failed to add product');
    }
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("Delete this product?")) return;
    axios.delete(`http://localhost:3000/api/admin/products/${id}`, { withCredentials: true })
      .then(() => {
        setProducts(products.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error("Delete product error:", err);
        alert(err.response?.data?.error || "Failed to delete product");
      });
  };

  const handleDeleteUser = (id) => {
    const userToDelete = users.find(u => u.id === id);
    
    if (userToDelete?.role === 'superadmin') {
      alert('Cannot delete superadmin users');
      return;
    }

    if (currentUser?.role === 'admin' && userToDelete?.role === 'admin') {
      alert('Admins cannot delete other admins');
      return;
    }

    if (!window.confirm('Remove this user?')) return;
    axios.delete(`http://localhost:3000/api/admin/users/${id}`, {
      withCredentials: true
    })
    .then(() => {
      setUsers(users.filter(u => u.id !== id));
    })
    .catch(err => {
      console.error('Delete error:', err);
      alert(err.response?.data?.error || 'Failed to delete user');
    });
  };

  const handleRoleChange = (id, newRole) => {
    const targetUser = users.find(u => u.id === id);
    
    if (currentUser?.role === 'admin' && targetUser?.role === 'admin') {
      alert('Admins cannot modify other admins');
      return;
    }

    if (newRole === 'superadmin' && currentUser?.role !== 'superadmin') {
      alert('Only superadmins can create new superadmins');
      return;
    }

    axios.patch(`http://localhost:3000/api/admin/users/${id}/role`, 
      { role: newRole },
      { withCredentials: true }
    )
    .then(() => {
      setUsers(users.map(u => 
        u.id === id ? { ...u, role: newRole } : u
      ));
    })
    .catch(err => {
      console.error('Role change error:', err);
      alert(err.response?.data?.error || 'Failed to update role');
    });
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
  
  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1 className="admin-logo">Admin<span>Panel</span></h1>
        </div>
        
        <nav className="main-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FiPieChart className="nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setSecondaryNav('users');
            }}
          >
            <FiUsers className="nav-icon" />
            <span>Users</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              setSecondaryNav('products');
            }}
          >
            <FiPackage className="nav-icon" />
            <span>Products</span>
          </button>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut className="nav-icon" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-content">
        <div className="content-area">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <h2 className="section-title">Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p>{users.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Products</h3>
                  <p>{products.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && secondaryNav === 'users' && (
            <div className="users-view">
              <div className="section-header">
                <h2 className="section-title">User Management</h2>
              </div>
              
              {loadingUsers && <div className="loading-spinner">Loading users...</div>}
              {usersError && <div className="error-message">{usersError}</div>}
              
              {!loadingUsers && !usersError && (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">
                                <FiUser />
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email.replace(/@/, ' (at) ')}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                              {user.role === 'superadmin' && <FiShield className="superadmin-icon" />}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <select 
                                value={user.role} 
                                onChange={e => handleRoleChange(user.id, e.target.value)}
                                disabled={user.role === 'superadmin' || (currentUser?.role !== 'superadmin' && user.role === 'admin')}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                {currentUser?.role === 'superadmin' && (
                                  <option value="superadmin">Super Admin</option>
                                )}
                              </select>
                              <button 
                                disabled={user.role === 'superadmin' || (currentUser?.role !== 'superadmin' && user.role === 'admin')}
                                className="action-btn delete"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && secondaryNav === 'products' && (
            <div className="products-view">
              <div className="section-header">
                <h2 className="section-title">Product Management</h2>
                <button 
                  className="primary-btn"
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setNewProduct({ category: '', price: '', description: '' });
                  }}
                >
                  {showAddForm ? 'Cancel' : 'Add New Product'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddProduct} className="add-product-form">
                  <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <input
                      id="category"
                      type="text"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Price ($):</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="primary-btn">
                    Add Product
                  </button>
                </form>
              )}

              {loadingProducts && <p>Loading products…</p>}
              {productsError && <p className="error-message">{productsError}</p>}

              {!loadingProducts && !productsError && (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => (
                        <tr key={prod.id}>
                          <td>{prod.id}</td>
                          <td>{prod.category}</td>
                          <td>${prod.price.toFixed(2)}</td>
                          <td>{prod.description}</td>
                          <td>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDeleteProduct(prod.id)}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default AdminDashboard;