import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResourcesService {
    constructor(private readonly prisma: PrismaService) { }

    async getResources(filters?: { category?: string; type?: string; search?: string }, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where: any = { isVerified: true };

        if (filters?.category && filters.category !== 'all') {
            where.conditions = {
                some: {
                    condition: {
                        category: filters.category.toUpperCase() as any
                    }
                },
            };
        }

        if (filters?.type && filters.type !== 'all') {
            where.contentType = filters.type;
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [resources, total] = await Promise.all([
            this.prisma.resource.findMany({
                where,
                include: {
                    conditions: { include: { condition: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.resource.count({ where }),
        ]);

        return { data: resources, total, page, limit };
    }

    async getResourceById(id: string) {
        const resource = await this.prisma.resource.findUnique({
            where: { id },
            include: {
                conditions: { include: { condition: true } },
            },
        });

        if (!resource) throw new NotFoundException('Resource not found');
        return resource;
    }

    async bookmarkResource(userId: string, resourceId: string) {
        const existing = await this.prisma.bookmark.findUnique({
            where: { userId_resourceId: { userId, resourceId } },
        });

        if (existing) {
            await this.prisma.bookmark.delete({ where: { id: existing.id } });
            return { bookmarked: false };
        }

        await this.prisma.bookmark.create({
            data: { userId, resourceId },
        });

        return { bookmarked: true };
    }

    async getBookmarks(userId: string) {
        return this.prisma.bookmark.findMany({
            where: { userId },
            include: { resource: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
