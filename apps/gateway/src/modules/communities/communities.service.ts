import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommunitiesService {
    constructor(private readonly prisma: PrismaService) { }

    // ---- Categories & Conditions ----

    async getCategories() {
        const conditions = await this.prisma.condition.findMany({
            orderBy: { category: 'asc' },
        });

        // Group by category
        const grouped = conditions.reduce(
            (acc, condition) => {
                if (!acc[condition.category]) {
                    acc[condition.category] = [];
                }
                acc[condition.category].push(condition);
                return acc;
            },
            {} as Record<string, typeof conditions>,
        );

        return grouped;
    }

    // ---- Forums ----

    async getForumsByCondition(conditionId: string) {
        const forums = await this.prisma.forum.findMany({
            where: { conditionId, isActive: true },
            include: {
                _count: { select: { threads: true } },
                condition: true,
            },
        });

        return forums.map((f) => ({
            ...f,
            threadCount: f._count.threads,
        }));
    }

    // ---- Threads ----

    async getThreads(forumId: string, page = 1, limit = 20, sort = 'newest') {
        const skip = (page - 1) * limit;
        const orderBy =
            sort === 'popular'
                ? { upvotes: 'desc' as const }
                : { createdAt: 'desc' as const };

        const [threads, total] = await Promise.all([
            this.prisma.thread.findMany({
                where: { forumId },
                include: {
                    author: {
                        include: {
                            profile: { select: { displayName: true, avatarUrl: true, isSurvivor: true } },
                        },
                    },
                    _count: { select: { posts: true } },
                },
                orderBy: [{ isPinned: 'desc' }, orderBy],
                skip,
                take: limit,
            }),
            this.prisma.thread.count({ where: { forumId } }),
        ]);

        return {
            data: threads.map((t) => ({
                ...t,
                postCount: t._count.posts,
                author: {
                    id: t.author.id,
                    displayName: t.author.profile?.displayName ?? 'Anonymous',
                    avatarUrl: t.author.profile?.avatarUrl,
                    isSurvivor: t.author.profile?.isSurvivor ?? false,
                },
            })),
            total,
            page,
            limit,
        };
    }

    async createThread(authorId: string, forumId: string, title: string, content: string, tags?: string[]) {
        // Verify forum exists
        const forum = await this.prisma.forum.findUnique({ where: { id: forumId } });
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = await this.prisma.thread.create({
            data: {
                forumId,
                authorId,
                title,
                content,
                tags: tags || [],
            },
            include: {
                author: {
                    include: {
                        profile: { select: { displayName: true, avatarUrl: true, isSurvivor: true } },
                    },
                },
            },
        });

        return thread;
    }

    async getThreadById(threadId: string) {
        const thread = await this.prisma.thread.findUnique({
            where: { id: threadId },
            include: {
                author: {
                    include: {
                        profile: { select: { displayName: true, avatarUrl: true, isSurvivor: true } },
                    },
                },
                forum: { include: { condition: true } },
            },
        });

        if (!thread) throw new NotFoundException('Thread not found');

        // Increment view count
        await this.prisma.thread.update({
            where: { id: threadId },
            data: { viewCount: { increment: 1 } },
        });

        return {
            ...thread,
            author: {
                id: thread.author.id,
                displayName: thread.author.profile?.displayName ?? 'Anonymous',
                avatarUrl: thread.author.profile?.avatarUrl,
                isSurvivor: thread.author.profile?.isSurvivor ?? false,
            },
        };
    }

    // ---- Posts ----

    async getPostsByThread(threadId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { threadId },
                include: {
                    author: {
                        include: {
                            profile: { select: { displayName: true, avatarUrl: true, isSurvivor: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.post.count({ where: { threadId } }),
        ]);

        return { data: posts, total, page, limit };
    }

    async createPost(authorId: string, threadId: string, content: string) {
        const thread = await this.prisma.thread.findUnique({ where: { id: threadId } });
        if (!thread) throw new NotFoundException('Thread not found');
        if (thread.isLocked) throw new NotFoundException('Thread is locked');

        const post = await this.prisma.post.create({
            data: { threadId, authorId, content },
            include: {
                author: {
                    include: {
                        profile: { select: { displayName: true, avatarUrl: true, isSurvivor: true } },
                    },
                },
            },
        });

        return post;
    }

    async updatePost(postId: string, userId: string, content: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.authorId !== userId) throw new NotFoundException('Not authorized');

        return this.prisma.post.update({
            where: { id: postId },
            data: { content, isEdited: true },
        });
    }

    async deletePost(postId: string, userId: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');
        if (post.authorId !== userId) throw new NotFoundException('Not authorized');

        await this.prisma.post.delete({ where: { id: postId } });
        return { message: 'Post deleted' };
    }

    // ---- Voting ----

    async voteThread(threadId: string, type: 'up' | 'down') {
        const field = type === 'up' ? 'upvotes' : 'downvotes';
        return this.prisma.thread.update({
            where: { id: threadId },
            data: { [field]: { increment: 1 } },
        });
    }

    async votePost(postId: string, type: 'up' | 'down') {
        const field = type === 'up' ? 'upvotes' : 'downvotes';
        return this.prisma.post.update({
            where: { id: postId },
            data: { [field]: { increment: 1 } },
        });
    }

    // ---- Reporting ----

    async reportContent(reporterId: string, targetType: string, targetId: string, reason: string) {
        return this.prisma.report.create({
            data: { reporterId, targetType, targetId, reason },
        });
    }
}
