import { cookies } from "next/headers";
import {redirect} from 'next/navigation';
import Sidebar from '../components/admin/Sidebar';

export default async function AdminLayout({children}){
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_session')?.value ==='true';
    const isLoggedIn = cookieStore.get('admin_logged_in')?.value ==='true';
    if(!isAdmin){
        redirect('/admin-login');
    }
    if(!isLoggedIn){
        redirect('/admin-login');
    }

    return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
    )
}