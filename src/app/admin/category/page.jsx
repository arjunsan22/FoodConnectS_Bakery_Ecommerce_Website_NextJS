'use client';
import { useState,useEffect } from "react";
import Link from "next/link";
import { set } from "mongoose";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function CategoryPage() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentCategory, setCurrentCategory] = useState({id:'', name: '', description: ''});

    const [form , setForm] = useState({ name: '', description: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    //going to fetch categories 

    useEffect(()=>{
        fetchCategories();
    },[]);

    const fetchCategories = async () =>{
        try {
            const res = await fetch('/api/admin/category');
            if(!res.ok){
                throw new Error('Failed to fetch categories');
            }
            const data  = await res.json();
            setCategories(data);

        } catch (err) {
            MySwal.fire({
            icon: 'error',
            title: 'Oops!',
            text: err.message || 'Failed to load categories.',
      });
        }finally{
            setLoading(false);
        }
    }

    const openAddModal = () =>{
        setModalMode('add');
        setForm({name:'',description:''});
        setFormError('');
        setIsModalOpen(true);
    }

    const openEditModal =(category) =>{
        setModalMode('edit');
        setCurrentCategory(category);
        setForm({name:category.name,description:category.description || ''});
        setFormError('');
        setIsModalOpen(true);
    }

    const closeModal = ()=>{
        setIsModalOpen(false);
        setFormError('');
    }

    const handleInputChange =(e)=>{
        const {name,value} = e.target;
        setForm((prev)=>({...prev,[name]:value}));
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        const payload = {
            ...(modalMode === 'edit' && {id:currentCategory._id}),
            name:form.name.trim(),
            description:form.description.trim()
        };
        try {
            let res;
            if(modalMode === 'add'){
                res = await fetch('/api/admin/category',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify(payload)
                })
            }else{
                res = await fetch('/api/admin/category',{
                    method:'PUT',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify(payload)
                })
            }
            const result = await res.json();
            if(!res.ok){
                throw new Error(result.error || 'Something went wrong');
            }
            //going to do optimistic update

     if (modalMode === 'add') {
        setCategories((prev) => [...prev, result.category]);
        MySwal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Category added successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setCategories((prev) =>
          prev.map((cat) => (cat._id === currentCategory._id ? result.updatedCategory : cat))
        );
        MySwal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Category updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      closeModal();
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.message || 'Something went wrong.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `You won't be able to revert this! Delete "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/admin/category', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setCategories((prev) => prev.filter((cat) => cat._id !== id));
          MySwal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Category has been deleted.',
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to delete');
        }
      } catch (err) {
        MySwal.fire({
          icon: 'error',
          title: 'Failed!',
          text: err.message || 'Could not delete category.',
        });
      }
    }
  };


  
    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-gray-500">No categories found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-gray-600">{category.description || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {modalMode === 'add' ? 'Add Category' : 'Edit Category'}
            </h2>

            {formError && <p className="text-red-500 mb-3">{formError}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    submitting ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Add' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}