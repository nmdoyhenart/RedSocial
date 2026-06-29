import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Genera automáticamente 'createdAt' y 'updatedAt'
export class Comment extends Document {
    @Prop({ required: true, trim: true })
    mensaje!: string;

    // Consigna: Agrega el atributo modificado (true como flag)
    @Prop({ default: false })
    modificado!: boolean;

    // Relación con el usuario que comenta
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    autor!: Types.ObjectId;

    // Relación con el post donde se comenta
    @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
    publicacion!: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);