import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/api';
import { Heart, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!acceptTerms || !acceptDisclaimer) {
            setError('You must accept the terms and medical disclaimer');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/auth/register', { email, password, displayName });
            setAuth(data.user, data.accessToken, data.refreshToken);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-calm-800">Create your account</h1>
                    <p className="text-calm-500 mt-1">Join the HealBridge community</p>
                </div>

                <div className="card">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-calm-700 mb-1.5">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-400" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="How would you like to be called?"
                                    required
                                    minLength={2}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-calm-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-calm-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Min. 8 characters"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-calm-700 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Re-enter password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <label className="flex items-start gap-2 text-calm-500">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="mt-0.5 rounded border-calm-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span>
                                    I agree to the{' '}
                                    <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
                                    and{' '}
                                    <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                                </span>
                            </label>

                            <label className="flex items-start gap-2 text-calm-500">
                                <input
                                    type="checkbox"
                                    checked={acceptDisclaimer}
                                    onChange={(e) => setAcceptDisclaimer(e.target.checked)}
                                    className="mt-0.5 rounded border-calm-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span>
                                    I understand this platform is <strong>not a substitute for professional medical advice</strong> and should not be used for emergencies.
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-calm-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
