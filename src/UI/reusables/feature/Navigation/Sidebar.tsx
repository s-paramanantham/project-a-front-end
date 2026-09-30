import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  UserCheck,
  Users,
  CalendarCheck,
  X
} from 'lucide-react';
import { authService } from '../../../../services/AuthService/authService';

interface SidebarProps {
  onOpenProfile: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  enrolledCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenProfile,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  enrolledCount
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isTutor = user?.role?.toLowerCase() === 'tutor';
  const isStudent = !isTutor;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate('/login');
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Courses',
      path: '/courses',
      icon: BookOpen,
      badge: enrolledCount !== undefined && enrolledCount > 0 ? `${enrolledCount}` : 'New'
    },
    ...(isStudent
      ? [
          {
            label: 'Reviewer',
            path: '/reviewers',
            icon: UserCheck,
            badge: null
          },
          {
            label: 'Todo',
            path: '/todo',
            icon: CalendarCheck,
            badge: null
          }
        ]
      : []),
    ...(isTutor
      ? [
          {
            label: 'Students',
            path: '/tutor/students',
            icon: Users,
            badge: null
          },
          {
            label: 'Create Course',
            path: '/courses/create',
            icon: PlusCircle,
            badge: 'Tutor'
          }
        ]
      : [])
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-neutral-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
      >
        {/* Top: Brand Header */}
        <div>
          <div
            className={`h-14 border-b border-neutral-100 flex items-center transition-all duration-300 ${
              isCollapsed ? 'px-2 justify-center' : 'px-4 justify-between'
            }`}
          >
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none overflow-hidden"
              onClick={onCloseMobile}
              title="Project A"
            >
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <BookOpen size={14} strokeWidth={2.5} />
              </div>

              {!isCollapsed && (
                <div className="animate-in fade-in duration-150 truncate">
                  <span className="font-bold text-sm tracking-tight text-neutral-900 block truncate leading-tight">
                    Project A
                  </span>
                  <span className="block text-[10px] font-medium text-neutral-400 tracking-normal">
                    Workspace
                  </span>
                </div>
              )}
            </NavLink>

            {/* Collapse Toggle Button (Desktop) */}
            {onToggleCollapse && !isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Close button for mobile */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                aria-label="Close navigation"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* If Collapsed, provide Expand toggle at the top of the nav */}
          {isCollapsed && onToggleCollapse && (
            <div className="hidden lg:flex justify-center py-2 border-b border-neutral-100">
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2.5 space-y-0.5" aria-label="Main Navigation">
            {!isCollapsed && (
              <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Navigation
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={`flex items-center rounded-lg text-xs font-medium transition-all group ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                  } ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                    <Icon
                      size={16}
                      className={isActive ? 'text-[#EA580C]' : 'text-neutral-400 group-hover:text-neutral-600'}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-[#EA580C] text-white'
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200/80'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Profile & Logout */}
        <div className="p-2.5 border-t border-neutral-100 space-y-1">
          {/* Profile Trigger Button */}
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenProfile();
            }}
            className={`w-full flex items-center rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group ${
              isCollapsed ? 'justify-center p-2' : 'justify-between p-2 text-left'
            }`}
            title="View Profile"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-neutral-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 truncate leading-tight">
                    {user?.name || 'User Profile'}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate capitalize">
                    {user?.role || 'Student'}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight size={13} className="text-neutral-300 group-hover:text-neutral-600 shrink-0" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center text-xs font-medium text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'
            }`}
            title="Sign Out"
          >
            <LogOut size={14} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
