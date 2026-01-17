import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import NotificationManager from './NotificationManager';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-dark-bg transition-colors duration-200">
      <NotificationManager />
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border p-4 flex items-center justify-between shadow-sm">
         <div className="font-serif font-bold text-lg text-soviet-red-700 dark:text-soviet-red-500">Triết học M-L</div>
         <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-soviet-red-700 dark:hover:text-soviet-red-400 transition-colors">
            <Menu className="h-6 w-6" />
         </button>
      </div>

      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:static pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
