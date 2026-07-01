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

    // GET: Cantidad de comentarios por usuario, filtrable por rango de fechas
    async obtenerComentariosPorUsuario(desde?: string, hasta?: string) {
        const filtro: any = {};

        if (desde || hasta) {
            filtro.createdAt = {};

            if (desde) {
                filtro.createdAt.$gte = new Date(desde);
            }

            if (hasta) {
                const fechaFin = new Date(hasta);
                fechaFin.setHours(23, 59, 59, 999);
                filtro.createdAt.$lte = fechaFin;
            }
        }

        return this.commentModel.aggregate([
            {
                $match: filtro
            },
            {
                $group: {
                    _id: "$autor",
                    cantidad: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "usuario"
                }
            },
            {
                $unwind: "$usuario"
            },
            {
                $project: {

                    _id: 0,

                    usuario: "$usuario.nombreUsuario",

                    cantidad: 1

                }
            },
            {
                $sort: {
                    cantidad: -1
                }
            }
        ]);
    }
    
    // GET: Cantidad de comentarios por publicación, filtrable por rango de fechas
    async obtenerComentariosPorPublicacion(desde?: string, hasta?: string) {
        const filtro: any = {};

        if (desde || hasta) {
            filtro.createdAt = {};

            if (desde) {
                filtro.createdAt.$gte = new Date(desde);
            }

            if (hasta) {
                const fechaFin = new Date(hasta);
                fechaFin.setHours(23, 59, 59, 999);
                filtro.createdAt.$lte = fechaFin;
            }
        }
        return this.commentModel.aggregate([
            {
                $match: filtro
            },
            {
                $group: {
                    _id: "$publicacion",
                    cantidad: {
                        $sum: 1
                    }
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "publicacion"
                }
            },
            {
                $unwind: "$publicacion"
            },
            {
                $project: {
                    _id: 0,
                    publicacion: {
                        $substrCP: ["$publicacion.title", 0, 25]
                    },
                    fecha: "$publicacion.createdAt",
                    cantidad: 1
                }
            },
            {
                $sort: {
                    fecha: 1
                }
            }
        ]);
    }
}