import React, { useState, useEffect } from "react";
import { Modal } from "bootstrap";
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie
} from "../services/api";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

// Hàm convert datetime từ API về dạng YYYY-MM-DD cho input[type=date]
function normalizeMovieForForm(movie) {
  const toDateInput = (value) => {
    if (!value) return "";
    // nếu backend trả "2024-02-10T00:00:00.000Z" thì cắt 10 ký tự đầu
    return String(value).slice(0, 10);
  };

  return {
    ...movie,
    StartDate: toDateInput(movie.StartDate),
    EndDate: toDateInput(movie.EndDate)
  };
}

const renderDate = (value) => {
  if (!value) return "";
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return value;

  const date = dateObj.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return date;
};

// Hàm convert giới hạn tuổi sang loại phim
const formatAgeRestriction = (age) => {
  if (!age && age !== 0) return "";
  
  const ageNum = Number(age);
  if (ageNum === 0) return "P";
  if (ageNum < 13) return "K";
  if (ageNum === 13) return "T13";
  if (ageNum === 16) return "T16";
  if (ageNum === 18) return "T18";
  if (ageNum === -1) return "C";
  
  return `T${ageNum}`;
};

const cleanupModalArtifacts = () => {
  // remove leftovers if Bootstrap backdrop sticks around
  document.body.classList.remove("modal-open");
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  document
    .querySelectorAll(".modal-backdrop")
    .forEach((el) => el.parentNode?.removeChild(el));
};

const hideModalById = (id) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) {
    cleanupModalArtifacts();
    return;
  }

  const instance = Modal.getInstance(modalEl);
  if (instance) {
    instance.hide();
    // Dispose the instance to ensure clean state
    setTimeout(() => {
      instance.dispose();
      cleanupModalArtifacts();
    }, 200);
  } else {
    cleanupModalArtifacts();
  }
};

function MoviePage() {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // TOAST STATE
  const [toast, setToast] = useState(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // FORM STATE
  const [form, setForm] = useState({
    MovieID: "",
    Title: "",
    Language: "",
    StartDate: "",
    EndDate: "",
    ProductionYear: "",
    AgeRestriction: "",
    Duration: "",
    Summary: "",
    Director: ""
  });
  const [originalForm, setOriginalForm] = useState(null);


  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // SEARCH + SORT
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("StartDate");
  const [sortOrder, setSortOrder] = useState("asc");

  // ================================
  // LOAD MOVIES FROM API
  // ================================
  const loadMovies = async () => {
    try {
      const res = await getMovies({
        search,
        sortBy: sortField,
        sortDir: sortOrder,
        page: currentPage,
        pageSize
      });

      setMovies(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
      let errorMsg = "Không thể tải danh sách phim!";
      if (err.response && err.response.data) {
        const sqlError = err.response.data.error || "";
        if (typeof sqlError === 'string') {
          if (sqlError.includes('Khong the xoa phim da hoac dang chieu')) {
            errorMsg = 'Không thể xóa phim đã hoặc đang chiếu (StartDate <= hôm nay)';
          } else if (sqlError.includes('Invalid')) {
            errorMsg = 'Lỗi cấu trúc dữ liệu. Vui lòng liên hệ quản trị viên';
          } else {
            errorMsg = 'Có lỗi xảy ra. Vui lòng thử lại';
          }
        }
      }
      setToast({ message: errorMsg, type: "error" });
    }
  };

  useEffect(() => {
    loadMovies();
  }, [search, sortField, sortOrder, currentPage, pageSize]);

  // Clear any leftover modal/backdrop on mount
  useEffect(() => {
    cleanupModalArtifacts();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setForm({
      MovieID: "",
      Title: "",
      Language: "",
      StartDate: "",
      EndDate: "",
      ProductionYear: "",
      AgeRestriction: "",
      Duration: "",
      Summary: "",
      Director: ""
    });
    setOriginalForm(null);
    setEditingId(null);
  };

  // CREATE MOVIE
  const handleCreate = async () => {
    if (!form.MovieID.trim()) return setToast({ message: "Mã phim không được để trống!", type: "warning" });
    if (!form.Title.trim()) return setToast({ message: "Tên phim không được để trống!", type: "warning" });

    const start = form.StartDate ? new Date(form.StartDate) : null;
    const end = form.EndDate ? new Date(form.EndDate) : null;
    if (start && end && start > end) {
      return setToast({ message: "Ngày bắt đầu không được sau ngày kết thúc!", type: "warning" });
    }

    try {
      await createMovie(form);
      resetForm();
      loadMovies();

      hideModalById("addMovieModal");
      setToast({ message: "Thêm phim thành công!", type: "success" });

    } catch (err) {
      setToast({ message: err.response?.data?.error || "Lỗi khi thêm phim!", type: "error" });
    }
  };

  // UPDATE MOVIE
  const handleUpdate = async () => {
    if (!form.Title.trim()) return setToast({ message: "Tên phim không được để trống!", type: "warning" });

    const start = form.StartDate ? new Date(form.StartDate) : null;
    const end = form.EndDate ? new Date(form.EndDate) : null;
    if (start && end && start > end) {
      return setToast({ message: "Ngày bắt đầu không được sau ngày kết thúc!", type: "warning" });
    }

    const noChange =
      originalForm &&
      Object.keys(form).every(
        (key) => String(form[key] ?? "") === String(originalForm[key] ?? "")
      );
    if (noChange) return setToast({ message: "Bạn chưa có thay đổi gì!", type: "warning" });

    try {
      await updateMovie(editingId, form);

      resetForm();
      loadMovies();

      hideModalById("editMovieModal");
      setToast({ message: "Cập nhật phim thành công!", type: "success" });

    } catch (err) {
      setToast({ message: err.response?.data?.error || "Lỗi khi cập nhật phim!", type: "error" });
    }
  };

  // Khi bấm Sửa
  const handleEdit = (movie) => {
    cleanupModalArtifacts();
    const normalized = normalizeMovieForForm(movie);
    setForm(normalized); // convert date to YYYY-MM-DD
    setOriginalForm(normalized);
    setEditingId(movie.MovieID);
  };

  const handleDelete = async (id) => {
    // Cleanup any existing backdrop before opening new modal
    cleanupModalArtifacts();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMovie(deleteId);
      setDeleteId(null);
      hideModalById("deleteMovieModal");
      
      // Wait for modal to close before reloading data
      setTimeout(() => {
        loadMovies();
        setToast({ message: "Xóa phim thành công!", type: "success" });
      }, 300);
    } catch (err) {
      setDeleteId(null);
      hideModalById("deleteMovieModal");
      
      // Wait for modal to close before showing error
      setTimeout(() => {
        let errorMsg = "Không thể xóa phim!";
        if (err.response && err.response.data) {
          const sqlError = err.response.data.error || "";
          if (typeof sqlError === 'string') {
            if (sqlError.includes('Khong the xoa phim da hoac dang chieu')) {
              errorMsg = 'Không thể xóa phim đang chiếu!'; //startdate <= today
            } else if (sqlError.includes('REFERENCE constraint')) {
              errorMsg = 'Không thể xóa phim vì đang có dữ liệu liên quan (vé đã bán, đánh giá,...)';
            } else {
              errorMsg = 'Có lỗi xảy ra khi xóa phim. Vui lòng thử lại';
            }
          }
        }
        setToast({ message: errorMsg, type: "error" });
      }, 300);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    hideModalById("deleteMovieModal");
  };

  // SORT TOGGLE
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // EXPORT TO CSV
  const handleExportCSV = () => {
    if (movies.length === 0) {
      setToast({ message: "Không có dữ liệu để xuất!", type: "warning" });
      return;
    }

    // Format date for CSV
    const formatDateForCSV = (value) => {
      if (!value) return "";
      const dateObj = new Date(value);
      if (Number.isNaN(dateObj.getTime())) return value;
      
      const date = dateObj.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      return date;
    };

    // CSV headers
    const headers = [
      "Mã phim",
      "Tên phim",
      "Đạo diễn",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Năm sản xuất",
      "Giới hạn tuổi",
      "Thời lượng (phút)",
      "Tóm tắt",
      "Ngôn ngữ"
    ];

    // CSV rows
    const rows = movies.map(m => [
      m.MovieID,
      `\"${m.Title}\"`,
      `\"${m.Director || ""}\"`,
      formatDateForCSV(m.StartDate),
      formatDateForCSV(m.EndDate),
      m.ProductionYear || "",
      m.AgeRestriction || "",
      m.Duration || "",
      `\"${(m.Summary || "").replace(/\"/g, "\"\"")}\"`,
      `\"${m.Language || ""}\"`,
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DanhSachPhim_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ================================
  // RENDER UI
  // ================================
  return (
    <div className="container mt-4 mb-5 position-relative">
      {/* Toast notification */}
      {toast && (
        <div 
          className={`alert alert-${toast.type === 'success' ? 'success' : toast.type === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show position-fixed`}
          role="alert"
          style={{ 
            top: "20px", 
            right: "20px", 
            minWidth: "350px",
            maxWidth: "500px",
            zIndex: 1056,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderLeft: `4px solid ${toast.type === 'success' ? '#198754' : toast.type === 'warning' ? '#ffc107' : '#dc3545'}`
          }}
        >
          <div className="d-flex align-items-center">
            <div className="me-2" style={{ fontSize: "1.5rem" }}>
              {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠' : '✕'}
            </div>
            <div className="flex-grow-1">
              <strong>{toast.type === 'success' ? 'Thành công!' : toast.type === 'warning' ? 'Cảnh báo!' : 'Lỗi!'}</strong>
              <div>{toast.message}</div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setToast(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <h2 className="mb-4 text-center text-primary fw-bold">🎬 Quản lý phim</h2>

      {/* SEARCH */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Tìm phim theo tên..."
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <button
          className="btn btn-success"
          onClick={handleExportCSV}
          title="Xuất ra CSV"
          disabled={movies.length === 0}
        >
          📊 Xuất CSV
        </button>

        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addMovieModal"
          onClick={() => {
            cleanupModalArtifacts();
            resetForm();
          }}
        >
          Thêm phim
        </button>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-hover" style={{ tableLayout: 'auto' }}>
        <thead className="table-dark">
          <tr>
            <th onClick={() => handleSortToggle("Title")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '120px' }}>
              Tên phim {sortField === "Title" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("Director")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '120px' }}>
              Đạo diễn {sortField === "Director" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("StartDate")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '130px', whiteSpace: 'nowrap' }}>
              Ngày bắt đầu {sortField === "StartDate" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("EndDate")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '130px', whiteSpace: 'nowrap' }}>
              Ngày kết thúc {sortField === "EndDate" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("ProductionYear")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '100px', whiteSpace: 'nowrap' }}>
              Năm SX {sortField === "ProductionYear" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("AgeRestriction")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '120px', whiteSpace: 'nowrap' }}>
              Giới hạn tuổi {sortField === "AgeRestriction" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("Duration")} style={{ cursor: "pointer", userSelect: 'none', minWidth: '120px', whiteSpace: 'nowrap' }}>
              Thời lượng {sortField === "Duration" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th style={{ minWidth: '200px' }}>Tóm tắt</th>
            <th style={{ minWidth: '100px' }}>Ngôn ngữ</th>
            <th style={{ width: "120px" }}>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {movies.map((m) => (
            <tr key={m.MovieID}>
              <td>{m.Title}</td>
              <td>{m.Director}</td>
              <td>{renderDate(m.StartDate)}</td>
              <td>{renderDate(m.EndDate)}</td>
              <td>{m.ProductionYear}</td>
              <td>{formatAgeRestriction(m.AgeRestriction)}</td>
              <td>{m.Duration}</td>
              <td style={{ maxWidth: "250px", whiteSpace: "normal" }}>{m.Summary}</td>
              <td>{m.Language}</td>

              <td>
                <button
                  className="btn btn-success btn-sm me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#editMovieModal"
                  onClick={() => handleEdit(m)}
                >
                  Sửa
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteMovieModal"
                  onClick={() => handleDelete(m.MovieID)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex align-items-center gap-3 mt-4 mb-5">
        <div>
          Trang {currentPage} / {totalPages}
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <IoChevronBack size={20} />
            Trước
          </button>
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau
            <IoChevronForward size={20} />
          </button>
        </div>
        <div className="d-flex align-items-center gap-2 ms-auto">
          <label className="mb-0">Page size</label>
          <select
            className="form-select"
            style={{ width: "90px" }}
            value={pageSize}
            onChange={(e) => {
              const val = Number(e.target.value) || 5;
              setPageSize(val);
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MODAL THÊM PHIM */}
      <div className="modal fade" id="addMovieModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thêm phim mới</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <MovieForm form={form} setForm={setForm} disableId={false} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleCreate}>
                Thêm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SỬA PHIM */}
      <div className="modal fade" id="editMovieModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cập nhật phim</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <MovieForm form={form} setForm={setForm} disableId={true} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XÓA PHIM */}
      <div className="modal fade" id="deleteMovieModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xác nhận xóa phim</h5>
              <button className="btn-close" data-bs-dismiss="modal" onClick={cancelDelete}></button>
            </div>

            <div className="modal-body">
              <p>Bạn chắc chắn muốn xóa phim này?</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal" onClick={cancelDelete}>
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoviePage;

function MovieForm({ form, setForm, disableId }) {
  return (
    <>
      {/* Row 1 */}
      <div className="row">
        <div className="col-md-4 mb-2">
          <label>Mã phim</label>
          <input
            className="form-control"
            value={form.MovieID}
            disabled={disableId}
            onChange={(e) => setForm({ ...form, MovieID: e.target.value })}
          />
        </div>

        <div className="col-md-8 mb-2">
          <label>Tên phim</label>
          <input
            className="form-control"
            value={form.Title}
            onChange={(e) => setForm({ ...form, Title: e.target.value })}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="row">
        <div className="col-md-4 mb-2">
          <label>Ngôn ngữ</label>
          <input
            className="form-control"
            value={form.Language}
            onChange={(e) => setForm({ ...form, Language: e.target.value })}
          />
        </div>

        <div className="col-md-4 mb-2">
          <label>Ngày bắt đầu</label>
          <input
            type="date"
            className="form-control"
            value={form.StartDate}
            onChange={(e) =>
              setForm({ ...form, StartDate: e.target.value })
            }
          />
        </div>

        <div className="col-md-4 mb-2">
          <label>Ngày kết thúc</label>
          <input
            type="date"
            className="form-control"
            value={form.EndDate}
            onChange={(e) =>
              setForm({ ...form, EndDate: e.target.value })
            }
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="row">
        <div className="col-md-4 mb-2">
          <label>Năm sản xuất</label>
          <input
            type="number"
            className="form-control"
            value={form.ProductionYear}
            onChange={(e) =>
              setForm({ ...form, ProductionYear: Number(e.target.value) })
            }
          />
        </div>

        <div className="col-md-4 mb-2">
          <label>Giới hạn tuổi</label>
          <select
            className="form-control"
            value={form.AgeRestriction}
            onChange={(e) =>
              setForm({ ...form, AgeRestriction: e.target.value === "" ? "" : Number(e.target.value) })
            }
          >
            <option value="">-- Chọn loại phim --</option>
            <option value="0">P - Phổ biến (Mọi lứa tuổi)</option>
            <option value="12">K - Dưới 13 tuổi (có giám sát)</option>
            <option value="13">T13 - Từ 13 tuổi trở lên</option>
            <option value="16">T16 - Từ 16 tuổi trở lên</option>
            <option value="18">T18 - Từ 18 tuổi trở lên</option>
            <option value="-1">C - Cấm phổ biến</option>
          </select>
        </div>

        <div className="col-md-4 mb-2">
          <label>Thời lượng (phút)</label>
          <input
            type="number"
            className="form-control"
            value={form.Duration}
            onChange={(e) =>
              setForm({ ...form, Duration: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-2">
        <label>Tóm tắt</label>
        <textarea
          className="form-control"
          rows="3"
          value={form.Summary}
          onChange={(e) => setForm({ ...form, Summary: e.target.value })}
        />
      </div>

      {/* Director */}
      <div className="mb-2">
        <label>Đạo diễn</label>
        <input
          className="form-control"
          value={form.Director}
          onChange={(e) => setForm({ ...form, Director: e.target.value })}
        />
      </div>
    </>
  );
}
