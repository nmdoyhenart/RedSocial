import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/schemas/user.schema';
import { Comment } from './schemas/comment.schema';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name)
        private postModel: Model<PostDocument>,

        @InjectModel(User.name)
        private userModel: Model<User>,

        @InjectModel(Comment.name)
        private commentModel: Model<Comment>,
    ) {}

    // Alta de publicación
    async create(createPostDto: CreatePostDto): Promise<Post> {
        const newPost = new this.postModel(createPostDto);
        return newPost.save();
    }

    // Listar publicaciones (Con paginación, filtros y ordenamiento)
    async findAll(limit: number, offset: number, orderBy: string, userId?: string) {
        // Armamos el filtro en un solo paso dependiendo de si hay userId o no
        const filter = userId 
        ? { isActive: true, user: userId } 
        : { isActive: true };

        // Armamos el ordenamiento
        const sortQuery: Record<string, 1 | -1> = orderBy === 'likes' 
        ? { likesCount: -1 } 
        : { createdAt: -1 };

        // Ejecutamos la consulta
        const posts = await this.postModel.find(filter)
            .populate('user', 'nombreUsuario imagenPerfil') // Solo una vez
            .sort(sortQuery)
            .skip(offset)
            .limit(limit)
            .exec();

        // Contamos el total
        const total = await this.postModel.countDocuments(filter);

        return {
        total,
        posts
        };
    }

    // Baja de publicación
    async delete(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);

        if (!post) {
            throw new NotFoundException('La publicación no existe');
        }

        const usuario = await this.userModel.findById(userId);

        if (!usuario) {
            throw new UnauthorizedException('Usuario inválido');
        }

        const esAdministrador = usuario.perfil === 'administrador';

        const esPropietario =
            post.user.toString() === userId;

        if (!esAdministrador && !esPropietario) {
            throw new UnauthorizedException(
                'No tenés permiso para eliminar esta publicación.'
            );
        }

        // Elimina todos los comentarios del post
        await this.commentModel.deleteMany({
            publicacion: post._id
        });

        // Baja lógica del post
        post.isActive = false;
        await post.save();

        return {
            mensaje: 'Publicación eliminada correctamente'
        };
    }

    // Dar "Me gusta"
    async likePost(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);
        if (!post) throw new NotFoundException('Publicación no encontrada');

        // Usamos $addToSet: agrega el ID solo si no existe en el array (evita duplicados)
        // Y le +1 a nuestro contador de likes
        await this.postModel.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 } 
        });

        return { mensaje: 'Me gusta agregado' };
    }

    // Sacar "Me gusta"
    async unlikePost(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);
        if (!post) throw new NotFoundException('Publicación no encontrada');

        // Verificamos si realmente le había dado like
        const likesArray = post.likes as unknown as string[];
        if (!likesArray.includes(userId)) {
        throw new UnauthorizedException('No le habías dado me gusta a esta publicación');
        }

        // Usamos $pull: saca el ID del array
        // Y -1 a nuestro contador
        await this.postModel.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
        $inc: { likesCount: -1 }
        });

        return { mensaje: 'Me gusta quitado' };
    }

    async getPosts(limit: string, offset: string, orderBy: string) {
    // Convertimos las cadenas de texto de la URL en numeros
    const numericLimit = parseInt(limit, 10) || 5;
    const numericOffset = parseInt(offset, 10) || 0;

    const orden = orderBy === 'likes' ? '-likesCount' : '-createdAt';

    // Ejecutamos la consulta usando los numeros limpios
    const posts = await this.postModel.find()
        .populate('user', 'nombreUsuario imagenPerfil') // Traemos los datos del usuario
        .sort(orden)
        .skip(numericOffset) // Salta los posts de páginas anteriores
        .limit(numericLimit) // Limita la cantidad
        .exec();

    const total = await this.postModel.countDocuments().exec();

    return { posts, total };
    }

    async obtenerMetricasPosts() {
        const metricas = await this.postModel.aggregate([
            {
                // Agrupamos las publicaciones por su fecha de creación (año-mes-día)
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    cantidad: { $sum: 1 } // Sumamos 1 por cada post en ese día
                }
            },
            { 
                // Ordenamos cronológicamente
                $sort: { _id: 1 } 
            }
        ]).exec();

        return metricas;
    }

    async obtenerPostsPorUsuario(desde?: string, hasta?: string) {
        const filtro: any = {
            isActive: true
        };

        if (desde || hasta) {

            filtro.createdAt = {};

            if (desde) {
                filtro.createdAt.$gte = new Date(desde);
            }

            if (hasta) {

                const fechaFin = new Date(hasta);

                fechaFin.setHours(23,59,59,999);

                filtro.createdAt.$lte = fechaFin;
            }
        }

        return this.postModel.aggregate([

            {
                $match: filtro
            },

            {
                $group: {
                    _id: "$user",
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
}