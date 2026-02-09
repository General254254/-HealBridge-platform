import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getMyProfile(@Request() req: any): Promise<any> {
        return this.usersService.getProfile(req.user.id);
    }

    @Get('me/dashboard')
    @ApiOperation({ summary: 'Get personal health dashboard' })
    async getDashboard(@Request() req: any): Promise<any> {
        return this.usersService.getDashboard(req.user.id);
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateMyProfile(@Request() req: any, @Body() body: any): Promise<any> {
        return this.usersService.updateProfile(req.user.id, body);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get public user profile by ID' })
    async getProfile(@Param('id') id: string): Promise<any> {
        return this.usersService.getProfile(id);
    }

    @Get(':id/posts')
    @ApiOperation({ summary: 'Get user posts' })
    async getUserPosts(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<any> {
        return this.usersService.getUserPosts(id, page, limit);
    }

    @Delete('me')
    @ApiOperation({ summary: 'Delete own account (GDPR right to deletion)' })
    async deleteAccount(@Request() req: any) {
        return this.usersService.deleteAccount(req.user.id);
    }

    @Post('me/export')
    @ApiOperation({ summary: 'Export all user data (HIPAA/GDPR portability)' })
    async exportData(@Request() req: any): Promise<any> {
        return this.usersService.exportMyData(req.user.id);
    }
}
