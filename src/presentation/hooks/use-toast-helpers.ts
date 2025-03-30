import { useToast } from "./use-toast";

export function useToastHelpers() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      variant: "destructive",
      title,
      description,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      className: "bg-blue-50 border-blue-200 text-blue-800",
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
  };
}
