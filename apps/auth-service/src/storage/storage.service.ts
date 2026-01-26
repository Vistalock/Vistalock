import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

@Injectable()
export class StorageService {
    private readonly uploadDir: string;
    private readonly baseUrl: string;

    constructor() {
        // Use environment variables with fallbacks
        this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
        this.baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:3000/uploads';

        // Ensure upload directory exists
        this.ensureUploadDir();
    }

    private async ensureUploadDir() {
        if (!existsSync(this.uploadDir)) {
            await mkdir(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Upload a single file to local storage
     * @param file - The file buffer and metadata
     * @param folder - Optional subfolder (e.g., 'kyc', 'products')
     * @returns Public URL to access the file
     */
    async uploadFile(file: UploadedFile, folder?: string): Promise<string> {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${randomUUID()}.${fileExtension}`;

        const targetDir = folder
            ? join(this.uploadDir, folder)
            : this.uploadDir;

        // Ensure subfolder exists
        if (!existsSync(targetDir)) {
            await mkdir(targetDir, { recursive: true });
        }

        const filePath = join(targetDir, fileName);

        // Write file to disk
        await writeFile(filePath, file.buffer);

        // Return public URL
        const publicPath = folder ? `${folder}/${fileName}` : fileName;
        return `${this.baseUrl}/${publicPath}`;
    }

    /**
     * Upload multiple files
     * @param files - Array of files
     * @param folder - Optional subfolder
     * @returns Array of public URLs
     */
    async uploadFiles(files: UploadedFile[], folder?: string): Promise<string[]> {
        const uploadPromises = files.map(file => this.uploadFile(file, folder));
        return Promise.all(uploadPromises);
    }

    /**
     * Upload KYC documents (ID card and selfie)
     * @param idCard - ID card file
     * @param selfie - Selfie file
     * @returns Object with URLs for both files
     */
    async uploadKycDocuments(idCard: UploadedFile, selfie: UploadedFile): Promise<{ idCardUrl: string; selfieUrl: string }> {
        const [idCardUrl, selfieUrl] = await Promise.all([
            this.uploadFile(idCard, 'kyc'),
            this.uploadFile(selfie, 'kyc')
        ]);

        return { idCardUrl, selfieUrl };
    }
}
