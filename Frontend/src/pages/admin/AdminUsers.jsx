import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, User, Shield, Edit2, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useUser } from "../../context/UserContext";

const AdminUsers = () => {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

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

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">User Management</h1>
          <p className="text-gray-400">Manage access, roles, and permissions.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchUsers}
                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
            <User size={18} /> Add New User
            </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Resident", "Authority", "Admin"].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                filterRole === role 
                  ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  : "bg-white/5 text-gray-500 border border-transparent hover:bg-white/10 hover:text-gray-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold tracking-tight">{user.name}</div>
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-transparent outline-none cursor-pointer ${
                                user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                user.role === 'authority' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                        >
                            <option value="Resident" className="bg-neutral-900 text-emerald-400">Resident</option>
                            <option value="Authority" className="bg-neutral-900 text-blue-400">Authority</option>
                            <option value="Admin" className="bg-neutral-900 text-purple-400">Admin</option>
                        </select>
                        {updatingId === user._id && <RefreshCw size={12} className="animate-spin text-emerald-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button 
                            disabled={user._id === currentUser?._id}
                            className={`p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors ${user._id === currentUser?._id ? "cursor-not-allowed opacity-30" : ""}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    {loading ? "Loading users..." : "No users found matching your criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminUsers;
