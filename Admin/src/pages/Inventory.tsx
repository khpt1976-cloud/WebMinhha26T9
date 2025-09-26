import React, { useState, useEffect } from 'react';
import './Inventory.css';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  price: number;
  totalValue: number;
}

interface StockHistory {
  id: number;
  productId: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const itemsPerPage = 10;

  // Mock data - sẽ thay thế bằng API calls
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: 1,
        productId: 1,
        productName: 'Võng Xếp Cao Cấp VX001',
        productImage: '/images/vong1.jpg',
        category: 'Võng Xếp',
        currentStock: 25,
        minStock: 10,
        maxStock: 50,
        reservedStock: 3,
        availableStock: 22,
        lastRestocked: '2025-09-20T10:00:00Z',
        status: 'in_stock',
        price: 450000,
        totalValue: 11250000
      },
      {
        id: 2,
        productId: 2,
        productName: 'Rèm Cửa Chống Nắng RC002',
        productImage: '/images/rem1.jpg',
        category: 'Rèm - Màn',
        currentStock: 8,
        minStock: 15,
        maxStock: 40,
        reservedStock: 1,
        availableStock: 7,
        lastRestocked: '2025-09-15T14:30:00Z',
        status: 'low_stock',
        price: 280000,
        totalValue: 2240000
      },
      {
        id: 3,
        productId: 3,
        productName: 'Giá Phơi Đồ Inox GP003',
        productImage: '/images/gia-phoi1.jpg',
        category: 'Giá Phơi Đồ',
        currentStock: 0,
        minStock: 5,
        maxStock: 30,
        reservedStock: 0,
        availableStock: 0,
        lastRestocked: '2025-09-10T09:15:00Z',
        status: 'out_of_stock',
        price: 320000,
        totalValue: 0
      },
      {
        id: 4,
        productId: 4,
        productName: 'Bàn Gấp Đa Năng BG004',
        productImage: '/images/ban1.jpg',
        category: 'Bàn Ghế',
        currentStock: 35,
        minStock: 8,
        maxStock: 25,
        reservedStock: 2,
        availableStock: 33,
        lastRestocked: '2025-09-22T16:45:00Z',
        status: 'overstocked',
        price: 180000,
        totalValue: 6300000
      },
      {
        id: 5,
        productId: 5,
        productName: 'Ghế Xếp Thông Minh GX005',
        productImage: '/images/ghe1.jpg',
        category: 'Bàn Ghế',
        currentStock: 12,
        minStock: 10,
        maxStock: 30,
        reservedStock: 0,
        availableStock: 12,
        lastRestocked: '2025-09-18T11:20:00Z',
        status: 'in_stock',
        price: 120000,
        totalValue: 1440000
      }
    ];

    setTimeout(() => {
      setInventory(mockInventory);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusMap = {
      in_stock: { text: 'Còn hàng', class: 'status-in-stock', icon: '✅' },
      low_stock: { text: 'Sắp hết', class: 'status-low-stock', icon: '⚠️' },
      out_of_stock: { text: 'Hết hàng', class: 'status-out-of-stock', icon: '❌' },
      overstocked: { text: 'Dư thừa', class: 'status-overstocked', icon: '📈' }
    };
    return statusMap[status as keyof typeof statusMap];
  };

  // Handle stock adjustment
  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowStockModal(true);
  };

  // Handle view history
  const handleViewHistory = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowHistoryModal(true);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Calculate totals
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out_of_stock').length;

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin kho hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Quản Lý Kho Hàng</h1>
          <p>Theo dõi tồn kho và lịch sử xuất nhập</p>
        </div>
        <div className="header-right">
          <button className="btn btn-success">
            <i className="icon-plus"></i>
            Nhập Hàng
          </button>
          <button className="btn btn-primary">
            <i className="icon-download"></i>
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{inventory.length}</h3>
            <p>Tổng sản phẩm</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatPrice(totalValue)}</h3>
            <p>Giá trị tồn kho</p>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{lowStockCount}</h3>
            <p>Sắp hết hàng</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{outOfStockCount}</h3>
            <p>Hết hàng</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <i className="icon-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Võng Xếp">Võng Xếp</option>
            <option value="Rèm - Màn">Rèm - Màn</option>
            <option value="Giá Phơi Đồ">Giá Phơi Đồ</option>
            <option value="Bàn Ghế">Bàn Ghế</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="in_stock">Còn hàng</option>
            <option value="low_stock">Sắp hết</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="overstocked">Dư thừa</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Tồn kho</th>
              <th>Có sẵn</th>
              <th>Trạng thái</th>
              <th>Giá trị</th>
              <th>Cập nhật cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map(item => {
              const statusInfo = getStatusInfo(item.status);
              return (
                <tr key={item.id}>
                  <td>
                    <div className="product-info">
                      <div className="product-image">
                        <img src={item.productImage || '/images/placeholder.jpg'} alt={item.productName} />
                      </div>
                      <div className="product-details">
                        <h4>{item.productName}</h4>
                        <p>ID: {item.productId}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <div className="stock-info">
                      <div className="stock-numbers">
                        <span className="current-stock">{item.currentStock}</span>
                        <span className="stock-range">({item.minStock}-{item.maxStock})</span>
                      </div>
                      <div className="stock-bar">
                        <div 
                          className="stock-fill"
                          style={{ 
                            width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`,
                            backgroundColor: item.status === 'low_stock' ? '#f59e0b' : 
                                           item.status === 'out_of_stock' ? '#ef4444' :
                                           item.status === 'overstocked' ? '#8b5cf6' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="available-stock">
                      <span className="available-number">{item.availableStock}</span>
                      {item.reservedStock > 0 && (
                        <span className="reserved-info">({item.reservedStock} đặt trước)</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  </td>
                  <td>
                    <div className="value-info">
                      <span className="total-value">{formatPrice(item.totalValue)}</span>
                      <span className="unit-price">{formatPrice(item.price)}/sp</span>
                    </div>
                  </td>
                  <td>
                    <span className="date-info">
                      {new Date(item.lastRestocked).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => handleStockAdjustment(item)}
                        title="Điều chỉnh kho"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-icon btn-view"
                        onClick={() => handleViewHistory(item)}
                        title="Xem lịch sử"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi bộ lọc hoặc kiểm tra lại từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trước
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className="btn btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Điều chỉnh kho - {selectedProduct.productName}</h3>
            <p>StockAdjustmentModal component sẽ được tạo ở bước tiếp theo</p>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowStockModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Lịch sử xuất nhập - {selectedProduct.productName}</h3>
            <p>StockHistoryModal component sẽ được tạo ở bước tiếp theo</p>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowHistoryModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;