import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CopilotService } from './copilot.service';

@ApiTags('copilot')
@Controller('copilot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CopilotController {
    constructor(private readonly copilotService: CopilotService) { }

    @Post('chat')
    @ApiOperation({ summary: 'Send a message to AI Copilot' })
    async chat(
        @Request() req: any,
        @Body() body: { message: string; conversationId?: string },
    ) {
        return this.copilotService.chat(req.user.id, body.message, body.conversationId);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get all AI conversations' })
    async getHistory(@Request() req: any) {
        return this.copilotService.getHistory(req.user.id);
    }

    @Get('history/:id')
    @ApiOperation({ summary: 'Get a specific conversation' })
    async getConversation(@Request() req: any, @Param('id') id: string) {
        return this.copilotService.getConversation(req.user.id, id);
    }

    @Delete('history/:id')
    @ApiOperation({ summary: 'Delete a conversation' })
    async deleteConversation(@Request() req: any, @Param('id') id: string) {
        return this.copilotService.deleteConversation(req.user.id, id);
    }
}
