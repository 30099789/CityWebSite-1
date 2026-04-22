import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/userService";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "resident",
    password: "123456",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setMessage("Failed to load users");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      role: "resident",
      password: "123456",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setMessage("Name and email are required");
      return;
    }

    try {
      if (editingId) {
        await updateUser(editingId, form);
        setMessage("User updated successfully");
      } else {
        await createUser(form);
        setMessage("User added successfully");
      }

      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      setMessage("Failed to save user");
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "resident",
      password: user.password || "123456",
    });
    setEditingId(user._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;

    try {
      await deleteUser(id);
      setMessage("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setMessage("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" ? true : user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const staffCount = users.filter((u) => u.role === "staff").length;
  const residentCount = users.filter((u) => u.role === "resident").length;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Admin Panel</p>
            <h1 className="text-4xl font-bold text-slate-900">Manage Users</h1>
            <p className="text-slate-600 mt-2">
              Add, edit and remove portal users from one place.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to Dashboard
            </Link>

            <button
              onClick={loadUsers}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Users</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{users.length}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Admins</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">{adminCount}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Staff</p>
            <h2 className="text-3xl font-bold text-amber-600 mt-2">{staffCount}</h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Residents</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">{residentCount}</h2>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        {/* Form */}
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingId ? "Edit User" : "Add New User"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the details below to create or update a user account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="resident">Resident</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            <input
              type="text"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                {editingId ? "Update User" : "Add User"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Filters */}
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="resident">Residents</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </section>

        {/* User cards */}
        <section className="grid gap-5">
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-8 text-center text-slate-500">
              No users found.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {user.name}
                    </h3>
                    <p className="text-slate-600">{user.email}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        Role: {user.role}
                      </span>

                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        Created:{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(user._id)}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}