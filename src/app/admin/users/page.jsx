// app/admin/users/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Toast from '../../components/Toast';

export default function AdminUserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/userlist');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId, currentStatus) => {
    try {
      const res = await fetch('/api/admin/userlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isblocked: !currentStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      showToast(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully!`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update user status', 'error');
    }
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !user.isblocked) ||
      (filterStatus === 'blocked' && user.isblocked);
    
    return matchesSearch && matchesStatus;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => !u.isblocked).length,
    blocked: users.filter(u => u.isblocked).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
            <div className="h-20 bg-white rounded-2xl shadow-sm"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage and monitor all registered users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-slide-up">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{userStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Users</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{userStats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Blocked Users</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{userStats.blocked}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
                🚫
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  filterStatus === 'all'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>✅</span>
                Active
              </button>
              <button
                onClick={() => setFilterStatus('blocked')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  filterStatus === 'blocked'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>🚫</span>
                Blocked
              </button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-gray-500 text-lg">No users found.</p>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <div
                key={user._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* User Avatar and Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {user.userImage ? (
                      <Image
                        src={user.userImage}
                        alt={user.name || 'User'}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-gray-200">
                        <span className="text-white font-bold text-lg">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{user.name || '—'}</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isblocked
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}
                      >
                        {user.isblocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📱</span>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📅</span>
                    <span>{new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all duration-200"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => toggleBlock(user._id, user.isblocked)}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 ${
                      user.isblocked
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                    }`}
                  >
                    {user.isblocked ? '✓ Unblock' : '✕ Block'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                {selectedUser.userImage ? (
                  <Image
                    src={selectedUser.userImage}
                    alt={selectedUser.name || 'User'}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-orange-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-orange-100">
                    <span className="text-white font-bold text-3xl">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{selectedUser.name || '—'}</h4>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.isblocked
                        ? 'bg-red-50 text-red-700 border-2 border-red-200'
                        : 'bg-green-50 text-green-700 border-2 border-green-200'
                    }`}
                  >
                    {selectedUser.isblocked ? '🚫 Blocked' : '✅ Active'}
                  </span>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</p>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <span>📧</span>
                    {selectedUser.email}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</p>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <span>📱</span>
                    {selectedUser.phone || 'Not provided'}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Member Since</p>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <span>📅</span>
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">User ID</p>
                  <p className="text-gray-900 font-mono text-sm">{selectedUser._id}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toggleBlock(selectedUser._id, selectedUser.isblocked);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                    selectedUser.isblocked
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {selectedUser.isblocked ? '✓ Unblock User' : '✕ Block User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} />}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}