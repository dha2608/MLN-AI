import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import NotificationManager from './NotificationManager';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white">
      <NotificationManager />
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
         <div className="font-serif font-bold text-lg text-soviet-red-700">Triết học M-L</div>
         <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:text-soviet-red-700">
            <Menu className="h-6 w-6" />
         </button>
      </div>

      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:static pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
