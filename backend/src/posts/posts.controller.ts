import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Query, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ArchivosService } from '../archivos/archivos.service';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly archivosService: ArchivosService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('imagen'))
    async create(
        @Body() createPostDto: CreatePostDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        // Si el front envía una imagen, la subimos a Cloudinary
        if (file) {
        const imagenSubida = await this.archivosService.uploadImage(file);
        createPostDto.imageUrl = imagenSubida.secure_url;
        }

        // Pasamos el DTO completo al servicio
        return this.postsService.create(createPostDto);
    }

    @Get()
    async findAll(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('orderBy') orderBy?: string,
        @Query('userId') userId?: string,
    ) {
        // Convertimos limit y offset a números reales, o le seteamos valores por defecto
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const offsetNumber = offset ? parseInt(offset, 10) : 0;
        
        const orderPreference = orderBy || 'fecha';

        return this.postsService.findAll(limitNumber, offsetNumber, orderPreference, userId);
    }

    @Delete(':id')
    async remove(
        @Param('id') postId: string,
        @Body('userId') userId: string
    ) {
        return this.postsService.delete(postId, userId);
    }

    @Post(':id/like')
    async likePost(
        @Param('id') postId: string,
        @Body('userId') userId: string // Recibimos el userId del body
    ) {
        return this.postsService.likePost(postId, userId);
    }

    @Delete(':id/like')
    async unlikePost(
        @Param('id') postId: string,
        @Body('userId') userId: string
    ) {
        return this.postsService.unlikePost(postId, userId);
    }
}