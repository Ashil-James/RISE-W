import React, { useState, useEffect } from "react";
import { Search, User, Edit2, Trash2, RefreshCw, Users, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useUser } from "../../context/UserContext";

// --- SHIMMER SKELETON ---
const TableSkeleton = () => (
  <div className="space-y-8 pb-20">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="h-10 w-64 rounded-2xl mb-3 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"></div>
        <div className="h-4 w-48 rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"></div>
      </div>
    </div>
    <div className="rounded-3xl p-6 animate-pulse" style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.03)",
    }}>
      <div className="flex gap-4 mb-6"><div className="h-10 w-96 bg-white/[0.04] rounded-xl"></div></div>
    </div>
    <div className="rounded-3xl p-6 animate-pulse" style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.03)",
    }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04]"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-white/[0.04] rounded-lg mb-2"></div>
            <div className="h-3 w-48 bg-white/[0.04] rounded-lg"></div>
          </div>
          <div className="h-7 w-20 bg-white/[0.04] rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

const roleGradients = {
  admin: { bg: "linear-gradient(135deg, #8b5cf6, #6366f1)", glow: "rgba(139,92,246,0.4)" },
  authority: { bg: "linear-gradient(135deg, #3b82f6, #06b6d4)", glow: "rgba(59,130,246,0.4)" },
  user: { bg: "linear-gradient(135deg, #10b981, #06b6d4)", glow: "rgba(16,185,129,0.4)" },
};

const AdminUsers = () => {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${currentUser?.token}` } };
      const { data: response } = await axios.get("/api/v1/admin/users", config);
      if (response.success) setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) fetchUsers();
  }, [currentUser?.token]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const config = { headers: { Authorization: `Bearer ${currentUser?.token}` } };
      const { data: response } = await axios.put(`/api/v1/admin/users/${userId}/role`, { role: newRole.toLowerCase() }, config);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole.toLowerCase() } : u));
        setSuccessId(userId);
        setTimeout(() => setSuccessId(null), 1500);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || user.role.toLowerCase() === filterRole.toLowerCase() || (filterRole === "Resident" && user.role.toLowerCase() === "user");
    return matchesSearch && matchesRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, type: "spring", stiffness: 120, damping: 14 } }),
  };

  if (loading && users.length === 0) return <TableSkeleton />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-20">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
            <Users size={32} className="text-emerald-500" />
            User Management
            <Sparkles size={22} className="text-emerald-400/60" />
          </h1>
          <p className="text-gray-400">Manage access, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers}
            className="p-3 text-white rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 50px -15px rgba(16,185,129,0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-3 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 8px 30px -5px rgba(16,185,129,0.4)" }}>
            <User size={18} /> Add New User
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="rounded-3xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          backdropFilter: "blur(20px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-600 transition-all"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Resident", "Authority", "Admin"].map((role) => (
            <motion.button key={role} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setFilterRole(role)}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex-shrink-0"
              style={filterRole === role
                ? { background: "linear-gradient(135deg, #10b981, #06b6d4)", color: "white", boxShadow: "0 0 25px rgba(16,185,129,0.4)" }
                : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.04)" }}>
              {role}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants} className="rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          backdropFilter: "blur(20px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <AnimatePresence>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const rg = roleGradients[user.role] || roleGradients.user;
                    const isSuccess = successId === user._id;

                    return (
                      <motion.tr key={user._id} custom={index} variants={rowVariants} initial="hidden" animate="visible"
                        className="group cursor-default border-l-2 border-l-transparent hover:border-l-emerald-500/50 transition-all duration-500 hover:bg-emerald-500/[0.02]"
                        style={{ background: isSuccess ? "rgba(16,185,129,0.04)" : "transparent" }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-60 blur-sm transition-opacity duration-500" style={{ background: rg.bg }}></div>
                              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg"
                                style={{ background: rg.bg, boxShadow: `0 4px 15px -3px ${rg.glow}` }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="text-white font-bold tracking-tight group-hover:text-emerald-300 transition-colors">{user.name}</div>
                              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              disabled={updatingId === user._id || user._id === currentUser?._id}
                              value={user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() === 'User' ? 'Resident' : user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}
                              onChange={(e) => {
                                const val = e.target.value === 'Resident' ? 'user' : e.target.value.toLowerCase();
                                handleRoleChange(user._id, val);
                              }}
                              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer transition-all duration-300"
                              style={{
                                background: user.role === 'admin' ? 'rgba(139,92,246,0.08)' : user.role === 'authority' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)',
                                color: user.role === 'admin' ? '#a78bfa' : user.role === 'authority' ? '#60a5fa' : '#34d399',
                                border: `1px solid ${user.role === 'admin' ? 'rgba(139,92,246,0.15)' : user.role === 'authority' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)'}`,
                              }}>
                              <option value="Resident" style={{ background: "#0a0f19" }}>Resident</option>
                              <option value="Authority" style={{ background: "#0a0f19" }}>Authority</option>
                              <option value="Admin" style={{ background: "#0a0f19" }}>Admin</option>
                            </select>
                            {updatingId === user._id && (
                              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
                                <RefreshCw size={12} className="animate-spin text-emerald-500" />
                              </motion.div>
                            )}
                            {isSuccess && (
                              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                                ✓ Updated
                              </motion.div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono tabular-nums">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="p-2 rounded-xl text-gray-400 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.03)" }}>
                              <Edit2 size={15} />
                            </button>
                            <button
                              disabled={user._id === currentUser?._id}
                              className={`p-2 rounded-xl text-gray-400 hover:text-red-400 transition-all ${user._id === currentUser?._id ? "cursor-not-allowed opacity-30" : ""}`}
                              style={{ background: "rgba(255,255,255,0.03)" }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-500">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-white mb-1">{loading ? "Loading users..." : "No users found"}</p>
                        <p className="text-sm">Try adjusting your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="p-4 flex justify-between items-center px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
          <span className="text-xs text-gray-500">
            Showing <span className="text-white font-bold">{filteredUsers.length}</span> of <span className="text-white font-bold">{users.length}</span> users
          </span>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">RISE Admin Panel</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminUsers;
