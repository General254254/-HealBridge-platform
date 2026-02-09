import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    @Get()
    @ApiOperation({ summary: 'List educational resources' })
    async getResources(
        @Query('category') category?: string,
        @Query('type') type?: string,
        @Query('search') search?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.resourcesService.getResources({ category, type, search }, page, limit);
    }

    @Get('bookmarks')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get bookmarked resources' })
    async getBookmarks(@Request() req: any) {
        return this.resourcesService.getBookmarks(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get resource details' })
    async getResource(@Param('id') id: string) {
        return this.resourcesService.getResourceById(id);
    }

    @Post('bookmark')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle bookmark on a resource' })
    async bookmark(@Request() req: any, @Body() body: { resourceId: string }) {
        return this.resourcesService.bookmarkResource(req.user.id, body.resourceId);
    }
}
