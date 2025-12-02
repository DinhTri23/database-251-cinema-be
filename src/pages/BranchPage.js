import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:6868";
const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

// API helpers
const fetchBranches = async (params) => {
  const res = await client.get("/api/branches", { params });
  return res.data;
};

const createBranch = async (payload) => {
  const res = await client.post("/api/branches", payload);
  return res.data;
};

const updateBranch = async (id, payload) => {
  const res = await client.put(`/api/branches/${id}`, payload);
  return res.data;
};

const patchBranch = async (id, payload) => {
  const res = await client.patch(`/api/branches/${id}`, payload);
  return res.data;
};

const deleteBranch = async (id) => {
  const res = await client.delete(`/api/branches/${id}`);
  return res.data;
};

const cleanupModalArtifacts = () => {
  document.body.classList.remove("modal-open");
  document
    .querySelectorAll(".modal-backdrop")
    .forEach((node) => node.parentNode?.removeChild(node));
  document.querySelectorAll(".modal.show").forEach((node) => {
    node.classList.remove("show");
    node.setAttribute("aria-hidden", "true");
    node.style.display = "none";
  });
};

const cleanupModal = (id) => {
  const el = document.getElementById(id);
  if (el) {
    const instance = Modal.getOrCreateInstance(el);
    instance.hide();
  }
  setTimeout(cleanupModalArtifacts, 200);
};

const emptyForm = {
  BranchID: "",
  Name: "",
  Address: "",
  ContactNumber: ""
};

const sortOptions = [
  { key: "branchid", label: "Mã chi nhánh" },
  { key: "name", label: "Tên chi nhánh" },
  { key: "address", label: "Địa chỉ" },
  { key: "contactnumber", label: "Số liên hệ" }
];

const parseError = (err) => {
  const msg =
    err?.response?.data?.error ||
    (Array.isArray(err?.response?.data?.errors)
      ? err.response.data.errors.join(", ")
      : err?.message);
  return msg || "Unknown error";
};

const validateForm = (form, { requireId }) => {
  if (requireId && !form.BranchID.trim()) {
    return "BranchID không được để trống";
  }
  if (!form.Name.trim()) return "Tên chi nhánh không được để trống";
  if (!form.Address.trim()) return "Địa chỉ không được để trống";
  if (!form.ContactNumber.trim()) return "ContactNumber không được để trống";
  if (!/^0[0-9]{8,10}$/.test(form.ContactNumber.trim())) {
    return "Lỗi khi cập nhật thông tin ContactNumber";
  }
    return null;
};

function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("branchid");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [originalForm, setOriginalForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const showToast = (message, variant = "info", duration = 3000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, variant });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchBranches({
        search: search || undefined,
        sortBy,
        sortDir,
        page,
        pageSize
      });
      setBranches(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, sortBy, sortDir, page, pageSize]);

  // Clear any leftover modal/backdrop on mount
  useEffect(() => {
    cleanupModalArtifacts();
  }, []);

  const resetForm = () => {
    setToast(null);
    setForm(emptyForm);
    setOriginalForm(null);
    setEditingId(null);
  };

  const handleCreate = async () => {
    setToast(null);
    const msg = validateForm(form, { requireId: true });
    if (msg) return showToast(msg, "warning");
    try {
      await createBranch(form);
      resetForm();
      cleanupModal("branchAddModal");
      await loadData();
      showToast("Thêm chi nhánh thành công!", "success");
    } catch (err) {
      showToast(parseError(err), "danger");
    }
  };

  const handleUpdate = async () => {
    setToast(null);
    const msg = validateForm(form, { requireId: false });
    if (msg) {
      return showToast(msg, "warning");
    }
    if (!editingId) return;

    const noChange =
      originalForm &&
      Object.keys(form).every(
        (key) => String(form[key] ?? "") === String(originalForm[key] ?? "")
      );
    if (noChange) {
      return showToast("Bạn chưa có thay đổi gì", "warning");
    }

    try {
      await updateBranch(editingId, {
        Name: form.Name,
        Address: form.Address,
        ContactNumber: form.ContactNumber
      });
      resetForm();
      cleanupModal("branchEditModal");
      await loadData();
      showToast("Cập nhật chi nhánh thành công!", "success");
    } catch (err) {
      const parsed = parseError(err);
      showToast(parsed, "danger");
    }
  };

  const handlePatch = async () => {
    setToast(null);
    if (!editingId) return;
    const changed = {};
    Object.keys(form).forEach((key) => {
      if (form[key] !== (originalForm?.[key] ?? "")) {
        changed[key] = form[key];
      }
    });
    if (Object.keys(changed).length === 0) {
      return showToast("Bạn chưa có thay đổi gì", "warning");
    }

    const merged = { ...(originalForm || {}), ...changed };
    const msg = validateForm(merged, { requireId: false });
    if (msg) {
      return showToast(msg, "warning");
    }

    try {
      await patchBranch(editingId, changed);
      resetForm();
      cleanupModal("branchEditModal");
      await loadData();
      showToast("Cập nhật nhanh thành công!", "success");
    } catch (err) {
      const parsed = parseError(err);
      showToast(parsed, "danger");
    }
  };

  const handleEdit = (branch) => {
    setToast(null);
    cleanupModalArtifacts();
    setEditingId(branch.BranchID);
    setForm({
      BranchID: branch.BranchID || "",
      Name: branch.Name || "",
      Address: branch.Address || "",
      ContactNumber: branch.ContactNumber || ""
    });
    setOriginalForm({
      BranchID: branch.BranchID || "",
      Name: branch.Name || "",
      Address: branch.Address || "",
      ContactNumber: branch.ContactNumber || ""
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa chi nhánh này?")) return;
    try {
      await deleteBranch(id);
      await loadData();
    } catch (err) {
      showToast(parseError(err), "danger");
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortDir === "asc" ? "▲" : "▼";
  };

  // EXPORT TO CSV
  const handleExportCSV = () => {
    if (branches.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // CSV headers
    const headers = [
      "Mã chi nhánh",
      "Tên chi nhánh",
      "Địa chỉ",
      "Số điện thoại"
    ];

    // CSV rows
    const rows = branches.map(b => [
      b.BranchID,
      `\"${b.Name}\"`,,
      `\"${b.Address}\"`,,
      b.ContactNumber
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DanhSachChiNhanh_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-4 mb-5 position-relative">
      {toast && (
        <div
          className={`alert alert-${toast.variant} position-fixed`}
          style={{ top: "20px", right: "20px", minWidth: "260px", zIndex: 1056 }}
        >
          {toast.message}
        </div>
      )}
      <h2 className="mb-4 text-center text-primary fw-bold">🏢 Quản lý chi nhánh</h2>

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Tìm kiếm theo tên chi nhánh..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <button
          className="btn btn-success"
          onClick={handleExportCSV}
          title="Xuất ra CSV"
          disabled={branches.length === 0}
        >
          📊 Xuất CSV
        </button>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#branchAddModal"
          onClick={() => {
            cleanupModalArtifacts();
            resetForm();
          }}
        >
          Thêm chi nhánh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '35%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead className="table-dark">
            <tr>
              {sortOptions.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{ cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}
                >
                  {col.label} {renderSortIcon(col.key)}
                </th>
              ))}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.BranchID}>
                <td>{b.BranchID}</td>
                <td>{b.Name}</td>
                <td>{b.Address}</td>
                <td>{b.ContactNumber}</td>
                <td style={{ width: "150px" }}>
                  <button
                    className="btn btn-success btn-sm me-2"
                    data-bs-toggle="modal"
                    data-bs-target="#branchEditModal"
                    onClick={() => handleEdit(b)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(b.BranchID)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {!loading && branches.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-3">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div>
          Trang {page} / {totalPages}
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </button>
          <button
            className="btn btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau
          </button>
        </div>
        <div className="d-flex align-items-center gap-2 ms-auto">
          <label className="mb-0">Page size</label>
          <select
            className="form-select"
            style={{ width: "90px" }}
            value={pageSize}
            onChange={(e) => {
              const val = Number(e.target.value) || 10;
              setPageSize(Math.min(100, Math.max(1, val)));
              setPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        {loading && <span className="text-muted">Đang tải...</span>}
      </div>

      {/* Modal thêm */}
      <div className="modal fade" id="branchAddModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thêm chi nhánh</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <BranchForm form={form} setForm={setForm} disableId={false} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleCreate}>
                Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal sửa */}
      <div className="modal fade" id="branchEditModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cập nhật chi nhánh</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <BranchForm form={form} setForm={setForm} disableId={true} />
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <div className="d-flex gap-2">
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
    </div>
  );
}

function BranchForm({ form, setForm, disableId }) {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label">Mã chi nhánh</label>
        <input
          className="form-control"
          value={form.BranchID}
          disabled={disableId}
          onChange={(e) => setForm({ ...form, BranchID: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Tên chi nhánh</label>
        <input
          className="form-control"
          value={form.Name}
          onChange={(e) => setForm({ ...form, Name: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Địa chỉ</label>
        <input
          className="form-control"
          value={form.Address}
          onChange={(e) => setForm({ ...form, Address: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Số liên hệ</label>
        <input
          className="form-control"
          value={form.ContactNumber}
          onChange={(e) => setForm({ ...form, ContactNumber: e.target.value })}
        />
        <div className="form-text">Chỉ chữ số, 9-11 ký tự</div>
      </div>
    </div>
  );
}

export default BranchPage;
