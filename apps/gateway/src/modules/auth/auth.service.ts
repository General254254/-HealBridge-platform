import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(email: string, password: string, displayName: string) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user and profile
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                profile: {
                    create: {
                        displayName,
                    },
                },
            },
            include: { profile: true },
        });

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Audit log
        await this.logAudit(user.id, 'register');

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.profile
                    ? {
                        displayName: user.profile.displayName,
                        avatarUrl: user.profile.avatarUrl,
                        isSurvivor: user.profile.isSurvivor,
                    }
                    : null,
            },
            ...tokens,
        };
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check 2FA
        if (user.is2FAEnabled) {
            return {
                requires2FA: true,
                tempToken: this.jwtService.sign(
                    { sub: user.id, type: '2fa' },
                    { expiresIn: '5m' },
                ),
            };
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Audit log
        await this.logAudit(user.id, 'login');

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.profile
                    ? {
                        displayName: user.profile.displayName,
                        avatarUrl: user.profile.avatarUrl,
                        isSurvivor: user.profile.isSurvivor,
                    }
                    : null,
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Rotate refresh token
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const tokens = await this.generateTokens(
            storedToken.user.id,
            storedToken.user.email,
            storedToken.user.role,
        );

        return tokens;
    }

    async logout(userId: string) {
        // Delete all refresh tokens for user
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        await this.logAudit(userId, 'logout');
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        // Store refresh token
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        };
    }

    private async logAudit(userId: string, action: string) {
        await this.prisma.auditLog.create({
            data: { userId, action },
        });
    }
}
