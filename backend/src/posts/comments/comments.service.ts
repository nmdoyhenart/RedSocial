import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../schemas/comment.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>
    ) {}

    // POST: Agrega un comentario
    async agregarComentario(postId: string, userId: string, dto: CreateCommentDto): Promise<Comment> {
        const nuevoComentario = new this.commentModel({
        mensaje: dto.mensaje,
        autor: new Types.ObjectId(userId),
        publicacion: new Types.ObjectId(postId)
        });

        const guardado = await nuevoComentario.save();
        return guardado.populate('autor', 'nombreUsuario imagenPerfil');
    }

    // PUT: Modifica el mismo comentario
    async modificarComentario(commentId: string, userId: string, dto: CreateCommentDto): Promise<Comment> {
        const comentario = await this.commentModel.findById(commentId);

        if (!comentario) {
        throw new NotFoundException('El comentario no existe.');
        }

        if (comentario.autor.toString() !== userId) {
        throw new ForbiddenException('No tenés permisos para modificar este comentario.');
        }

        comentario.mensaje = dto.mensaje;
        comentario.modificado = true; // Marcar como modificado/editado

        const actualizado = await comentario.save();
        return actualizado.populate('autor', 'nombreUsuario imagenPerfil');
    }

    // GET: Trae comentarios paginados y ordenados
    async traerComentariosPorPost(postId: string, limit: number, offset: number) {
        const query = { publicacion: new Types.ObjectId(postId) };

        const comentarios = await this.commentModel.find(query)
        .populate('autor', 'nombreUsuario imagenPerfil')
        .sort('-createdAt') // Los mas recientes
        .skip(offset)
        .limit(limit)
        .exec();

        const total = await this.commentModel.countDocuments(query).exec();

        return { comentarios, total };
    }
}