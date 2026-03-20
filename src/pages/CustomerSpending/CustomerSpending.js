import React, { useState } from 'react';
import { FaSearch, FaSpinner, FaUserCheck } from 'react-icons/fa';
import { updateCustomerSpending } from '../../services/api';
import Toast from '../../components/Toast';
import styles from './CustomerSpending.module.scss';

const CustomerSpending = () => {
  const [customerId, setCustomerId] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!customerId.trim()) {
      setToast({ message: 'Vui lòng nhập mã khách hàng', type: 'error' });
      return;
    }

    setLoading(true);
    setToast(null);
    setCustomerInfo(null);

    try {
      const result = await updateCustomerSpending(customerId.trim());
      setCustomerInfo(result.data);
      setToast({ message: 'Tra cứu thành công!', type: 'success' });
    } catch (err) {
      console.error(err);
      let errorMsg = 'Lỗi kết nối hoặc không tải được dữ liệu';
      
      if (err.response && err.response.status === 404) {
        errorMsg = 'Không tìm thấy khách hàng với mã này';
      } else if (err.response && err.response.data) {
        // Extract user-friendly message from SQL error
        if (typeof err.response.data.error === 'string') {
          const sqlError = err.response.data.error;
          if (sqlError.includes('không tồn tại')) {
            errorMsg = 'Không tìm thấy khách hàng với mã này';
          } else if (sqlError.includes('Invalid column name')) {
            errorMsg = 'Lỗi cấu trúc dữ liệu. Vui lòng liên hệ quản trị viên';
          } else {
            errorMsg = 'Không tìm thấy khách hàng với mã này';
          }
        }
      }
      
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <h2 className="mb-4 text-center text-primary fw-bold">
        <FaUserCheck className="me-2" />
        Tổng Chi Tiêu
      </h2>

      {/* Search Section */}
      <div className={`card mb-4 ${styles.searchCard}`}>
        <div className="card-body">
          <form onSubmit={handleUpdate} className="row g-3 align-items-end">
            <div className="col-md-9">
              <label className="form-label fw-bold">Mã khách hàng</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã khách hàng (VD: CU001)"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="col-md-3">
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={loading}
              >
                {loading ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  <>
                    <FaSearch className="me-2" />
                    Tra cứu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Customer Info Display */}
      {customerInfo && (
        <div className={`card ${styles.customerCard}`}>
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <FaUserCheck className="me-2" />
              Thông Tin Khách Hàng
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <strong>Mã khách hàng:</strong>
                <p className="mb-0">{customerInfo.CustomerID}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Tên khách hàng:</strong>
                <p className="mb-0 text-primary fs-5">{customerInfo.CustomerName}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Tổng chi tiêu:</strong>
                <p className="mb-0 text-success fw-bold fs-4">
                  {formatVND(customerInfo.TotalSpending)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!customerInfo && !toast && !loading && (
        <div className="text-center text-muted py-5">
          <FaUserCheck size={60} className="mb-3 opacity-25" />
          <p>Nhập mã khách hàng để cập nhật tổng chi tiêu</p>
        </div>
      )}
    </div>
  );
};

export default CustomerSpending;
