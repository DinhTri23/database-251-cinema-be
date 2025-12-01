import React, { useEffect, useMemo, useState } from "react";
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
  { key: "branchid", label: "BranchID" },
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "contactnumber", label: "ContactNumber" }
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
    return "BranchID khong duoc de trong";
  }
  if (!form.Name.trim()) return "Name khong duoc de trong";
  if (!form.Address.trim()) return "Address khong duoc de trong";
  if (!form.ContactNumber.trim()) return "ContactNumber khong duoc de trong";
  if (!/^[0-9]{9,11}$/.test(form.ContactNumber.trim())) {
    return "ContactNumber chi duoc chua so (9-11 ky tu)";
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

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
    setForm(emptyForm);
    setOriginalForm(null);
    setEditingId(null);
  };

  const handleCreate = async () => {
    const msg = validateForm(form, { requireId: true });
    if (msg) return alert(msg);
    try {
      await createBranch(form);
      resetForm();
      cleanupModal("branchAddModal");
      await loadData();
      alert("Them chi nhanh thanh cong!");
    } catch (err) {
      alert(parseError(err));
    }
  };

  const handleUpdate = async () => {
    const msg = validateForm(form, { requireId: false });
    if (msg) return alert(msg);
    if (!editingId) return;

    const noChange =
      originalForm &&
      Object.keys(form).every(
        (key) => String(form[key] ?? "") === String(originalForm[key] ?? "")
      );
    if (noChange) return alert("Ban chua co thay doi gi");

    try {
      await updateBranch(editingId, {
        Name: form.Name,
        Address: form.Address,
        ContactNumber: form.ContactNumber
      });
      resetForm();
      cleanupModal("branchEditModal");
      await loadData();
      alert("Cap nhat chi nhanh thanh cong!");
    } catch (err) {
      alert(parseError(err));
    }
  };

  const handlePatch = async () => {
    if (!editingId) return;
    const changed = {};
    Object.keys(form).forEach((key) => {
      if (form[key] !== (originalForm?.[key] ?? "")) {
        changed[key] = form[key];
      }
    });
    if (Object.keys(changed).length === 0) {
      return alert("Ban chua thay doi gi de cap nhat nhanh");
    }

    const merged = { ...(originalForm || {}), ...changed };
    const msg = validateForm(merged, { requireId: false });
    if (msg) return alert(msg);

    try {
      await patchBranch(editingId, changed);
      resetForm();
      cleanupModal("branchEditModal");
      await loadData();
      alert("Cap nhat nhanh thanh cong!");
    } catch (err) {
      alert(parseError(err));
    }
  };

  const handleEdit = (branch) => {
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
    if (!window.confirm("Ban chac chan muon xoa chi nhanh nay?")) return;
    try {
      await deleteBranch(id);
      await loadData();
    } catch (err) {
      alert(parseError(err));
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

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4">Quản lý chi nhánh</h2>

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
          className="btn btn-primary ms-auto"
          data-bs-toggle="modal"
          data-bs-target="#branchAddModal"
          onClick={() => {
            cleanupModalArtifacts();
            resetForm();
          }}
        >
          + Thêm chi nhánh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              {sortOptions.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
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
              <button className="btn btn-outline-secondary" onClick={handlePatch}>
                Lưu nhanh (PATCH)
              </button>
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
        <label className="form-label">BranchID</label>
        <input
          className="form-control"
          value={form.BranchID}
          disabled={disableId}
          onChange={(e) => setForm({ ...form, BranchID: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Name</label>
        <input
          className="form-control"
          value={form.Name}
          onChange={(e) => setForm({ ...form, Name: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Address</label>
        <input
          className="form-control"
          value={form.Address}
          onChange={(e) => setForm({ ...form, Address: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">ContactNumber</label>
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
