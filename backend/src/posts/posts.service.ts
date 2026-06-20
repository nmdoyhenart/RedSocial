import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
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
        .sort(sortQuery)
        .skip(offset)
        .limit(limit)
        .populate('user', 'identificador imagenPerfil');

        // Contamos el total
        const total = await this.postModel.countDocuments(filter);

        return {
        total,
        posts
        };
    }

    // Baja de publicación
    async delete(postId: string, userId: string) {
        // Buscar el post
        const post = await this.postModel.findById(postId);

        if (!post) {
        throw new NotFoundException('La publicación no existe');
        }

        // Verificamos que el usuario que intenta borrar sea el creador
        const creadorId = post.user as string;

        if (creadorId.toString() !== userId) {
        throw new UnauthorizedException('No tenés permiso para eliminar esta publicación');
        }

        // Aplicar la baja lógica
        post.isActive = false;
        await post.save();

        return { mensaje: 'Publicación eliminada correctamente' };
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
}