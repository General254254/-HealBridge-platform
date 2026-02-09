import { z } from 'zod';
import { ConditionCategory, VerificationStatus } from './enums';

export const UpdateProfileDto = z.object({
    displayName: z.string().min(2).max(50).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().optional(),
    primaryConditionId: z.string().uuid().optional(),
    conditionStage: z.string().max(100).optional(),
    isSurvivor: z.boolean().optional(),
    isAnonymous: z.boolean().optional(),
    recoveryStory: z.string().max(5000).optional(),
});

export interface UserProfileResponse {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    condition: {
        id: string;
        name: string;
        category: ConditionCategory;
    } | null;
    conditionStage: string | null;
    isSurvivor: boolean;
    isAnonymous: boolean;
    verificationStatus: VerificationStatus;
    createdAt: string;
}

export type UpdateProfileInput = z.infer<typeof UpdateProfileDto>;
