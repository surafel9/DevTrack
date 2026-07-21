import React, { useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Users,
  Calendar,
  BarChart2,
  Settings,
  Hexagon,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

function cls(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(' ');
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-[18px] w-[18px]" />,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: <LayoutGrid className="h-[18px] w-[18px]" />,
  },
  {
    label: 'Project Resources',
    href: '/project-resources',
    icon: <LayoutGrid className="h-[18px] w-[18px]" />,
  },
  {
    label: 'Team',
    href: '/team',
    icon: <Users className="h-[18px] w-[18px]" />,
  },
  // {
  //   label: 'Calendar',
  //   href: '/calendar',
  //   icon: <Calendar className="h-[18px] w-[18px]" />,
  // },
  // {
  //   label: 'Reports',
  //   href: '/reports',
  //   icon: <BarChart2 className="h-[18px] w-[18px]" />,
  // },

  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-[18px] w-[18px]" />,
  },
];

export function Sidebar({
  isMobileOpen,
  onMobileClose,
}: {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-[240px] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[64px] flex-shrink-0 border-b border-gray-100">
        <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
          <Hexagon className="h-4 w-4 text-white stroke-[2]" />
        </div>
        <span className="text-base font-bold text-gray-900 tracking-tight">
          DevTrack
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onMobileClose}
              className={cls(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <span
                className={cls(
                  'flex-shrink-0',
                  isActive ? 'text-gray-900' : 'text-gray-400',
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        {user && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Avatar name={user.name} size="md" className="flex-shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col h-full z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
