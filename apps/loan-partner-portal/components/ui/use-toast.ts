import * as React from "react"

export const useToast = () => {
    return {
        toast: ({ title, description, variant }: { title?: string, description?: string, variant?: "default" | "destructive" }) => {
            console.log(`Toast: ${title} - ${description} (${variant})`);
            // In a real implementation, this would trigger a UI toast.
            // For now, let's keep it silent or use console.
        }
    }
}
