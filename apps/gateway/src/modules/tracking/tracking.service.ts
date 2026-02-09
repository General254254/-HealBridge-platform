import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrackingService {
    constructor(private readonly prisma: PrismaService) { }

    // ---- Symptoms ----

    async logSymptom(userId: string, data: { symptomType: string; severity: number; notes?: string; loggedAt?: string }) {
        return this.prisma.symptomLog.create({
            data: {
                userId,
                symptomType: data.symptomType,
                severity: data.severity,
                notes: data.notes,
                loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
            },
        });
    }

    async getSymptoms(userId: string, startDate?: string, endDate?: string) {
        const where: any = { userId };

        if (startDate || endDate) {
            where.loggedAt = {};
            if (startDate) where.loggedAt.gte = new Date(startDate);
            if (endDate) where.loggedAt.lte = new Date(endDate);
        }

        return this.prisma.symptomLog.findMany({
            where,
            orderBy: { loggedAt: 'desc' },
        });
    }

    // ---- Medications ----

    async addMedication(userId: string, data: {
        medicationName: string;
        dosage?: string;
        frequency?: string;
        startDate?: string;
        endDate?: string;
        notes?: string;
    }) {
        return this.prisma.medicationLog.create({
            data: {
                userId,
                medicationName: data.medicationName,
                dosage: data.dosage,
                frequency: data.frequency,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                notes: data.notes,
            },
        });
    }

    async getMedications(userId: string) {
        return this.prisma.medicationLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ---- Appointments ----

    async addAppointment(userId: string, data: {
        title: string;
        provider?: string;
        location?: string;
        notes?: string;
        scheduledAt: string;
    }) {
        return this.prisma.appointment.create({
            data: {
                userId,
                title: data.title,
                provider: data.provider,
                location: data.location,
                notes: data.notes,
                scheduledAt: new Date(data.scheduledAt),
            },
        });
    }

    async getAppointments(userId: string) {
        return this.prisma.appointment.findMany({
            where: { userId },
            orderBy: { scheduledAt: 'asc' },
        });
    }
}
