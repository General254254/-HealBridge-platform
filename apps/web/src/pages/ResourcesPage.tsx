import { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Search, Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Resource {
    id: string;
    title: string;
    description: string | null;
    contentType: 'ARTICLE' | 'VIDEO' | 'PDF';
    url: string;
    tags: string[];
    isVerified: boolean;
    conditions: { condition: { name: string } }[];
}

const typeIcon: Record<string, typeof BookOpen> = {
    ARTICLE: BookOpen,
    VIDEO: Video,
    PDF: FileText,
};

const typeColor: Record<string, string> = {
    ARTICLE: 'text-blue-600 bg-blue-50',
    VIDEO: 'text-violet-600 bg-violet-50',
    PDF: 'text-rose-600 bg-rose-50',
};

export default function ResourcesPage() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [resources, setResources] = useState<Resource[]>([]);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadResources();
        if (isAuthenticated) {
            loadBookmarks();
        }
    }, [isAuthenticated]);

    // Reload when filters change
    useEffect(() => {
        const timeout = setTimeout(() => {
            loadResources();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, filter]);

    const loadResources = async () => {
        try {
            const params: any = {};
            if (filter !== 'all') params.type = filter;
            if (search) params.search = search;

            const { data } = await api.get('/resources', { params });
            setResources(data.data || []);
        } catch (err: any) {
            setError('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarks = async () => {
        try {
            const { data } = await api.get('/resources/bookmarks');
            setBookmarks(data.map((b: any) => b.resourceId));
        } catch {
            // Silently fail
        }
    };

    const toggleBookmark = async (resourceId: string) => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.post('/resources/bookmark', { resourceId });
            if (data.bookmarked) {
                setBookmarks([...bookmarks, resourceId]);
            } else {
                setBookmarks(bookmarks.filter((id) => id !== resourceId));
            }
        } catch {
            // Fail
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-2xl font-display font-bold text-calm-800 mb-2">Resource Library</h1>
            <p className="text-calm-500 mb-8">Curated, verified health resources from trusted institutions.</p>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-calm-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                        placeholder="Search resources..."
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'ARTICLE', 'VIDEO', 'PDF'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === type
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-white text-calm-500 border border-calm-200 hover:bg-calm-50'
                                }`}
                        >
                            {type === 'all' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Resource Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            ) : resources.length === 0 ? (
                <div className="card text-center py-12">
                    <BookOpen className="w-12 h-12 text-calm-200 mx-auto mb-3" />
                    <p className="text-calm-500">No resources found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resource) => {
                        const Icon = typeIcon[resource.contentType] || BookOpen;
                        const isBookmarked = bookmarks.includes(resource.id);
                        return (
                            <div key={resource.id} className="card group hover:border-primary-200 cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${typeColor[resource.contentType]}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-calm-800 group-hover:text-primary-600 transition-colors truncate">
                                                {resource.title}
                                            </h3>
                                            {resource.isVerified && (
                                                <span className="badge bg-green-50 text-green-600 text-[10px] shrink-0">✓ Verified</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-calm-500 mb-3 line-clamp-2">{resource.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1.5 line-clamp-1">
                                                {resource.tags.slice(0, 2).map((tag) => (
                                                    <span key={tag} className="badge bg-calm-50 text-calm-400 text-[10px]">#{tag}</span>
                                                ))}
                                                {resource.conditions?.[0] && (
                                                    <span className="badge bg-primary-50 text-primary-600 text-[10px]">
                                                        {resource.conditions[0].condition.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isAuthenticated && (
                                                    <button
                                                        onClick={() => toggleBookmark(resource.id)}
                                                        className={`transition-colors ${isBookmarked ? 'text-amber-500' : 'text-calm-300 hover:text-amber-500'}`}
                                                    >
                                                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                                    </button>
                                                )}
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-calm-300 hover:text-primary-500 transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
