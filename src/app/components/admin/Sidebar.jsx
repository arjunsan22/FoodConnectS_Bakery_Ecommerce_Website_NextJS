'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'User', href: '/admin/users', icon: '👥' },
  { name: 'Products', href: '/admin/products', icon: '🍞' },
  { name: 'Add Product', href: '/admin/addproducts', icon: '➕' },
  { name: 'Categories', href: '/admin/category', icon: '📂' },
  { name: 'Orders', href: '/admin/orders', icon: '🛒' },
];


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

 const handleLogout = () => {
  // Clear client cookie
  document.cookie = "admin_logged_in=; Max-Age=0; path=/";
  // Clear server cookie (by redirecting to an API route or just clearing path)
  document.cookie = "admin_session=; Max-Age=0; path=/admin";
  router.push('/admin-login');
};

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">FoodConnects Admin</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                  pathname === item.href
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-400 hover:bg-red-900/30 rounded-md transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}