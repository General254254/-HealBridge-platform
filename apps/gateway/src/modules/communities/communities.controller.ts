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
import { CommunitiesService } from './communities.service';

@ApiTags('communities')
@Controller()
export class CommunitiesController {
    constructor(private readonly communitiesService: CommunitiesService) { }

    // ---- Categories ----

    @Get('categories')
    @ApiOperation({ summary: 'Get all disease categories with conditions' })
    async getCategories() {
        return this.communitiesService.getCategories();
    }

    @Get('categories/:conditionId/forums')
    @ApiOperation({ summary: 'Get forums for a specific condition' })
    async getForums(@Param('conditionId') conditionId: string) {
        return this.communitiesService.getForumsByCondition(conditionId);
    }

    // ---- Threads ----

    @Get('forums/:forumId/threads')
    @ApiOperation({ summary: 'Get threads in a forum' })
    async getThreads(
        @Param('forumId') forumId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('sort') sort?: string,
    ) {
        return this.communitiesService.getThreads(forumId, page, limit, sort);
    }

    @Post('forums/:forumId/threads')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new thread' })
    async createThread(
        @Request() req: any,
        @Param('forumId') forumId: string,
        @Body() body: { title: string; content: string; tags?: string[] },
    ) {
        return this.communitiesService.createThread(req.user.id, forumId, body.title, body.content, body.tags);
    }

    @Get('threads/:threadId')
    @ApiOperation({ summary: 'Get thread details' })
    async getThread(@Param('threadId') threadId: string) {
        return this.communitiesService.getThreadById(threadId);
    }

    // ---- Posts ----

    @Get('threads/:threadId/posts')
    @ApiOperation({ summary: 'Get posts in a thread' })
    async getPosts(
        @Param('threadId') threadId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.communitiesService.getPostsByThread(threadId, page, limit);
    }

    @Post('threads/:threadId/posts')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a post to a thread' })
    async createPost(
        @Request() req: any,
        @Param('threadId') threadId: string,
        @Body() body: { content: string },
    ) {
        return this.communitiesService.createPost(req.user.id, threadId, body.content);
    }

    @Put('posts/:postId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Edit a post' })
    async updatePost(
        @Request() req: any,
        @Param('postId') postId: string,
        @Body() body: { content: string },
    ) {
        return this.communitiesService.updatePost(postId, req.user.id, body.content);
    }

    @Delete('posts/:postId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a post' })
    async deletePost(@Request() req: any, @Param('postId') postId: string) {
        return this.communitiesService.deletePost(postId, req.user.id);
    }

    // ---- Voting ----

    @Post('threads/:threadId/vote')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Vote on a thread' })
    async voteThread(
        @Param('threadId') threadId: string,
        @Body() body: { type: 'up' | 'down' },
    ) {
        return this.communitiesService.voteThread(threadId, body.type);
    }

    @Post('posts/:postId/vote')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Vote on a post' })
    async votePost(
        @Param('postId') postId: string,
        @Body() body: { type: 'up' | 'down' },
    ) {
        return this.communitiesService.votePost(postId, body.type);
    }

    // ---- Reporting ----

    @Post('reports')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Report content or user' })
    async reportContent(
        @Request() req: any,
        @Body() body: { targetType: string; targetId: string; reason: string },
    ) {
        return this.communitiesService.reportContent(req.user.id, body.targetType, body.targetId, body.reason);
    }
}
