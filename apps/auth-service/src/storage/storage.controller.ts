import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload-kyc')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'idCard', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
    ]))
    async uploadKycFiles(@UploadedFiles() files: { idCard?: any[], selfie?: any[] }) {
        if (!files.idCard || !files.idCard[0] || !files.selfie || !files.selfie[0]) {
            throw new UnauthorizedException('Both ID card and selfie are required.');
        }

        return this.storageService.uploadKycDocuments(files.idCard[0], files.selfie[0]);
    }
}
