import { useState, useEffect } from 'react';
import {
    Activity,
    Calendar,
    Pill,
    Bell,
    TrendingUp,
    Plus,
    Bot,
    Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

interface DashboardData {
    recentSymptoms: { id: string; symptomType: string; severity: number; loggedAt: string }[];
    upcomingAppointments: { id: string; title: string; provider?: string; scheduledAt: string }[];
    activeMedications: number;
    unreadNotifications: number;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const { data: dash } = await api.get('/users/me/dashboard');
            setData(dash);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
            // Provide fallback empty data so UI doesn't break
            setData({
                recentSymptoms: [],
                upcomingAppointments: [],
                activeMedications: 0,
                unreadNotifications: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const severityColor = (s: number) =>
        s <= 3 ? 'text-green-600 bg-green-50' : s <= 6 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    const dashboard = data!;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-calm-800">Your Health Dashboard</h1>
                    <p className="text-calm-500 mt-1">Track, manage, and stay on top of your wellness.</p>
                </div>
                <Link to="/copilot" className="btn-accent gap-2">
                    <Bot className="w-4 h-4" />
                    Ask AI Copilot
                </Link>
            </div>

            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
                    {error} — Showing empty dashboard. Make sure the backend server is running.
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: Activity, label: 'Recent Symptoms', value: dashboard.recentSymptoms.length, color: 'text-rose-600 bg-rose-50' },
                    { icon: Calendar, label: 'Upcoming Appts', value: dashboard.upcomingAppointments.length, color: 'text-blue-600 bg-blue-50' },
                    { icon: Pill, label: 'Active Meds', value: dashboard.activeMedications, color: 'text-violet-600 bg-violet-50' },
                    { icon: Bell, label: 'Notifications', value: dashboard.unreadNotifications, color: 'text-amber-600 bg-amber-50' },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="card flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-calm-800">{stat.value}</p>
                                <p className="text-xs text-calm-400">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Symptom Log */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display font-semibold text-calm-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            Recent Symptoms
                        </h2>
                        <button className="btn-secondary text-xs gap-1">
                            <Plus className="w-3 h-3" />
                            Log Symptom
                        </button>
                    </div>
                    <div className="space-y-3">
                        {dashboard.recentSymptoms.length === 0 ? (
                            <p className="text-sm text-calm-400 py-4 text-center">No symptoms logged yet. Start tracking your symptoms!</p>
                        ) : (
                            dashboard.recentSymptoms.map((s) => (
                                <div key={s.id} className="flex items-center justify-between py-2 border-b border-calm-50 last:border-0">
                                    <div>
                                        <p className="font-medium text-calm-700">{s.symptomType}</p>
                                        <p className="text-xs text-calm-400">{new Date(s.loggedAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`badge ${severityColor(s.severity)}`}>
                                        {s.severity}/10
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Appointments */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display font-semibold text-calm-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-secondary-500" />
                            Upcoming Appointments
                        </h2>
                        <button className="btn-secondary text-xs gap-1">
                            <Plus className="w-3 h-3" />
                            Add
                        </button>
                    </div>
                    <div className="space-y-3">
                        {dashboard.upcomingAppointments.length === 0 ? (
                            <p className="text-sm text-calm-400 py-4 text-center">No upcoming appointments. Schedule one!</p>
                        ) : (
                            dashboard.upcomingAppointments.map((a) => (
                                <div key={a.id} className="flex items-center gap-4 py-2 border-b border-calm-50 last:border-0">
                                    <div className="w-12 h-12 bg-secondary-50 rounded-xl flex flex-col items-center justify-center text-secondary-600">
                                        <span className="text-xs font-medium">
                                            {new Date(a.scheduledAt).toLocaleDateString('en', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold leading-none">
                                            {new Date(a.scheduledAt).getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-calm-700">{a.title}</p>
                                        <p className="text-xs text-calm-400">{a.provider}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
