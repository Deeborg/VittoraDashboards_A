import React from 'react';
import './Products.scss';

const Products: React.FC = () => {
  const products = [
    { id: 'P001', name: 'Industrial Motor X-200', category: 'Motors', price: 12500, margin: 30, stock: 450, status: 'In Stock' },
    { id: 'P002', name: 'Precision Gear Set Pro', category: 'Gears', price: 8500, margin: 35, stock: 320, status: 'In Stock' },
    { id: 'P003', name: 'Hydraulic Pump H-500', category: 'Pumps', price: 22000, margin: 40, stock: 120, status: 'Low Stock' },
    { id: 'P004', name: 'Control Panel CP-1000', category: 'Electronics', price: 18000, margin: 38, stock: 85, status: 'Low Stock' },
    { id: 'P005', name: 'Cooling System CS-800', category: 'Cooling', price: 9500, margin: 32, stock: 560, status: 'In Stock' },
    { id: 'P006', name: 'Conveyor Belt CB-300', category: 'Conveyors', price: 7500, margin: 28, stock: 0, status: 'Out of Stock' },
    { id: 'P007', name: 'Power Transformer PT-100', category: 'Electronics', price: 15000, margin: 42, stock: 65, status: 'Low Stock' },
    { id: 'P008', name: 'Robotic Arm RA-500', category: 'Automation', price: 45000, margin: 45, stock: 25, status: 'In Stock' },
  ];

  return (
    <div className="products">
      <div className="products-header">
        <div>
          <h2>Product Catalog</h2>
          <p>Manage product inventory and pricing</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">Import Products</button>
          <button className="btn btn-primary">+ Add Product</button>
        </div>
      </div>

      <div className="products-stats">
        <div className="stat-card">
          
          <div className="stat-content">
            <h3>Total Products</h3>
            <div className="stat-value">8</div>
          </div>
        </div>
        <div className="stat-card">
          
          <div className="stat-content">
            <h3>Avg Price</h3>
            <div className="stat-value">$18,688</div>
          </div>
        </div>
        <div className="stat-card">
          
          <div className="stat-content">
            <h3>Avg Margin</h3>
            <div className="stat-value">36.3%</div>
          </div>
        </div>
        <div className="stat-card">
          
          <div className="stat-content">
            <h3>Low Stock</h3>
            <div className="stat-value">3 Items</div>
          </div>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Margin</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><strong>{product.id}</strong></td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price.toLocaleString()}</td>
                <td>
                  <span className={`margin-badge ${product.margin > 35 ? 'high' : 'medium'}`}>
                    {product.margin}%
                  </span>
                </td>
                <td>{product.stock.toLocaleString()}</td>
                <td>
                  <span className={`stock-status ${product.status.toLowerCase().replace(' ', '-')}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn" title="Edit">✏️</button>
                    <button className="icon-btn" title="View">👁️</button>
                    <button className="icon-btn danger" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="product-categories">
        <h3>Products by Category</h3>
        <div className="categories-grid">
          {['Motors', 'Gears', 'Pumps', 'Electronics', 'Cooling', 'Conveyors', 'Automation'].map(category => (
            <div key={category} className="category-card">
              <div className="category-icon">📦</div>
              <div className="category-info">
                <h4>{category}</h4>
                <p>{Math.floor(Math.random() * 50) + 10} Products</p>
              </div>
              <div className="category-stats">
                <span className="revenue">${(Math.random() * 1000000 + 500000).toLocaleString()}</span>
                <span className="growth positive">+{Math.floor(Math.random() * 20) + 5}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;