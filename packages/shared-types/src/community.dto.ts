import { z } from 'zod';

export const CreateThreadDto = z.object({
    forumId: z.string().uuid(),
    title: z.string().min(5).max(200),
    content: z.string().min(10).max(10000),
    tags: z.array(z.string().max(30)).max(5).optional(),
});

export const CreatePostDto = z.object({
    threadId: z.string().uuid(),
    content: z.string().min(1).max(5000),
});

export const UpdatePostDto = z.object({
    content: z.string().min(1).max(5000),
});

export const ReportContentDto = z.object({
    targetType: z.enum(['thread', 'post', 'user']),
    targetId: z.string().uuid(),
    reason: z.string().min(10).max(1000),
});

export interface ThreadResponse {
    id: string;
    title: string;
    content: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    isPinned: boolean;
    viewCount: number;
    author: {
        id: string;
        displayName: string;
        avatarUrl: string | null;
        isSurvivor: boolean;
    };
    postCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ForumResponse {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    threadCount: number;
    condition: {
        id: string;
        name: string;
        category: string;
    };
}

export type CreateThreadInput = z.infer<typeof CreateThreadDto>;
export type CreatePostInput = z.infer<typeof CreatePostDto>;
