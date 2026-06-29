import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('comentarios')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Post(':postId')
    @UseGuards(JwtAuthGuard)
    async crear(
        @Param('postId') postId: string,
        @Body() createCommentDto: CreateCommentDto,
        @Req() req: Request
    ) {
        const userId = req['user'].sub; 
        return this.commentsService.agregarComentario(postId, userId, createCommentDto);
    }

    @Put(':commentId')
    @UseGuards(JwtAuthGuard)
    async modificar(
        @Param('commentId') commentId: string,
        @Body() updateCommentDto: CreateCommentDto,
        @Req() req: Request
    ) {
        const userId = req['user'].sub;
        return this.commentsService.modificarComentario(commentId, userId, updateCommentDto);
    }

    @Get(':postId')
    async buscarPorPost(
        @Param('postId') postId: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string
    ) {
        const numericLimit = parseInt(limit || '5', 10);
        const numericOffset = parseInt(offset || '0', 10);

        return this.commentsService.traerComentariosPorPost(postId, numericLimit, numericOffset);
    }
}