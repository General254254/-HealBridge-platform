import { z } from 'zod';

export const RegisterDto = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    displayName: z.string().min(2).max(50),
});

export const LoginDto = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const RefreshTokenDto = z.object({
    refreshToken: z.string(),
});

export const ForgotPasswordDto = z.object({
    email: z.string().email(),
});

export const ResetPasswordDto = z.object({
    token: z.string(),
    newPassword: z.string().min(8).max(128),
});

export const Verify2FADto = z.object({
    code: z.string().length(6),
});

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordDto>;
