import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Mobile hamburger */}
      <div className="flex items-center gap-4 lg:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Spacer so right-side controls stay right-aligned */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {user && (
          <div className="hidden sm:flex items-center gap-2.5 pl-1 border-l border-gray-200">
            <Avatar name={user.name} size="md" />
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
