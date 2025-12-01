import React, { useState } from 'react';
import { FaSearch, FaFileExcel, FaSpinner } from 'react-icons/fa';
// Import Service đã tách ra (Bước 2)
import { getBranchIncome } from '../../../services/reportService'; 
// Import SCSS Module
import styles from './RevenueReport.module.scss'; 

const RevenueReport = () => {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    minRevenue: 0
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Gọi qua service thay vì axios trực tiếp
      const data = await getBranchIncome(filters.fromDate, filters.toDate, filters.minRevenue);
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối hoặc không tải được dữ liệu.");
      
      // --- MOCK DATA (Xóa khi có Backend) ---
      setReportData([
        { BranchID: 'CN01', BranchName: 'Cinema Quận 1', TotalRevenue: 15000000, TotalTicket: 150 },
        { BranchID: 'CN02', BranchName: 'Cinema Gò Vấp', TotalRevenue: 8500000, TotalTicket: 80 },
      ]);
      // --------------------------------------
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const headers = ["Mã Chi Nhánh", "Tên Chi Nhánh", "Tổng Doanh Thu", "Tổng Số Vé"];
    const rows = reportData.map(item => [
      item.BranchID,
      `"${item.BranchName}"`,
      item.TotalRevenue,
      item.TotalTicket
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCao_DoanhThu_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  // Helper format tiền
  const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className={`container ${styles.wrapper}`}>
      <h2 className="mb-4 text-center text-primary fw-bold">Báo Cáo Doanh Thu</h2>

      {/* Filter Section */}
      <div className={`card mb-4 ${styles.filterCard}`}>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold">Từ ngày</label>
              <input type="date" className="form-control" name="fromDate" value={filters.fromDate} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Đến ngày</label>
              <input type="date" className="form-control" name="toDate" value={filters.toDate} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Doanh thu tối thiểu</label>
              <input type="number" className="form-control" name="minRevenue" value={filters.minRevenue} onChange={handleChange} placeholder="0" />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>
                {loading ? <FaSpinner className="fa-spin" /> : <><FaSearch className="me-2"/> Xem</>}
              </button>
              <button type="button" className="btn btn-success" onClick={handleExportCSV} disabled={reportData.length === 0}>
                <FaFileExcel className="me-2"/> Xuất
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Table Section */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover table-bordered mb-0">
          <thead className="table-dark text-center">
            <tr>
              <th>Mã CN</th>
              <th>Tên Chi Nhánh</th>
              <th>Tổng Doanh Thu</th>
              <th>Tổng Số Vé</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length > 0 ? (
              reportData.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.BranchID}</td>
                  <td>{item.BranchName}</td>
                  <td className="text-end fw-bold text-success">{formatVND(item.TotalRevenue)}</td>
                  <td className="text-center">{item.TotalTicket}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-muted">Chưa có dữ liệu hiển thị</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueReport;