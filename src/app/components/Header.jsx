'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, UserIcon, HeartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect ,useRef } from 'react';
import { useSession, signOut } from 'next-auth/react'; // ✅ NextAuth hooks
import {useRouter} from 'next/navigation';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Offers', href: '/offers' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const router = useRouter();
 const { data: session, status } = useSession(); // ✅ Get session state
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
  console.log('Session:', session);
}, [session]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading state briefly while checking auth
  if (status === 'loading') {
    return (
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md py-2 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }
  const handleSignOut = async (closeMenu = false) => {
 await signOut({ redirect: false });
    if (closeMenu) setMobileMenuOpen(false);
    router.replace('/'); // client-side navigation — no full reload
  };
//user menu

const UserMenu = ({ session, handleSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
 const [imageError, setImageError] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    setImageError(false);
  }, [session?.user?.userImage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="relative">
          {session?.user?.userImage && !imageError ? (
            <motion.img
    layoutId={`avatar-${session.user.id}`}
    src={session.user.userImage || '/userprofile.png'}
    alt={session.user.name || 'User Profile'}
    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer"
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    onError={(e) => {
      setImageError(true)
      e.target.src = '/userprofile.png';
    }}
  />
          ) : (
            <motion.div
              className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <UserIcon className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-xl border border-gray-100"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            
            <Link 
              href="/userProfile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md py-2 shadow-sm'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="block" onClick={() => setMobileMenuOpen(false)}>
            <img 
              src="/bakeryicon.png" 
              alt="FoodConnects Bakery" 
              className="h-14 w-auto"
            />
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={item.href}
                style={{ fontFamily: '"Playwrite DE SAS", cursive' }}
                className="font-medium text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Icons + Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {[
            { href: '/wishlist', icon: HeartIcon, label: 'Wishlist' },
            { href: '/cart', icon: ShoppingCartIcon, label: 'Cart' },
          ].map(({ href, icon: Icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={href}
                aria-label={label}
                className="text-gray-700 hover:text-amber-600 transition-colors block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-6 w-6" />
              </Link>
            </motion.div>
          ))}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
  className="flex items-center"
>
{!session ? (
  <Link href="/login" passHref>
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      Sign In
    </motion.button>
  </Link>
) : (
  <UserMenu session={session} handleSignOut={handleSignOut} />
)}
</motion.div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
{/* Mobile Menu */}
<AnimatePresence>
  {mobileMenuOpen && (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', ease: 'easeInOut' }}
      className="md:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white z-50 shadow-lg"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <img 
              src="/bakeryicon.png" 
              alt="FoodConnects Bakery" 
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-gray-700"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col space-y-6 flex-1">
          {/* Main Navigation */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-gray-800 hover:text-amber-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* Authenticated User Links */}
          {session && (
            <>
              <Link
                href="/userProfile"
                className="font-medium text-gray-800 hover:text-amber-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/wishlist"
                className="font-medium text-gray-800 hover:text-amber-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
            </>
          )}

          {/* Cart is always visible */}
          <Link
            href="/cart"
            className="font-medium text-gray-800 hover:text-amber-600 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cart
          </Link>
        </nav>

        {/* Mobile Auth / Sign Out */}
        <div className="pt-4 border-t border-gray-200">
          {!session ? (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition">
                Sign In
              </button>
            </Link>
          ) : (
            <button
              onClick={() => {
                handleSignOut(true); // pass true to close menu
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition text-left"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </header>
  );
}