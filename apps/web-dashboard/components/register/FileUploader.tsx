import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FileUploaderProps {
    label: string;
    description?: string;
    fileUrl: string | null; // Changed from File to URL
    onFileChange: (url: string | null) => void;
    accept?: string;
    maxSizeMb?: number;
    required?: boolean;
}

export function FileUploader({
    label,
    description,
    fileUrl,
    onFileChange,
    accept = ".jpg,.jpeg,.png,.pdf",
    maxSizeMb = 10,
    required = false
}: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string>("");
    const [fileSize, setFileSize] = useState<number>(0);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError("");

        if (!selectedFile) return;

        // Validation
        if (selectedFile.size > maxSizeMb * 1024 * 1024) {
            setError(`File size exceeds ${maxSizeMb}MB limit.`);
            return;
        }

        // Upload to Vercel Blob
        setUploading(true);
        setFileName(selectedFile.name);
        setFileSize(selectedFile.size);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', 'merchant-applications');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const { url } = await res.json();
            onFileChange(url); // Store URL instead of File

        } catch (err: any) {
            setError(err.message || 'Upload failed. Please try again.');
            onFileChange(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onFileChange(null);
        setFileName("");
        setFileSize(0);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="grid gap-2">
            <Label className="flex gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            {!fileUrl ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors ${error ? 'border-red-500 bg-red-50' :
                            uploading ? 'border-primary bg-primary/5' :
                                'border-muted-foreground/25'
                        }`}
                    onClick={() => !uploading && inputRef.current?.click()}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-primary mb-2 animate-spin" />
                            <p className="text-sm font-medium">Uploading...</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {fileName} ({(fileSize / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {description || `Supported formats: ${accept} (Max ${maxSizeMb}MB)`}
                            </p>
                        </>
                    )}
                    {error && <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{fileName || 'File uploaded'}</p>
                            <p className="text-xs text-green-600">✓ Uploaded successfully</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemove} className="text-muted-foreground hover:text-red-600">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
                disabled={uploading}
            />
        </div>
    );
}
