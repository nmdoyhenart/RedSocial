import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true }) // Genera createdAt y updatedAt automáticamente
export class Post {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ default: null })
    imageUrl!: string;

    // Relación con el usuario creador del post
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user!: User | string; // El ID de texto tmb es valido

    // Array de usuarios que dieron "Me gusta"
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
    likes!: User[];

    // TRUCO: Guardamos la cantidad para poder ordenar súper rápido
    @Prop({ default: 0 })
    likesCount!: number;

    // Delete flag
    @Prop({ default: true })
    isActive!: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);