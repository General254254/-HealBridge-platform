import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Flag, Bookmark, Share2, ArrowLeft, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/auth.store';

interface Author {
    id: string;
    displayName: string;
    isSurvivor: boolean;
    avatarUrl?: string | null;
}

interface ThreadDetail {
    id: string;
    title: string;
    content: string;
    author: { id: string; profile?: { displayName: string; isSurvivor: boolean; avatarUrl?: string | null } };
    upvotes: number;
    downvotes: number;
    createdAt: string;
    tags: string[];
    forum?: { name: string; condition?: { name: string } };
}

interface Post {
    id: string;
    content: string;
    author: { id: string; profile?: { displayName: string; isSurvivor: boolean; avatarUrl?: string | null } };
    upvotes: number;
    createdAt: string;
    isEdited: boolean;
}

export default function ThreadPage() {
    const { threadId } = useParams<{ threadId: string }>();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (threadId) {
            loadThread();
            loadPosts();
        }
    }, [threadId]);

    const loadThread = async () => {
        try {
            const { data } = await api.get(`/threads/${threadId}`);
            setThread(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Thread not found');
        } finally {
            setLoading(false);
        }
    };

    const loadPosts = async () => {
        try {
            const { data } = await api.get(`/threads/${threadId}/posts`);
            setPosts(data.data || []);
        } catch {
            // Posts unavailable
        }
    };

    const handleVoteThread = async (type: 'up' | 'down') => {
        if (!isAuthenticated || !thread) return;
        try {
            const { data } = await api.post(`/threads/${thread.id}/vote`, { type });
            setThread({ ...thread, upvotes: data.upvotes, downvotes: data.downvotes });
        } catch {
            // Vote failed
        }
    };

    const handleVotePost = async (postId: string) => {
        if (!isAuthenticated) return;
        try {
            await api.post(`/posts/${postId}/vote`, { type: 'up' });
            loadPosts(); // Refresh posts
        } catch {
            // Vote failed
        }
    };

    const submitReply = async () => {
        if (!replyContent.trim() || submitting || !threadId) return;
        setSubmitting(true);
        try {
            await api.post(`/threads/${threadId}/posts`, { content: replyContent });
            setReplyContent('');
            loadPosts(); // Refresh
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const getAuthorName = (author: any) => author?.profile?.displayName || 'Anonymous';
    const getAuthorSurvivor = (author: any) => author?.profile?.isSurvivor || false;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="card text-center py-12">
                    <p className="text-calm-500">{error || 'Thread not found'}</p>
                    <Link to="/forums" className="btn-primary mt-4 inline-flex">Back to Forums</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Back */}
            <Link to="/forums" className="inline-flex items-center gap-2 text-sm text-calm-400 hover:text-calm-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Forums
            </Link>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {/* Original Post */}
            <div className="card mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                        {getAuthorName(thread.author).charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-calm-800">{getAuthorName(thread.author)}</span>
                            {getAuthorSurvivor(thread.author) && <span className="badge-survivor">Survivor</span>}
                        </div>
                        <span className="text-xs text-calm-400">
                            {new Date(thread.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>

                <h1 className="text-xl font-display font-bold text-calm-800 mb-4">{thread.title}</h1>
                <div className="prose prose-calm text-calm-600 whitespace-pre-line mb-6">
                    {thread.content}
                </div>

                <div className="flex items-center gap-1.5 mb-4">
                    {thread.tags.map((tag) => (
                        <span key={tag} className="badge bg-calm-100 text-calm-500 text-xs">#{tag}</span>
                    ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-calm-100">
                    <button
                        onClick={() => handleVoteThread('up')}
                        className="flex items-center gap-1.5 text-sm text-calm-400 hover:text-primary-600 transition-colors"
                    >
                        <ThumbsUp className="w-4 h-4" /> {thread.upvotes}
                    </button>
                    <button
                        onClick={() => handleVoteThread('down')}
                        className="flex items-center gap-1.5 text-sm text-calm-400 hover:text-red-500 transition-colors"
                    >
                        <ThumbsDown className="w-4 h-4" /> {thread.downvotes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-calm-400 hover:text-amber-500 transition-colors">
                        <Bookmark className="w-4 h-4" /> Save
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-calm-400 hover:text-secondary-600 transition-colors">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-calm-400 hover:text-red-400 transition-colors ml-auto">
                        <Flag className="w-4 h-4" /> Report
                    </button>
                </div>
            </div>

            {/* Replies */}
            <h2 className="font-display font-semibold text-calm-800 mb-4">{posts.length} Replies</h2>

            <div className="space-y-4 mb-8">
                {posts.length === 0 ? (
                    <div className="card text-center py-6">
                        <p className="text-sm text-calm-400">No replies yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className="card">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-calm-100 rounded-full flex items-center justify-center text-calm-600 font-bold text-xs">
                                    {getAuthorName(post.author).charAt(0)}
                                </div>
                                <div>
                                    <span className="font-medium text-sm text-calm-700">{getAuthorName(post.author)}</span>
                                    {getAuthorSurvivor(post.author) && <span className="badge-survivor text-[10px] ml-1.5">Survivor</span>}
                                    <span className="text-xs text-calm-400 ml-2">
                                        {new Date(post.createdAt).toLocaleString()}
                                    </span>
                                    {post.isEdited && <span className="text-xs text-calm-300 ml-1">(edited)</span>}
                                </div>
                            </div>
                            <p className="text-calm-600 text-sm mb-3 whitespace-pre-line">{post.content}</p>
                            <button
                                onClick={() => handleVotePost(post.id)}
                                className="flex items-center gap-1.5 text-xs text-calm-400 hover:text-primary-600 transition-colors"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Reply Box */}
            {isAuthenticated ? (
                <div className="card">
                    <h3 className="font-medium text-calm-700 mb-3">Add a Reply</h3>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="input-field min-h-[100px] resize-y"
                        placeholder="Share your thoughts or words of encouragement..."
                    />
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={submitReply}
                            className="btn-primary text-sm gap-1.5"
                            disabled={!replyContent.trim() || submitting}
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {submitting ? 'Posting...' : 'Post Reply'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card text-center py-6">
                    <p className="text-sm text-calm-500">
                        <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link> to join the conversation.
                    </p>
                </div>
            )}
        </div>
    );
}
