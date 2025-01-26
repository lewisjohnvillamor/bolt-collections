// Import toast from sonner
import { toast } from 'sonner';

export function useToast() {
  return {
    toast: {
      // Define toast methods that match the expected interface
      error: (message: string) => toast.error(message),
      success: (message: string) => toast.success(message),
      info: (message: string) => toast.message(message),
      warning: (message: string) => toast.warning(message),
    },
  };
}