import React, { useState } from "react";
import { FaSearch, FaTicketAlt, FaSpinner } from "react-icons/fa";
import { getTicketById } from "../../services/api";
import styles from "./TicketLookup.module.scss";

const TicketLookup = () => {
  const [ticketId, setTicketId] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!ticketId.trim()) {
      setError("Vui lòng nhập mã vé");
      return;
    }

    setLoading(true);
    setError(null);
    setTicketInfo(null);

    try {
      const data = await getTicketById(ticketId.trim());
      setTicketInfo(data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError("Không tìm thấy vé với mã này");
      } else {
        setError("Lỗi kết nối hoặc không tải được dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeData) => {
    if (!timeData) return "";

    // Nếu dữ liệu truyền vào là chuỗi (VD: "1970-01-01T09:00:00.000Z")
    if (typeof timeData === "string") {
      // Cách A: Cắt chuỗi dựa vào chữ 'T'
      if (timeData.includes("T")) {
        // Lấy phần sau chữ T, rồi lấy 5 ký tự đầu (HH:mm)
        return timeData.split("T")[1].substring(0, 5);
      }
      // Cách B: Nếu chuỗi chỉ là "09:00:00"
      return timeData.substring(0, 5);
    }

    // Nếu dữ liệu là Object Date thật sự
    if (timeData instanceof Date) {
      // Format ra giờ:phút (09:00)
      return timeData.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return String(timeData);
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <h2 className="mb-4 text-center text-primary fw-bold">
        <FaTicketAlt className="me-2" />
        Tra Cứu Thông Tin Vé
      </h2>

      {/* Search Section */}
      <div className={`card mb-4 ${styles.searchCard}`}>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-md-9">
              <label className="form-label fw-bold">Mã vé</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã vé (VD: TK001)"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
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

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Ticket Info Display */}
      {ticketInfo && (
        <div className={`card ${styles.ticketCard}`}>
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <FaTicketAlt className="me-2" />
              Thông Tin Vé
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <strong>Phim:</strong>
                <p className="text-primary fs-5 mb-0">{ticketInfo.Title}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Rạp:</strong>
                <p className="mb-0">{ticketInfo.Name}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Phòng chiếu:</strong>
                <p className="mb-0">{ticketInfo.RoomID}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Ghế ngồi:</strong>
                <p className="mb-0 badge bg-info fs-6">{ticketInfo.SeatID}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Giá vé:</strong>
                <p className="mb-0 text-success fw-bold fs-5">
                  {formatVND(ticketInfo.ActualPrice)}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Giờ bắt đầu:</strong>
                <p className="mb-0">{formatTime(ticketInfo.StartTime)}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Giờ kết thúc:</strong>
                <p className="mb-0">{formatTime(ticketInfo.EndTime)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!ticketInfo && !error && !loading && (
        <div className="text-center text-muted py-5">
          <FaTicketAlt size={60} className="mb-3 opacity-25" />
          <p>Nhập mã vé để tra cứu thông tin</p>
        </div>
      )}
    </div>
  );
};

export default TicketLookup;
