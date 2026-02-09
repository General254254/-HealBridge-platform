import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrackingService } from './tracking.service';

@ApiTags('tracking')
@Controller('tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) { }

    // ---- Symptoms ----

    @Post('symptoms')
    @ApiOperation({ summary: 'Log a symptom' })
    async logSymptom(
        @Request() req: any,
        @Body() body: { symptomType: string; severity: number; notes?: string; loggedAt?: string },
    ) {
        return this.trackingService.logSymptom(req.user.id, body);
    }

    @Get('symptoms')
    @ApiOperation({ summary: 'Get symptom logs' })
    async getSymptoms(
        @Request() req: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.trackingService.getSymptoms(req.user.id, startDate, endDate);
    }

    // ---- Medications ----

    @Post('medications')
    @ApiOperation({ summary: 'Add a medication' })
    async addMedication(
        @Request() req: any,
        @Body() body: {
            medicationName: string;
            dosage?: string;
            frequency?: string;
            startDate?: string;
            endDate?: string;
            notes?: string;
        },
    ) {
        return this.trackingService.addMedication(req.user.id, body);
    }

    @Get('medications')
    @ApiOperation({ summary: 'Get medications' })
    async getMedications(@Request() req: any) {
        return this.trackingService.getMedications(req.user.id);
    }

    // ---- Appointments ----

    @Post('appointments')
    @ApiOperation({ summary: 'Add an appointment' })
    async addAppointment(
        @Request() req: any,
        @Body() body: {
            title: string;
            provider?: string;
            location?: string;
            notes?: string;
            scheduledAt: string;
        },
    ) {
        return this.trackingService.addAppointment(req.user.id, body);
    }

    @Get('appointments')
    @ApiOperation({ summary: 'Get appointments' })
    async getAppointments(@Request() req: any) {
        return this.trackingService.getAppointments(req.user.id);
    }
}
