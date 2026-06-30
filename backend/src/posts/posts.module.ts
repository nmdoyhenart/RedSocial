import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';
import { ArchivosModule } from '../archivos/archivos.module';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { EstadisticasController } from './estadisticas.controller';
import { CommentSchema, Comment } from './schemas/comment.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema }
    ]),
    ArchivosModule,
    UsersModule
  ],
  controllers: [PostsController, CommentsController, EstadisticasController],
  providers: [PostsService, CommentsService],
})
export class PostsModule {}