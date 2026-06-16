/// <reference types="multer" />
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class ArchivosService {
    // La promesa solo espera el tipo de éxito
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'social-network-tp2' }, 
            (error, result) => {
            // Envolvemos el error de Cloudinary en un Error nativo
            if (error) return reject(new Error(error.message));
            
            resolve(result!); // "!" asegura que result no es undefined
            },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}