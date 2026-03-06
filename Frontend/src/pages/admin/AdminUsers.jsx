import React, { useState, useEffect } from "react";
import { Search, User, Edit2, Trash2, RefreshCw, Users, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useUser } from "../../context/UserContext";

// --- SHIMMER SKELETON ---
const TableSkeleton = () => (
  <div className="space-y-8 pb-20 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="h-10 w-64 bg-white/5 rounded-2xl mb-3"></div>
        <div className="h-4 w-48 bg-white/5 rounded-lg"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-12 w-12 bg-white/5 rounded-xl"></div>
        <div className="h-12 w-40 bg-white/5 rounded-xl"></div>
      </div>
    </div>
    <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6">
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-96 bg-white/5 rounded-xl"></div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/5"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-white/5 rounded-lg mb-2"></div>
            <div className="h-3 w-48 bg-white/5 rounded-lg"></div>
          </div>
          <div className="h-7 w-20 bg-white/5 rounded-full"></div>
          <div className="h-4 w-24 bg-white/5 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
);

// --- ROLE GRADIENT MAP ---
const roleGradients = {
  admin: {
    bg: "from-purple-500 to-violet-600",
    shadow: "shadow-purple-500/20",
    border: "border-l-purple-500",
  },
  authority: {
    bg: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    border: "border-l-blue-500",
  },
  user: {
    bg: "from-emerald-500 to-cyan-500",
    shadow: "shadow-emerald-500/20",
    border: "border-l-emerald-500",
  },
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
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };
      const { data: response } = await axios.get("/api/v1/admin/users", config);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      fetchUsers();
    }
  }, [currentUser?.token]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };
      const { data: response } = await axios.put(`/api/v1/admin/users/${userId}/role`, { role: newRole.toLowerCase() }, config);

      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole.toLowerCase() } : u));
        // Success flash
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
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" ||
      user.role.toLowerCase() === filterRole.toLowerCase() ||
      (filterRole === "Resident" && user.role.toLowerCase() === "user");
    return matchesSearch && matchesRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, type: "spring", stiffness: 120, damping: 14 },
    }),
  };

  if (loading && users.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
            <Users size={32} className="text-emerald-500" />
            User Management
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles size={22} className="text-emerald-400/60" />
            </motion.div>
          </h1>
          <p className="text-gray-400">Manage access, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchUsers}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 hover:border-white/10 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px -15px rgba(16,185,129,0.4)" }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <User size={18} /> Add New User
          </motion.button>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        variants={itemVariants}
        className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-all duration-500"
      >
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Resident", "Authority", "Admin"].map((role) => (
            <motion.button
              key={role}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex-shrink-0 relative overflow-hidden ${filterRole === role
                ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                : "bg-white/5 text-gray-500 border border-transparent hover:bg-white/10 hover:text-gray-300"
                }`}
            >
              {filterRole === role && (
                <motion.div
                  layoutId="filter-active"
                  className="absolute inset-0 bg-emerald-500 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {role}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        variants={itemVariants}
        className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 hover:border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.03] border-b border-white/5">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const rg = roleGradients[user.role] || roleGradients.user;
                    const isSuccess = successId === user._id;

                    return (
                      <motion.tr
                        key={user._id}
                        custom={index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className={`transition-all duration-500 group cursor-default border-l-2 border-l-transparent hover:border-l-emerald-500/50 ${isSuccess
                          ? "bg-emerald-500/[0.05]"
                          : "hover:bg-emerald-500/[0.02]"
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {/* Avatar ring glow on hover */}
                              <div className={`absolute -inset-0.5 bg-gradient-to-br ${rg.bg} rounded-xl opacity-0 group-hover:opacity-60 blur-sm transition-opacity duration-500`}></div>
                              <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${rg.bg} flex items-center justify-center text-white font-black text-sm ${rg.shadow} shadow-lg`}>
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
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-transparent outline-none cursor-pointer transition-all duration-300 ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/40' :
                                user.role === 'authority' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
                                }`}
                            >
                              <option value="Resident" className="bg-neutral-900 text-emerald-400">Resident</option>
                              <option value="Authority" className="bg-neutral-900 text-blue-400">Authority</option>
                              <option value="Admin" className="bg-neutral-900 text-purple-400">Admin</option>
                            </select>
                            {updatingId === user._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <RefreshCw size={12} className="animate-spin text-emerald-500" />
                              </motion.div>
                            )}
                            {isSuccess && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full"
                              >
                                ✓ Updated
                              </motion.div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono tabular-nums">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                            >
                              <Edit2 size={15} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={user._id === currentUser?._id}
                              className={`p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition-all ${user._id === currentUser?._id ? "cursor-not-allowed opacity-30" : ""}`}
                            >
                              <Trash2 size={15} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Search size={48} className="mb-4 opacity-20" />
                        </motion.div>
                        <p className="text-lg font-medium text-white mb-1">
                          {loading ? "Loading users..." : "No users found"}
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or filter criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="p-4 border-t border-white/5 flex justify-between items-center px-6">
          <span className="text-xs text-gray-500">
            Showing <span className="text-white font-bold">{filteredUsers.length}</span> of <span className="text-white font-bold">{users.length}</span> users
          </span>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            RISE Admin Panel
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminUsers;
