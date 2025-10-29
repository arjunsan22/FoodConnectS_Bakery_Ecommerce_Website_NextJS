// app/admin/products/edit/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../addproducts/utils/cropUtils'; // Reuse crop helper

export default function EditProductPage() {
  const { id } = useParams(); // Get dynamic ID
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // base64 for new, URLs for existing
  const [originalImageUrls, setOriginalImageUrls] = useState([]); // Track which are original URLs
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    quantity: '',
    productOffer: '',
    unit: 'kg',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cropping state
  const [cropImageIndex, setCropImageIndex] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  // Fetch categories & product
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const catRes = await fetch('/api/admin/category');
        const cats = await catRes.json();
        setCategories(cats);

        // Fetch product
        const prodRes = await fetch(`/api/admin/products?id=${id}`);
        if (!prodRes.ok) throw new Error('Product not found');
        const product = await prodRes.json();

        // Set form
        setForm({
          name: product.name || '',
          price: product.price?.toString() || '',
          description: product.description || '',
          category: product.category?._id || '',
          quantity: product.quantity?.toString() || '',
          productOffer: product.productOffer?.toString() || '',
          unit: product.unit || 'kg',
        });

        // Set images: keep URLs as-is (they’ll be re-uploaded only if changed)
        const imgUrls = product.images || [];
        setImages(imgUrls);
        setOriginalImageUrls(imgUrls.map(() => true)); // mark all as original URLs
      } catch (err) {
        Swal.fire('Error!', err.message || 'Failed to load product.', 'error');
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      Swal.fire('Max 4 images allowed!', '', 'warning');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result]);
        setOriginalImageUrls((prev) => [...prev, false]); // new = not original
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setOriginalImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCrop = (index) => {
    setCropImageIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCropper(true);
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const applyCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(images[cropImageIndex], croppedAreaPixels);
      const newImages = [...images];
      const newOriginalFlags = [...originalImageUrls];
      newImages[cropImageIndex] = croppedImage;
      newOriginalFlags[cropImageIndex] = false; // cropped = no longer original
      setImages(newImages);
      setOriginalImageUrls(newOriginalFlags);
      setShowCropper(false);
    } catch (err) {
      Swal.fire('Error', 'Failed to crop image.', 'error');
      setShowCropper(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    let value = e.target.value;
    const { unit } = form;

    if (unit === 'kg' || unit === 'litre') {
      if (value === '' || /^(\d+(\.\d{1,2})?)?$/.test(value)) {
        setForm((prev) => ({ ...prev, quantity: value }));
      }
    } else {
      if (value === '' || /^\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, quantity: value }));
      }
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.price || parseFloat(form.price) <= 0) return 'Valid price is required';
    if (!form.category) return 'Category is required';
    if (!form.quantity || parseFloat(form.quantity) <= 0) return 'Valid quantity is required';
    if (images.length === 0) return 'At least one image is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      Swal.fire('Validation Error!', error, 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id, // required for PUT
        ...form,
        price: parseFloat(form.price),
        quantity: parseFloat(form.quantity),
        images, // mix of URLs (keep) and base64 (upload)
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update product');
      }

      Swal.fire('Success!', 'Product updated!', 'success').then(() => {
        router.push('/admin/products');
      });
    } catch (err) {
      Swal.fire('Error!', err.message || 'Something went wrong.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">-- Select --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium mb-1">Unit *</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="kg">kg</option>
            <option value="litre">litre</option>
            <option value="pcs">pcs</option>
            <option value="packet">packet</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Quantity * ({form.unit === 'kg' || form.unit === 'litre' ? 'e.g., 0.5, 1, 1.5...' : 'e.g., 1, 2, 3...'})
          </label>
          <input
            type="text"
            value={form.quantity}
            onChange={handleQuantityChange}
            className="w-full p-2 border rounded"
            placeholder={form.unit === 'kg' || form.unit === 'litre' ? '0.5' : '1'}
            required
          />
        </div>

        {/* Offer */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Offer (%)</label>
          <input
            type="number"
            name="productOffer"
            value={form.productOffer}
            onChange={handleInputChange}
            min="0"
            max="100"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Images (Max 4) *
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          <div className="flex flex-wrap gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative w-24 h-24">
                <img
                  src={img}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
                <button
                  type="button"
                  onClick={() => handleCrop(index)}
                  className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 rounded-b"
                >
                  Crop
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded text-white ${
              submitting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>

      {/* Cropping Modal */}
      {showCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl relative">
            <div className="relative h-96">
              <Cropper
                image={images[cropImageIndex]}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
              />
            </div>
            <div className="p-4 flex justify-between items-center">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-32"
              />
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCropper(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}