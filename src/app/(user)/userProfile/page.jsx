'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Swal from 'sweetalert2';
import Toast from '../../components/Toast'


const UserProfile = () => {

  // Toast utility (you can replace with your own)
const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

const showToast = (message, type = 'success') => {
  setToast({ isVisible: true, message, type });
};

// Auto-hide logic is handled inside Toast, but you can also reset on close
const hideToast = () => {
  setToast((prev) => ({ ...prev, isVisible: false }));
};

  // User state
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    userImage: '',
  });
  const [originalUser, setOriginalUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState('/userprofile.png');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: '',
    place: '',
    streetMark: '',
    state: '',
    pincode: '',
    phone: '',
    houseNo: '',
  });

  // Fetch user & addresses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, addrRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/addresses'),
        ]);
        const userData = await userRes.json();
        const addrData = await addrRes.json();

 setUser(userData);
        setOriginalUser(userData);
        // Only update image preview if user has an image
        if (userData.userImage) {
          setImagePreview(userData.userImage);
        }
        setAddresses(addrData);
      } catch (err) {
        console.error('Failed to load profile', err);
        showToast('Failed to load profile', 'error');
      }
    };
    fetchData();
  }, []);
  // Handle input changes
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };
// helper to convert file -> base64 data url
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read error'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

const handleImageChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // ✅ Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('Only JPG, JPEG, PNG, and WebP images are allowed.', 'error');
    return;
  }

  // Optional: Validate file size (e.g., max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be smaller than 5MB.', 'error');
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setImagePreview(previewUrl);

  try {
    const dataUrl = await fileToDataUrl(file);
    setUser((prev) => ({ ...prev, userImage: dataUrl }));
  } catch (err) {
    console.error('Image conversion error', err);
    showToast('Failed to read image', 'error');
  }
};

const saveProfile = async () => {
  const { name, phone } = user;

  // Trim and validate
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedName) {
    showToast('Full name is required.', 'error');
    return;
  }

  if (!trimmedPhone) {
    showToast('Phone number is required.', 'error');
    return;
  }

  // Indian phone validation (10 digits, starts with 6-9)
  if (!/^[6-9][0-9]{9}$/.test(trimmedPhone)) {
    showToast('Please enter a valid 10-digit Indian phone number.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...user,
        name: trimmedName,
        phone: trimmedPhone,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    const updated = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      userImage: data.userImage || user.userImage,
    };
    setUser(updated);
    setOriginalUser(updated);
    if (data.userImage) {
      setImagePreview(data.userImage);
    }
    showToast('Profile updated successfully!', 'success');
    setIsEditing(false);
  } catch (err) {
    console.error('Save profile error', err);
    showToast(err.message || 'Failed to update profile', 'error');
  }
};

  // Address Modal handlers
  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: user.name || '',
      place: '',
      streetMark: '',
      state: '',
      pincode: '',
      phone: user.phone || '',
      houseNo: '',
    });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr,   pincode: String(addr.pincode), });
    setShowAddressModal(true);
  };

 const [addressError, setAddressError] = useState('');

const saveAddress = async () => {
  // Clear previous error
  setAddressError('');

  const { name, houseNo, place, state, pincode, phone } = addressForm;

  const pincodeStr = String(pincode).trim();

  const trimmed = {
    name: name.trim(),
    houseNo: houseNo.trim(),
    place: place.trim(),
    state: state.trim(),
    pincode: pincodeStr, // now guaranteed to be a trimmed string
    phone: phone.trim(),
  };
  
  if (!trimmed.name) return setAddressError('Full name is required.');
  if (!trimmed.houseNo) return setAddressError('House number is required.');
  if (!trimmed.place) return setAddressError('City/Town is required.');
  if (!trimmed.state) return setAddressError('State is required.');
  if (!trimmed.pincode) return setAddressError('Pincode is required.');
  if (!trimmed.phone) return setAddressError('Phone number is required.');

  if (!/^[0-9]{6}$/.test(trimmed.pincode)) {
    return setAddressError('Pincode must be 6 digits.');
  }

  if (!/^[6-9][0-9]{9}$/.test(trimmed.phone)) {
    return setAddressError('Please enter a valid 10-digit Indian phone number.');
  }

  // ✅ All validations passed
  try {
    const payload = {
      ...trimmed, // use trimmed values
      pincode: Number(trimmed.pincode), // ensure number
    };

    const url = editingAddress
      ? `/api/user/addresses/${editingAddress._id}`
      : '/api/user/addresses';
    const method = editingAddress ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 👈 Add this if your API requires auth cookies
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updatedAddr = await res.json();
      if (editingAddress) {
        setAddresses((prev) =>
          prev.map((a) => (a._id === updatedAddr._id ? updatedAddr : a))
        );
      } else {
        setAddresses((prev) => [...prev, updatedAddr]);
      }
      setShowAddressModal(false);
      showToast(editingAddress ? 'Address updated!' : 'Address added!', 'success');
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to save address');
    }
  } catch (err) {
    console.error('Save address error:', err);
    showToast(err.message || 'Failed to save address', 'error');
  }
};

const deleteAddress = async (id) => {
  try {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // red-500
      cancelButtonColor: '#9ca3af', // gray-400
      confirmButtonText: 'Yes, delete it!',
      background: '#ffffff',
      borderRadius: '1rem',
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        title: 'text-gray-800 font-bold',
        htmlContainer: 'text-gray-600',
      }
    });

    if (result.isConfirmed) {
      const res = await fetch(`/api/user/addresses/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to delete address');
      }

      setAddresses((prev) => prev.filter((a) => a._id !== id));
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Address has been deleted.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        borderRadius: '1rem',
        customClass: {
          popup: 'rounded-2xl shadow-xl'
        }
      });
    }
  } catch (err) {
    console.error('Delete address error:', err);
    Swal.fire({
      title: 'Error!',
      text: 'Failed to delete address',
      icon: 'error',
      timer: 1500,
      showConfirmButton: false,
      background: '#ffffff',
      borderRadius: '1rem',
      customClass: {
        popup: 'rounded-2xl shadow-xl'
      }
    });
  }
};
// ***************************************************
// ***************************************************
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account, addresses, and more</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <motion.div
            layout
            className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex flex-col items-center">
               <div className="relative mb-4">
      <Image
        src={imagePreview || '/userprofile.png'}
        alt={`${user.name || 'User'}'s profile`}
        width={120}
        height={120}
        className="rounded-full object-cover border-4 border-white shadow-md"
        onError={() => {
          setImagePreview('/userprofile.png');
        }}
        priority
      />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {isEditing ? (
                <div className="w-full space-y-3">
                  <input
                    name="name"
                    value={user.name}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Full name"
                  />
                  <input
                    name="email"
                    value={user.email}
                    onChange={handleUserChange}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 rounded-lg cursor-not-allowed"
                  />
                  <input
                    name="phone"
                    value={user.phone}
                    onChange={handleUserChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Phone"
                  />
                </div>
              ) : (
                <div className="text-center mt-2">
                  <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                  <p className="text-gray-600 mt-1">{user.phone}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6 w-full">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveProfile}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setUser(originalUser);
                        setIsEditing(false);
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Quick Nav */}
              <div className="mt-8 w-full space-y-2">
                <Link
                  href="/wishlist"
                  className="block w-full text-center py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                >
                  ❤️ View Wishlist
                </Link>
                <Link
                  href="/cart"
                  className="block w-full text-center py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                >
                  🛒 Go to Cart
                </Link>
                <Link
                  href="/orders"
                  className="block w-full text-center py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                >
                 📦 Orders
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right: Addresses */}
          <motion.div layout className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Addresses</h2>
                <button
                  onClick={openAddAddress}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Address
                </button>
              </div>

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <motion.div
                      key={addr._id}
                      layout
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{addr.name}</h3>
                          <p className="text-gray-600">{addr.houseNo}, {addr.place}</p>
                          <p className="text-gray-600">{addr.streetMark && `${addr.streetMark}, `}{addr.city || addr.place}, {addr.state} - {addr.pincode}</p>
                          <p className="text-gray-600 mt-1">📱 {addr.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditAddress(addr)}
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAddress(addr._id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

     {/* Address Modal */}
<AnimatePresence>
  {showAddressModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={() => setShowAddressModal(false)}
    >
      <motion.div
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </h3>

        {/* ✅ Show validation error here */}
        {addressError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {addressError}
          </div>
        )}

        <div className="space-y-3">
          <input
            name="name"
            value={addressForm.name}
            onChange={handleAddressChange}
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="houseNo"
            value={addressForm.houseNo}
            onChange={handleAddressChange}
            placeholder="House No."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="place"
            value={addressForm.place}
            onChange={handleAddressChange}
            placeholder="City / Town"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="streetMark"
            value={addressForm.streetMark}
            onChange={handleAddressChange}
            placeholder="Landmark (optional)"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="state"
            value={addressForm.state}
            onChange={handleAddressChange}
            placeholder="State"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="pincode"
            value={addressForm.pincode}
            onChange={handleAddressChange}
            placeholder="Pincode"
            type="text" // 👈 Changed from "number" to "text" for better UX (see note below)
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            name="phone"
            value={addressForm.phone}
            onChange={handleAddressChange}
            placeholder="Phone"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={saveAddress}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg cursor-pointer"
          >
            Save Address
          </button>
          <button
            onClick={() => setShowAddressModal(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
       <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
    </div>
  );
};

export default UserProfile;