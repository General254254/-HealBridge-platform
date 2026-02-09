import { useState, useEffect } from 'react';
import { User, Shield, Eye, EyeOff, Save, Download, Trash2, Loader2, Check } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Condition {
    id: string;
    name: string;
    category: string;
}

export default function ProfilePage() {
    const { logout } = useAuthStore();
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSurvivor, setIsSurvivor] = useState(false);
    const [conditionId, setConditionId] = useState('');
    const [conditionStage, setConditionStage] = useState('');

    const [conditions, setConditions] = useState<Condition[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileRes, catRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/categories')
            ]);

            const profile = profileRes.data;
            setDisplayName(profile.displayName);
            setBio(profile.bio || '');
            setIsAnonymous(profile.isAnonymous);
            setIsSurvivor(profile.isSurvivor);
            setConditionId(profile.primaryConditionId || '');
            setConditionStage(profile.conditionStage || '');

            // Flatten conditions from categories response
            const allConds: Condition[] = [];
            Object.values(catRes.data).forEach((list: any) => {
                allConds.push(...list);
            });
            setConditions(allConds);
        } catch (err: any) {
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await api.put('/users/me', {
                displayName,
                bio,
                isAnonymous,
                isSurvivor,
                primaryConditionId: conditionId || null,
                conditionStage: conditionStage || null
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            const { data } = await api.post('/users/me/export');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `healbridge-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        } catch (err: any) {
            setError('Export failed');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete('/users/me');
            logout();
            window.location.href = '/';
        } catch (err: any) {
            setError('Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    // Group conditions by category for the select
    const groupedConditions = conditions.reduce((acc, c) => {
        if (!acc[c.category]) acc[c.category] = [];
        acc[c.category].push(c);
        return acc;
    }, {} as Record<string, Condition[]>);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-display font-bold text-calm-800">Profile Settings</h1>
                {success && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium animate-pulse">
                        <Check className="w-4 h-4" /> Changes saved
                    </span>
                )}
            </div>
            <p className="text-calm-500 mb-8">Manage your profile and privacy.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Profile Info */}
            <div className="card mb-6">
                <h2 className="font-display font-semibold text-calm-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    Personal Information
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-calm-700 mb-1.5">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="input-field"
                            placeholder="How others see you"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-calm-700 mb-1.5">Bio / Recovery Story</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="input-field min-h-[100px] resize-y"
                            maxLength={2000}
                            placeholder="Share your journey with the community..."
                        />
                        <p className="text-xs text-calm-400 mt-1">{bio.length}/2000 characters</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-calm-700 mb-1.5">Primary Condition</label>
                            <select
                                value={conditionId}
                                onChange={(e) => setConditionId(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select a condition</option>
                                {Object.entries(groupedConditions).map(([category, list]) => (
                                    <optgroup key={category} label={category}>
                                        {list.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-calm-700 mb-1.5">Current Stage / Status</label>
                            <input
                                type="text"
                                value={conditionStage}
                                onChange={(e) => setConditionStage(e.target.value)}
                                className="input-field"
                                placeholder="e.g. Stage II, Remission, Early"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm text-calm-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isSurvivor}
                                onChange={(e) => setIsSurvivor(e.target.checked)}
                                className="rounded border-calm-300 text-primary-600 focus:ring-primary-500"
                            />
                            I am a survivor / in remission
                        </label>
                    </div>
                </div>
            </div>

            {/* Privacy */}
            <div className="card mb-6">
                <h2 className="font-display font-semibold text-calm-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-secondary-500" />
                    Privacy Settings
                </h2>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-calm-50 rounded-xl cursor-pointer">
                        <div className="flex items-center gap-3">
                            {isAnonymous ? <EyeOff className="w-5 h-5 text-calm-400" /> : <Eye className="w-5 h-5 text-primary-500" />}
                            <div>
                                <p className="font-medium text-calm-700 text-sm">Anonymous Mode</p>
                                <p className="text-xs text-calm-400">Hide your display name and profile from community posts</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="rounded border-calm-300 text-primary-600 focus:ring-primary-500"
                        />
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={handleSave}
                    className="btn-primary gap-2 min-w-[140px]"
                    disabled={saving}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleExport} className="btn-secondary gap-2">
                    <Download className="w-4 h-4" />
                    Export My Data
                </button>
                <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 transition-colors text-sm font-medium ml-auto"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                </button>
            </div>
        </div>
    );
}
