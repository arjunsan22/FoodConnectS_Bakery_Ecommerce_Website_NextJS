'use client';
import { useState ,useEffect} from 'react';
import { useRouter } from 'next/navigation';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function AdminLogin(){

    const [credentials,setCredentials] = useState({name:'',password:''});
    const [error,setError] = useState('');
    const router = useRouter();

useEffect(() => {
  const isLoggedIn = getCookie('admin_logged_in') === 'true';
  if (isLoggedIn) {
    router.replace('/admin/dashboard');
  }
}, [router]);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        const response = await fetch('/api/admin/auth',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(credentials),
        });
        if(response.ok){
            router.replace('/admin/dashboard');
        }else{
            setError('Invalid credentials');
        }
    }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Admin Name"
          className="w-full p-2 mb-4 border rounded"
          value={credentials.name}
          onChange={(e) => setCredentials({...credentials, name: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        <button
          type="submit"
          className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}