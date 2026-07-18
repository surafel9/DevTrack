import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex justify-center lg:justify-start lg:pl-12">
        <div className="w-full max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, tasks…"
            className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 border border-gray-200 rounded text-gray-500 font-sans">⌘ K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[9px] font-bold text-white border-2 border-white">
            2
          </span>
        </button>
        {user && (
          <div className="hidden sm:block">
            <Avatar name={user.name} size="md" />
          </div>
        )}
      </div>
    </header>
  );
}
