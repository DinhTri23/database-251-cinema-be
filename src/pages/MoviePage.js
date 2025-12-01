import React, { useState, useEffect } from "react";
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

function MoviePage() {
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);

  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(1);

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

  const [editingId, setEditingId] = useState(null);

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
      alert("Không thể tải danh sách phim!");
    }
  };

  useEffect(() => {
    loadMovies();
  }, [search, sortField, sortOrder, currentPage]);

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
    setEditingId(null);
  };

  // CREATE MOVIE
  const handleCreate = async () => {
    if (!form.MovieID.trim()) return alert("MovieID không được bỏ trống!");
    if (!form.Title.trim()) return alert("Tên phim không được bỏ trống!");

    try {
      await createMovie(form);
      resetForm();
      loadMovies();

      window.bootstrap.Modal.getInstance(
        document.getElementById("addMovieModal")
      ).hide();

    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi thêm phim!");
    }
  };

  // UPDATE MOVIE
  const handleUpdate = async () => {
    if (!form.Title.trim()) return alert("Tên phim không được bỏ trống!");

    try {
      await updateMovie(editingId, form);

      resetForm();
      loadMovies();

      window.bootstrap.Modal.getInstance(
        document.getElementById("editMovieModal")
      ).hide();

    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi cập nhật phim!");
    }
  };

  // Khi bấm Sửa
  const handleEdit = (movie) => {
    setForm(normalizeMovieForForm(movie)); // ✅ convert ngày về YYYY-MM-DD
    setEditingId(movie.MovieID);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phim này?")) return;

    try {
      await deleteMovie(id);
      loadMovies();
    } catch (err) {
      alert(err.response?.data?.error || "Không thể xóa phim!");
    }
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

  const totalPages = Math.ceil(total / pageSize);

  // ================================
  // RENDER UI
  // ================================
  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">🎬 Quản lý phim</h2>

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
          className="btn btn-primary ms-auto"
          data-bs-toggle="modal"
          data-bs-target="#addMovieModal"
          onClick={resetForm}
        >
          + Thêm phim
        </button>
      </div>

      {/* TABLE */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th onClick={() => handleSortToggle("Title")} style={{ cursor: "pointer" }}>
              Tên phim {sortField === "Title" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("Language")} style={{ cursor: "pointer" }}>
              Đạo diễn {sortField === "Language" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("StartDate")} style={{ cursor: "pointer" }}>
              Ngày bắt đầu {sortField === "StartDate" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("EndDate")} style={{ cursor: "pointer" }}>
              Ngày kết thúc {sortField === "EndDate" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("ProductionYear")} style={{ cursor: "pointer" }}>
              Năm SX {sortField === "ProductionYear" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("AgeRestriction")} style={{ cursor: "pointer" }}>
              Giới hạn tuổi {sortField === "AgeRestriction" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSortToggle("Duration")} style={{ cursor: "pointer" }}>
              Thời lượng {sortField === "Duration" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th>Tóm tắt</th>
            <th>Ngôn ngữ</th>
            <th style={{ width: "140px" }}>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {movies.map((m) => (
            <tr key={m.MovieID}>
              <td>{m.Title}</td>
              <td>{m.Director}</td>
              <td>{m.StartDate}</td>
              <td>{m.EndDate}</td>
              <td>{m.ProductionYear}</td>
              <td>{m.AgeRestriction}</td>
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
      <div className="d-flex justify-content-center align-items-center mt-4 mb-5">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <IoChevronBack size={20} />
          Trước
        </button>

        <div className="mx-4" style={{ fontSize: "18px", fontWeight: "600" }}>
          Trang {currentPage} / {totalPages}
        </div>

        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Sau
          <IoChevronForward size={20} />
        </button>
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
          <input
            type="number"
            className="form-control"
            value={form.AgeRestriction}
            onChange={(e) =>
              setForm({ ...form, AgeRestriction: Number(e.target.value) })
            }
          />
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
