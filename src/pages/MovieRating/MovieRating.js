import React, { useState } from 'react';
import { FaSearch, FaStar, FaSpinner } from 'react-icons/fa';
import { getMovieRatingSummary } from '../../services/api';
import styles from './MovieRating.module.scss';

const MovieRating = () => {
  const [movieId, setMovieId] = useState('');
  const [minReviewCount, setMinReviewCount] = useState(1);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!movieId.trim()) {
      setError('Vui lòng nhập mã phim');
      return;
    }

    setLoading(true);
    setError(null);
    setRatingInfo(null);

    try {
      const data = await getMovieRatingSummary(movieId.trim(), minReviewCount);
      setRatingInfo(data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError('Không tìm thấy phim với mã này');
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Lỗi kết nối hoặc không tải được dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-warning" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="text-warning" style={{ opacity: 0.5 }} />);
    }
    return stars;
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary';
    if (status.includes('cao')) return 'bg-success';
    if (status.includes('trung bình')) return 'bg-info';
    if (status.includes('thấp')) return 'bg-danger';
    return 'bg-warning';
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <h2 className="mb-4 text-center text-primary fw-bold">
        <FaStar className="me-2" />
        Đánh Giá Phim
      </h2>

      {/* Search Section */}
      <div className={`card mb-4 ${styles.searchCard}`}>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-bold">Mã phim</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập mã phim (VD: MV001)"
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-bold">Số đánh giá tối thiểu</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={minReviewCount}
                onChange={(e) => setMinReviewCount(parseInt(e.target.value) || 1)}
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
                    Xem đánh giá
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

      {/* Rating Info Display */}
      {ratingInfo && (
        <div className={`card ${styles.ratingCard}`}>
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">
              <FaStar className="me-2" />
              Thông Tin Đánh Giá
            </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <strong>Mã phim:</strong>
                <p className="mb-0">{ratingInfo.MovieID}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Tên phim:</strong>
                <p className="mb-0 text-primary fs-5">{ratingInfo.Title}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Điểm trung bình:</strong>
                {ratingInfo.AvgRating ? (
                  <>
                    <p className="mb-1 text-warning fw-bold fs-3">
                      {ratingInfo.AvgRating.toFixed(1)} / 10
                    </p>
                    <div className="fs-4">
                      {renderStars(ratingInfo.AvgRating)}
                    </div>
                  </>
                ) : (
                  <p className="mb-0 text-muted">Chưa có đánh giá</p>
                )}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Số lượng đánh giá:</strong>
                <p className="mb-0 fs-4">{ratingInfo.ReviewCount}</p>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Trạng thái:</strong>
                <p className="mb-0">
                  <span className={`badge ${getStatusBadgeClass(ratingInfo.RatingStatus)} fs-6`}>
                    {ratingInfo.RatingStatus}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!ratingInfo && !error && !loading && (
        <div className="text-center text-muted py-5">
          <FaStar size={60} className="mb-3 opacity-25" />
          <p>Nhập mã phim để xem đánh giá</p>
        </div>
      )}
    </div>
  );
};

export default MovieRating;
