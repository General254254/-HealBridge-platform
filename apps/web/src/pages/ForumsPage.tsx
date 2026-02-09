import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquare, Users, Pin, ThumbsUp, Eye, Loader2, Plus } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Forum {
    id: string;
    name: string;
    description: string | null;
    threadCount: number;
    condition: { name: string; category: string };
}

interface Thread {
    id: string;
    title: string;
    author: { id: string; displayName: string; isSurvivor: boolean; avatarUrl?: string | null };
    postCount: number;
    upvotes: number;
    viewCount: number;
    isPinned: boolean;
    createdAt: string;
    tags: string[];
}

interface ThreadsResponse {
    data: Thread[];
    total: number;
    page: number;
    limit: number;
}

export default function ForumsPage() {
    const { forumId } = useParams<{ forumId?: string }>();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [categories, setCategories] = useState<Record<string, any[]>>({});
    const [forums, setForums] = useState<Forum[]>([]);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedForum, setSelectedForum] = useState<string | null>(forumId || null);
    const [loading, setLoading] = useState(true);
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [error, setError] = useState('');

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load threads when a forum is selected
    useEffect(() => {
        if (selectedForum) {
            loadThreads(selectedForum);
        }
    }, [selectedForum]);

    // If forumId is in URL, select it
    useEffect(() => {
        if (forumId) setSelectedForum(forumId);
    }, [forumId]);

    const loadCategories = async () => {
        try {
            const { data: cats } = await api.get('/categories');
            setCategories(cats);

            // Flatten all conditions to load forums from the first one
            const allConditions = Object.values(cats).flat() as any[];
            if (allConditions.length > 0) {
                // Load forums for all conditions
                const forumsArr: Forum[] = [];
                for (const condition of allConditions) {
                    try {
                        const { data: condForums } = await api.get(`/categories/${condition.id}/forums`);
                        forumsArr.push(...condForums);
                    } catch {
                        // skip
                    }
                }
                setForums(forumsArr);

                // Auto-select first forum if none selected
                if (!selectedForum && forumsArr.length > 0) {
                    setSelectedForum(forumsArr[0].id);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load forums. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const loadThreads = async (fId: string) => {
        setThreadsLoading(true);
        try {
            const { data: threadData } = await api.get<ThreadsResponse>(`/forums/${fId}/threads`);
            setThreads(threadData.data);
        } catch (err: any) {
            setThreads([]);
        } finally {
            setThreadsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-2xl font-display font-bold text-calm-800 mb-2">Community Forums</h1>
            <p className="text-calm-500 mb-8">Connect, share, and support each other.</p>

            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {/* Forum Categories */}
            {forums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {forums.map((forum) => (
                        <button
                            key={forum.id}
                            onClick={() => setSelectedForum(forum.id)}
                            className={`card text-left hover:border-primary-200 cursor-pointer group ${selectedForum === forum.id ? 'border-primary-300 bg-primary-50/30' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-calm-800 group-hover:text-primary-600 transition-colors">{forum.name}</h3>
                                    <p className="text-xs text-calm-400">{forum.threadCount} threads</p>
                                </div>
                            </div>
                            <p className="text-sm text-calm-500">{forum.description}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-8 mb-10">
                    <Users className="w-12 h-12 text-calm-200 mx-auto mb-3" />
                    <p className="text-calm-500">No forums available yet. Check back later or ask an admin to create forums.</p>
                </div>
            )}

            {/* Threads */}
            {selectedForum && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-display font-semibold text-calm-800">Threads</h2>
                        {isAuthenticated && (
                            <button className="btn-primary text-sm gap-1.5">
                                <Plus className="w-4 h-4" />
                                New Thread
                            </button>
                        )}
                    </div>

                    {threadsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                        </div>
                    ) : threads.length === 0 ? (
                        <div className="card text-center py-8">
                            <MessageSquare className="w-12 h-12 text-calm-200 mx-auto mb-3" />
                            <p className="text-calm-500">No threads yet in this forum. Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {threads.map((thread) => (
                                <Link
                                    key={thread.id}
                                    to={`/threads/${thread.id}`}
                                    className="card flex items-start gap-4 hover:border-primary-200 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {thread.isPinned && (
                                                <Pin className="w-3.5 h-3.5 text-amber-500" />
                                            )}
                                            <h3 className="font-medium text-calm-800 hover:text-primary-600 transition-colors">
                                                {thread.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-calm-400">
                                            <span className="flex items-center gap-1">
                                                by <strong className="text-calm-600">{thread.author.displayName}</strong>
                                                {thread.author.isSurvivor && <span className="badge-survivor text-[10px]">Survivor</span>}
                                            </span>
                                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {thread.tags.map((tag) => (
                                                <span key={tag} className="badge bg-calm-100 text-calm-500 text-[10px]">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-calm-400 shrink-0">
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{thread.postCount}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" />{thread.upvotes}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{thread.viewCount}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
