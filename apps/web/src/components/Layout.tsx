import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import {
    Home,
    MessageSquare,
    Bot,
    BookOpen,
    User,
    LayoutDashboard,
    LogOut,
    Heart,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
    { path: '/forums', label: 'Community', icon: MessageSquare },
    { path: '/copilot', label: 'AI Copilot', icon: Bot, auth: true },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User, auth: true },
];

export default function Layout() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const filteredNav = navItems.filter((item) => !item.auth || isAuthenticated);

    return (
        <div className="min-h-screen bg-calm-50">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-calm-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-display font-bold text-calm-800">
                                Heal<span className="text-primary-600">Bridge</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {filteredNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-calm-500 hover:text-calm-700 hover:bg-calm-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-calm-500">
                                        {user?.profile?.displayName}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 text-sm text-calm-400 hover:text-red-500 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-secondary text-sm">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary text-sm">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-calm-500"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-calm-100 animate-slide-up">
                        <div className="px-4 py-3 space-y-1">
                            {filteredNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-calm-500 hover:bg-calm-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-64px)]">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-calm-100 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="w-5 h-5 text-primary-600" />
                                <span className="font-display font-bold text-calm-800">HealBridge</span>
                            </div>
                            <p className="text-sm text-calm-400">
                                Connecting patients with support, community, and hope.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-calm-700 mb-3">Community</h4>
                            <ul className="space-y-2 text-sm text-calm-400">
                                <li><Link to="/forums" className="hover:text-primary-600 transition-colors">Forums</Link></li>
                                <li><Link to="/resources" className="hover:text-primary-600 transition-colors">Resources</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-calm-700 mb-3">Legal</h4>
                            <ul className="space-y-2 text-sm text-calm-400">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Medical Disclaimer</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-calm-700 mb-3">Crisis Support</h4>
                            <p className="text-sm text-calm-400">
                                Suicide Prevention Lifeline: <strong className="text-calm-600">988</strong>
                            </p>
                            <p className="text-sm text-calm-400 mt-1">
                                Crisis Text: <strong className="text-calm-600">Text HOME to 741741</strong>
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-calm-100 text-center text-xs text-calm-400">
                        <p>⚕️ HealBridge is not a substitute for professional medical advice. Always consult your healthcare provider.</p>
                        <p className="mt-1">© 2026 HealBridge. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
