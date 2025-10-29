// app/admin/products/page.js
'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      Swal.fire('Error!', err.message || 'Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  };
  // ✅ Group products by category name
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});


  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete product "${name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/admin/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setProducts((prev) => prev.filter((p) => p._id !== id));
          Swal.fire('Deleted!', 'Product removed.', 'success');
        } else {
          throw new Error('Delete failed');
        }
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete product.', 'error');
      }
    }
  };

   const handleToggleBlock = async (id, name, currentStatus) => {
    const willBlock = !currentStatus;
    const action = willBlock ? 'block' : 'unblock';

    const result = await Swal.fire({
      title: `Are you sure you want to ${action} "${name}"?`,
      text: willBlock
        ? 'This product will be hidden from the store.'
        : 'This product will be visible in the store again.',
      icon: willBlock ? 'warning' : 'info',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: willBlock ? '#d33' : '#308d46',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, blocked: willBlock }),
        });

        if (res.ok) {
          const updated = await res.json();
          setProducts((prev) =>
            prev.map((p) => (p._id === id ? updated.product : p))
          );
          Swal.fire(
            'Success!',
            `Product ${willBlock ? 'blocked' : 'unblocked'} successfully.`,
            'success'
          );
        } else {
          throw new Error('Update failed');
        }
      } catch (err) {
        Swal.fire('Error!', 'Failed to update product status.', 'error');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading products...</div>;

return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <Link
          href="/admin/addproducts" // ✅ Fixed route (was /admin/addproducts)
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          + Add Product
        </Link>
      </div>

      {Object.keys(groupedProducts).length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([categoryName, productsInCategory]) => (
            <div key={categoryName}>
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsInCategory.map((product) => (
                  <div
                    key={product._id}
                    className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition ${
                      product.blocked ? 'bg-red-100 border-red-200' : 'bg-white'
                    }`}
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                    )}
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {product.description?.slice(0, 60)}...
                    </p>
                    <p className="text-lg font-bold mt-2">₹{product.price}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {product.quantity} {product.unit}
                    </p>

                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          product.blocked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          handleToggleBlock(product._id, product.name, product.blocked)
                        }
                        className={`text-sm font-medium px-3 py-1 rounded ${
                          product.blocked
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {product.blocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}