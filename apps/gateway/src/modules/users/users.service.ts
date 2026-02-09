import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getProfile(userId: string): Promise<any> {
        const profile = await this.prisma.userProfile.findUnique({
            where: { userId },
            include: { condition: true },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        return profile;
    }

    async updateProfile(userId: string, data: any): Promise<any> {
        const profile = await this.prisma.userProfile.update({
            where: { userId },
            data,
            include: { condition: true },
        });

        // Audit log
        await this.prisma.auditLog.create({
            data: { userId, action: 'update_profile', entityType: 'user_profile', entityId: profile.id },
        });

        return profile;
    }

    async getUserPosts(userId: string, page = 1, limit = 20): Promise<any> {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId: userId },
                include: { thread: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.post.count({ where: { authorId: userId } }),
        ]);

        return { data: posts, total, page, limit };
    }

    async deleteAccount(userId: string) {
        await this.prisma.auditLog.create({
            data: { userId, action: 'delete_account' },
        });

        await this.prisma.user.delete({ where: { id: userId } });
        return { message: 'Account deleted successfully' };
    }

    async getDashboard(userId: string): Promise<any> {
        const [recentSymptoms, upcomingAppointments, activeMedications, unreadNotifications] =
            await Promise.all([
                this.prisma.symptomLog.findMany({
                    where: { userId },
                    orderBy: { loggedAt: 'desc' },
                    take: 5,
                }),
                this.prisma.appointment.findMany({
                    where: { userId, scheduledAt: { gte: new Date() } },
                    orderBy: { scheduledAt: 'asc' },
                    take: 5,
                }),
                this.prisma.medicationLog.count({
                    where: { userId, endDate: null },
                }),
                this.prisma.notification.count({
                    where: { userId, isRead: false },
                }),
            ]);

        return { recentSymptoms, upcomingAppointments, activeMedications, unreadNotifications };
    }

    async exportMyData(userId: string): Promise<any> {
        const data = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: { include: { condition: true } },
                symptomLogs: true,
                medications: true,
                appointments: true,
                aiConversations: true,
                bookmarks: { include: { resource: true } },
                threads: true,
                posts: true,
            },
        });

        if (!data) throw new NotFoundException('User not found');

        // Audit log for sensitive data export
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: 'export_data',
                metadata: { timestamp: new Date().toISOString() },
            },
        });

        return data;
    }
}
