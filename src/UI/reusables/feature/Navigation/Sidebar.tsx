import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Sparkles,
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
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-neutral-200/90 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top: Brand Header */}
        <div>
          <div
            className={`h-16 border-b border-neutral-100 flex items-center transition-all duration-300 ${
              isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
            }`}
          >
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 group focus:outline-none overflow-hidden"
              onClick={onCloseMobile}
              title="Project A Learning Hub"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
                <BookOpen size={20} strokeWidth={2.4} />
              </div>

              {!isCollapsed && (
                <div className="animate-in fade-in duration-200 truncate">
                  <span className="font-heading font-extrabold text-base tracking-tight text-neutral-900 block truncate">
                    Project A
                  </span>
                  <span className="block text-[10px] font-semibold text-[#EA580C] tracking-wide uppercase">
                    Learning Hub
                  </span>
                </div>
              )}
            </NavLink>

            {/* Collapse Toggle Button (Desktop) */}
            {onToggleCollapse && !isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {/* Close button for mobile */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* If Collapsed, provide Expand toggle at the top of the nav */}
          {isCollapsed && onToggleCollapse && (
            <div className="hidden lg:flex justify-center py-2 border-b border-neutral-100/80">
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-xl text-neutral-500 hover:text-[#EA580C] hover:bg-orange-50 transition-colors cursor-pointer"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5" aria-label="Main Navigation">
            {!isCollapsed && (
              <div className="px-3 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Overview
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
                  className={`flex items-center rounded-xl text-sm font-medium transition-all group ${
                    isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-orange-50 text-[#EA580C] font-semibold border border-orange-200/70 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon
                      size={20}
                      className={isActive ? 'text-[#EA580C]' : 'text-neutral-400 group-hover:text-neutral-600'}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#F97316] text-white'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
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

        {/* Learning Pro Tip Card in Sidebar (Only when expanded) */}
        {!isCollapsed && (
          <div className="px-3.5 py-2 animate-in fade-in duration-200">
            <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/60 rounded-xl">
              <div className="flex items-center gap-1.5 text-[#EA580C] font-bold text-xs mb-1">
                <Sparkles size={13} />
                <span>Skill Sprint</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed mb-2">
                Browse newly seeded courses including SQL, TypeScript, and Python!
              </p>
              <NavLink
                to="/courses"
                onClick={onCloseMobile}
                className="text-[11px] font-semibold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1"
              >
                <span>Explore catalog</span>
                <ChevronRight size={12} />
              </NavLink>
            </div>
          </div>
        )}

        {/* Bottom Section: Profile & Logout */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 space-y-1.5">
          {/* Profile Trigger Button */}
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenProfile();
            }}
            className={`w-full flex items-center rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-neutral-200 transition-all cursor-pointer group ${
              isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5 text-left'
            }`}
            title="View Profile"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#EA580C] font-bold text-sm flex items-center justify-center shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {user?.name || 'User Profile'}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate capitalize">
                    {user?.role || 'Student'} • View details
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronRight size={14} className="text-neutral-400 group-hover:text-neutral-700 shrink-0" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            }`}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
