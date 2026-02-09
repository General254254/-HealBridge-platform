import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SYSTEM_PROMPT = `You are HealBridge AI, a supportive health companion. Your role is to:
1. Provide evidence-based health information from verified medical sources
2. Offer emotional support and coping strategies
3. Help users understand their conditions and treatment options
4. Suggest when to consult healthcare professionals

CRITICAL RULES:
- NEVER provide medical diagnoses
- NEVER prescribe medications or treatments
- NEVER replace professional medical advice
- ALWAYS include disclaimers when discussing health topics
- ALWAYS suggest consulting a healthcare provider for serious concerns
- If a user expresses suicidal thoughts or self-harm, immediately provide crisis hotline numbers:
  - National Suicide Prevention Lifeline: 988
  - Crisis Text Line: Text HOME to 741741

You have access to verified medical information from PubMed, Mayo Clinic, and NIH sources.
When citing information, always reference the source.`;

const DISCLAIMER = '⚕️ This information is for educational purposes only and should not replace professional medical advice. Always consult your healthcare provider for personalized guidance.';

@Injectable()
export class CopilotService {
    constructor(private readonly prisma: PrismaService) { }

    async chat(userId: string, message: string, conversationId?: string): Promise<any> {
        // Get or create conversation
        let conversation;
        if (conversationId) {
            conversation = await this.prisma.aIConversation.findUnique({
                where: { id: conversationId, userId },
            });
            if (!conversation) throw new NotFoundException('Conversation not found');
        }

        // Get user profile for context
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
            include: { condition: true },
        });

        // Build user context
        const userContext = profile
            ? `User condition: ${profile.condition?.name ?? 'Not specified'}. Stage: ${profile.conditionStage ?? 'Not specified'}.`
            : '';

        // Get existing messages
        const existingMessages = conversation
            ? (conversation.messages as any[])
            : [];

        // Build message history for API call
        const messages = [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser Context: ${userContext}` },
            ...existingMessages.map((m: any) => ({ role: m.role, content: m.content })),
            { role: 'user', content: message },
        ];

        // Call the AI API (OpenAI-compatible)
        // In production, replace with actual API call
        const aiResponse = await this.callAI(messages);

        // Store the conversation
        const newMessages = [
            ...existingMessages,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString(),
                sources: [],
            },
        ];

        const title = existingMessages.length === 0 ? message.substring(0, 100) : undefined;

        if (conversation) {
            await this.prisma.aIConversation.update({
                where: { id: conversation.id },
                data: { messages: newMessages as any, ...(title ? { title } : {}) },
            });
        } else {
            conversation = await this.prisma.aIConversation.create({
                data: {
                    userId,
                    title: message.substring(0, 100),
                    messages: newMessages as any,
                },
            });
        }

        // Audit log
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'ai_chat',
                entityType: 'ai_conversation',
                entityId: conversation.id,
            },
        });

        return {
            conversationId: conversation.id,
            message: {
                role: 'assistant',
                content: aiResponse,
                sources: [],
                timestamp: new Date().toISOString(),
            },
            disclaimer: DISCLAIMER,
        };
    }

    async getHistory(userId: string): Promise<any> {
        return this.prisma.aIConversation.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getConversation(userId: string, conversationId: string): Promise<any> {
        const conversation = await this.prisma.aIConversation.findUnique({
            where: { id: conversationId, userId },
        });

        if (!conversation) throw new NotFoundException('Conversation not found');
        return conversation;
    }

    async deleteConversation(userId: string, conversationId: string): Promise<any> {
        const conversation = await this.prisma.aIConversation.findUnique({
            where: { id: conversationId, userId },
        });

        if (!conversation) throw new NotFoundException('Conversation not found');

        await this.prisma.aIConversation.delete({ where: { id: conversationId } });
        return { message: 'Conversation deleted' };
    }

    private async callAI(messages: { role: string; content: string }[]): Promise<string> {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Fallback for development
            return `I understand you're looking for health information. ${DISCLAIMER}\n\nPlease configure the OPENAI_API_KEY environment variable to enable AI responses.`;
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API error:', error);
            return `I apologize, but I'm having trouble connecting right now. Please try again later. ${DISCLAIMER}`;
        }
    }
}
