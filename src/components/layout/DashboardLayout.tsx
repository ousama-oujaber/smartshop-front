import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    LogOut,
    Menu,
    Bell,
    Search
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/products', icon: Package, label: 'Products' },
        { to: '/clients', icon: Users, label: 'Clients' },
        { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    ];

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-gray-100">
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            SmartShop
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.username || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.role || 'Role'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-64">
                            <Search className="w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
