import React, { useState } from 'react';
import { FaSearch, FaStar, FaSpinner } from 'react-icons/fa';
import { getMovieRatingSummary, searchMoviesByName } from '../../services/api';
import styles from './MovieRating.module.scss';

const MovieRating = () => {
  const [movieId, setMovieId] = useState('');
  const [movieName, setMovieName] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating-high', 'rating-low'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchByName = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // Nếu không nhập gì, tìm tất cả phim (truyền ký tự rỗng hoặc ký tự đặc biệt)
      const searchTerm = movieName.trim() || '%';
      const results = await searchMoviesByName(searchTerm);
      
      // Lọc theo điểm đánh giá tối thiểu
      const filteredResults = results.filter(movie => 
        (movie.AvgRating || 0) >= minRating
      );
      
      if (filteredResults.length === 0) {
        setError('Không tìm thấy phim nào phù hợp');
      } else {
        setSearchResults(filteredResults);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tìm kiếm phim');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = async (selectedMovieId) => {
    setMovieId(selectedMovieId);
    setSearchResults([]);
    
    setLoading(true);
    setError(null);
    setRatingInfo(null);

    try {
      const data = await getMovieRatingSummary(selectedMovieId, 0);
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

  const handleSearch = async (e) => {
    e.preventDefault();

    // Nếu có tên phim hoặc không nhập gì, tìm theo tên (sẽ hiện danh sách)
    if (movieName.trim() || !movieId.trim()) {
      handleSearchByName();
      return;
    }

    // Nếu không có tên phim nhưng có mã, tìm theo mã
    setLoading(true);
    setError(null);
    setRatingInfo(null);
    setSearchResults([]);

    try {
      const data = await getMovieRatingSummary(movieId.trim(), 0);
      setRatingInfo(data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        setError('Không tìm thấy phim với mã này');
      } else if (err.response && err.response.data && err.response.data.error) {
        setError('Lỗi không tìm thấy phim');
      } else {
        setError('Lỗi kết nối hoặc không tải được dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sắp xếp danh sách phim
  const getSortedResults = () => {
    if (!searchResults || searchResults.length === 0) return [];
    
    const sorted = [...searchResults];
    
    switch (sortBy) {
      case 'rating-high':
        return sorted.sort((a, b) => (b.AvgRating || 0) - (a.AvgRating || 0));
      case 'rating-low':
        return sorted.sort((a, b) => (a.AvgRating || 0) - (b.AvgRating || 0));
      case 'name':
      default:
        return sorted.sort((a, b) => a.Title.localeCompare(b.Title));
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
            <div className="col-md-4">
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
            <div className="col-md-4">
              <label className="form-label fw-bold">Tên phim</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên phim"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold">Điểm tối thiểu</label>
              <input
                type="number"
                className="form-control"
                min="0"
                max="10"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                disabled={loading}
              />
            </div>
            <div className="col-md-2">
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
                    Tìm kiếm
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className={`card mb-4 ${styles.searchResultsCard}`}>
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Kết quả tìm kiếm ({searchResults.length})</h6>
            <div className="d-flex gap-2 align-items-center">
              <select 
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sắp xếp theo tên</option>
                <option value="rating-high">Điểm cao → thấp</option>
                <option value="rating-low">Điểm thấp → cao</option>
              </select>
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={() => setSearchResults([])}
              >
                ✕ Đóng
              </button>
            </div>
          </div>
          <div className="list-group list-group-flush">
            {getSortedResults().map((movie) => (
              <button
                key={movie.MovieID}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                onClick={() => handleSelectMovie(movie.MovieID)}
              >
                <div>
                  <strong>{movie.MovieID}</strong> - {movie.Title}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-warning">⭐</span>
                  <span className="fw-bold">
                    {(movie.AvgRating || 0).toFixed(1)} ({(movie.ReviewCount || 0)})
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Rating Info Display */}
      {ratingInfo && (
        <div className={`card ${styles.ratingCard}`}>
          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaStar className="me-2" />
              Thông Tin Đánh Giá
            </h5>
            <button 
              className="btn btn-sm btn-outline-dark"
              onClick={() => {
                setRatingInfo(null);
                setMovieId('');
                setMovieName('');
                setError(null);
                setSearchResults([]);
                handleSearchByName();
              }}
            >
              ✕ Đóng
            </button>
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
    </div>
  );
};

export default MovieRating;
