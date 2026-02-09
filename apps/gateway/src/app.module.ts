import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        // Rate Limiting
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 3,
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 20,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 100,
            },
        ]),
        PrismaModule,
        AuthModule,
        UsersModule,
        CommunitiesModule,
        CopilotModule,
        ResourcesModule,
        TrackingModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
