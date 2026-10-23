import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircleShape, TriangleShape, SquareShape } from '../../components/GeometricShapes';
import {
  LayoutDashboard,
  Radio,
  Clock,
  Users,
  FileQuestion,
  ListOrdered,
  Sliders,
  QrCode,
  History,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { path: '/admin/live-control', label: 'Live Signal Control', icon: Radio },
    { path: '/admin/rounds', label: 'Round Controls', icon: Clock },
    { path: '/admin/teams', label: 'Squad Registry', icon: Users },
    { path: '/admin/questions', label: 'Question Matrix', icon: FileQuestion },
    { path: '/admin/submissions', label: 'Live Submissions', icon: ListOrdered },
    { path: '/admin/scores', label: 'Score Adjustments', icon: Sliders },
    { path: '/admin/qr', label: 'QR Code Matrix', icon: QrCode },
    { path: '/admin/audit-logs', label: 'Audit Log Trail', icon: History },
    { path: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex flex-col md:flex-row font-sans selection:bg-[#ff004f] selection:text-white">
      {/* Dark Cyber Command Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a0c10] border-r border-gray-800/80 flex flex-col justify-between flex-shrink-0">
        <div className="p-5 space-y-6">
          {/* Logo & Terminal Identity */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800/80">
            <div className="flex items-center gap-1 p-1 rounded bg-[#12151c] border border-gray-800">
              <CircleShape size={14} color="#ff004f" />
              <TriangleShape size={14} color="#ff2e7e" />
              <SquareShape size={14} color="#00f0ff" />
            </div>
            <div>
              <span className="font-display font-black text-sm tracking-wider text-white block">
                CONTROL ROOM
              </span>
              <span className="text-[10px] font-mono text-[#ff004f] uppercase tracking-widest">
                ADMIN PRIVILEGES
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-colors ${
                    isActive
                      ? 'bg-[#ff004f]/15 text-white border border-[#ff004f]/40 font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff004f]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-gray-800/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-gray-400 text-[11px]">
            <span>USER: <strong>{user?.username}</strong></span>
            <span className="text-[#00e676] flex items-center gap-1">● ONLINE</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/leaderboard"
              target="_blank"
              className="flex-1 py-1.5 px-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-[11px] flex items-center justify-center gap-1 transition-colors"
            >
              <span>Scoreboard</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-900/40 text-red-400 text-[11px] flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Command Room Workspace */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
};
