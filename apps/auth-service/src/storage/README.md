# File Storage Service

## Overview
The `StorageService` provides a unified interface for file uploads, currently supporting local file storage with easy extensibility to cloud providers like AWS S3, MinIO, or Google Cloud Storage.

## Current Implementation: Local Storage

### Configuration
Set these environment variables in your `.env` file:

```env
# Directory where files will be stored (relative or absolute path)
UPLOAD_DIR=./uploads

# Base URL for accessing uploaded files
STORAGE_BASE_URL=http://localhost:3001/uploads
```

### Features
- **UUID-based filenames**: Prevents naming conflicts and enhances security
- **Organized folders**: Files are organized by type (e.g., `kyc/`, `products/`)
- **Automatic directory creation**: Creates upload directories if they don't exist
- **Static file serving**: Files are accessible via HTTP at `/uploads/{folder}/{filename}`

### Usage Example

```typescript
import { StorageService } from './storage/storage.service';

// Inject in your service
constructor(private storageService: StorageService) {}

// Upload a single file
const url = await this.storageService.uploadFile(file, 'kyc');

// Upload KYC documents
const { idCardUrl, selfieUrl } = await this.storageService.uploadKycDocuments(
  idCardFile,
  selfieFile
);
```

## Migrating to AWS S3

To migrate to S3, follow these steps:

### 1. Install AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Add Environment Variables
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=vistalock-uploads
STORAGE_PROVIDER=s3  # or 'local'
```

### 3. Extend StorageService

Create a new method or replace the existing `uploadFile` method:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

private s3Client: S3Client;

constructor() {
  if (process.env.STORAGE_PROVIDER === 's3') {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
}

async uploadFile(file: UploadedFile, folder?: string): Promise<string> {
  if (process.env.STORAGE_PROVIDER === 's3') {
    return this.uploadToS3(file, folder);
  }
  return this.uploadToLocal(file, folder);
}

private async uploadToS3(file: UploadedFile, folder?: string): Promise<string> {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${randomUUID()}.${fileExtension}`;
  const key = folder ? `${folder}/${fileName}` : fileName;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await this.s3Client.send(command);

  // Return CloudFront or S3 URL
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
```

## Security Considerations

### Local Storage
- Files are served via Express static middleware
- No authentication on file access (public URLs)
- Consider adding authentication middleware for sensitive files

### S3 Storage
- Use IAM roles with minimal permissions
- Enable S3 bucket versioning
- Configure CORS properly for web/mobile access
- Consider using CloudFront for CDN and better security
- Use presigned URLs for temporary access to sensitive files

## File Organization

```
uploads/
├── kyc/
│   ├── {uuid}.jpg  (ID cards)
│   └── {uuid}.jpg  (Selfies)
├── products/
│   └── {uuid}.png  (Product images)
└── documents/
    └── {uuid}.pdf  (Contracts, etc.)
```

## Production Checklist

- [ ] Update `STORAGE_BASE_URL` to production domain
- [ ] Set up proper backup strategy for uploads directory
- [ ] Configure CDN (CloudFront, Cloudflare) for better performance
- [ ] Implement file size limits and validation
- [ ] Add virus scanning for uploaded files
- [ ] Set up monitoring for storage usage
- [ ] Configure proper CORS headers
- [ ] Implement file retention policies
