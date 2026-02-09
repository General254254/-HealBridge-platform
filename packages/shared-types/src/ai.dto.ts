import { z } from 'zod';

export const ChatMessageDto = z.object({
    conversationId: z.string().uuid().optional(),
    message: z.string().min(1).max(4000),
});

export const FeedbackDto = z.object({
    conversationId: z.string().uuid(),
    messageIndex: z.number().int().nonnegative(),
    rating: z.enum(['helpful', 'not_helpful']),
    comment: z.string().max(500).optional(),
});

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: AISource[];
    timestamp: string;
}

export interface AISource {
    title: string;
    url: string;
    snippet: string;
}

export interface AIChatResponse {
    conversationId: string;
    message: AIMessage;
    disclaimer: string;
}

export interface AIConversationListItem {
    id: string;
    title: string | null;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
}

export type ChatMessageInput = z.infer<typeof ChatMessageDto>;
