import { z } from 'zod';

export const CreateSymptomLogDto = z.object({
    symptomType: z.string().min(1).max(100),
    severity: z.number().int().min(1).max(10),
    notes: z.string().max(2000).optional(),
    loggedAt: z.string().datetime().optional(),
});

export const CreateMedicationLogDto = z.object({
    medicationName: z.string().min(1).max(200),
    dosage: z.string().max(100).optional(),
    frequency: z.string().max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    notes: z.string().max(2000).optional(),
});

export const CreateAppointmentDto = z.object({
    title: z.string().min(1).max(200),
    provider: z.string().max(200).optional(),
    location: z.string().max(300).optional(),
    notes: z.string().max(2000).optional(),
    scheduledAt: z.string().datetime(),
});

export interface SymptomLogResponse {
    id: string;
    symptomType: string;
    severity: number;
    notes: string | null;
    loggedAt: string;
}

export interface DashboardSummary {
    recentSymptoms: SymptomLogResponse[];
    upcomingAppointments: {
        id: string;
        title: string;
        provider: string | null;
        scheduledAt: string;
    }[];
    activeMedications: number;
    unreadNotifications: number;
}

export type CreateSymptomLogInput = z.infer<typeof CreateSymptomLogDto>;
export type CreateMedicationLogInput = z.infer<typeof CreateMedicationLogDto>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentDto>;
