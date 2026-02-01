
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface FileUploaderProps {
    label: string;
    description?: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    accept?: string;
    maxSizeMb?: number;
    required?: boolean;
}

export function FileUploader({
    label,
    description,
    file,
    onFileChange,
    accept = ".jpg,.jpeg,.png,.pdf",
    maxSizeMb = 5,
    required = false
}: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError("");

        if (!selectedFile) return;

        // Validation
        const allowedTypes = accept.split(',').map(t => t.trim());
        // Simple client-side check mapping extensions to mime types if needed, 
        // essentially relying on browser 'accept' but double checking logic usually happens here.
        // For brevity, relying on size check primarily.

        if (selectedFile.size > maxSizeMb * 1024 * 1024) {
            setError(`File size exceeds ${maxSizeMb}MB limit.`);
            return;
        }

        onFileChange(selectedFile);
    };

    const handleRemove = () => {
        onFileChange(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="grid gap-2">
            <Label className="flex gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            {!file ? (
                <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-muted-foreground/25'}`}
                    onClick={() => inputRef.current?.click()}
                >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {description || `Supported formats: ${accept} (Max ${maxSizeMb}MB)`}
                    </p>
                    {error && <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {file.type.includes('pdf') ? <FileText className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
            />
        </div>
    );
}
