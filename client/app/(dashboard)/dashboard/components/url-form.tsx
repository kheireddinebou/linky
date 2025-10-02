import { fetchUrlTitleSuggestions } from "@/api/url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@/hooks/use-query";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { urlSchema } from "@/schema/url";
import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import UrlTitleSuggestions from "./url-title-suggestions";

interface URLFormProps {
  initialUrl?: string;
  initialTitle?: string;
  mutate: (data: URLFormValues) => void;
  footer?: (isDirty: boolean) => React.ReactNode;
  resetForm?: React.MutableRefObject<() => void>;
}

export type URLFormValues = typeof urlSchema.__outputType;

const URLForm = ({
  initialUrl = "",
  initialTitle = "",
  mutate,
  footer,
  resetForm,
}: URLFormProps) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [debouncedUrl, setDebouncedUrl] = useState(initialUrl);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    resolver: yupResolver(urlSchema),
    defaultValues: {
      original_url: initialUrl,
      title: initialTitle,
    },
  });

  const watchedUrl = watch("original_url");

  const handleDebounceUrl = useCallback(
    debounce((url: string) => setDebouncedUrl(url), 500),
    []
  );

  useEffect(() => {
    handleDebounceUrl(watchedUrl);

    // cleanup debounce when component unmounts
    return () => {
      handleDebounceUrl.cancel();
    };
  }, [watchedUrl, handleDebounceUrl]);

  useEffect(() => {
    if (resetForm) {
      resetForm.current = () => reset();
    }
  }, [resetForm, reset]);

  useEffect(() => {
    setValue("original_url", initialUrl);
    setValue("title", initialTitle);
  }, [initialUrl, initialTitle]);

  // Check if URL is valid
  const isValidUrl = (string: string) => {
    if (!string) return false;
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFetchUrlTitleSuggestions = async () => {
    const suggestions = await fetchUrlTitleSuggestions(debouncedUrl);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
    return suggestions;
  };

  const {
    data: titleSuggestions = [],
    isLoading: loadingSuggestions,
    refetch: refetchSuggestions,
  } = useQuery({
    queryKey: ["url-title-suggestions", debouncedUrl],
    queryFn: handleFetchUrlTitleSuggestions,
    enabled: isValidUrl(debouncedUrl) && debouncedUrl !== initialUrl,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });

  const handleSelectSuggestion = (suggestion: string) => {
    setValue("title", suggestion);
    setShowSuggestions(false);
  };

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
    queryClient.setQueryData(["url-title-suggestions", debouncedUrl], []);
  };

  return (
    <form onSubmit={handleSubmit(v => mutate(v))} className="space-y-4">
      <div>
        <Label htmlFor="original_url">URL to Shorten *</Label>
        <Input
          id="original_url"
          type="url"
          placeholder="https://example.com/very/long/url/that/needs/shortening"
          className="mt-2"
          error={errors.original_url}
          {...register("original_url")}
        />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <Label htmlFor="title">Title (Optional)</Label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
            disabled={loadingSuggestions || !isValidUrl(watchedUrl)}
            onClick={() => refetchSuggestions()}
          >
            <Sparkles
              className={cn("w-3 h-3", {
                "animate-spin": loadingSuggestions,
              })}
            />
            {loadingSuggestions && "Suggesting..."}
          </Button>
        </div>

        <Input
          id="title"
          placeholder="Give your link a memorable title"
          className="mt-2"
          error={errors.title}
          {...register("title")}
        />

        <AnimatePresence>
          {showSuggestions && titleSuggestions.length > 0 && (
            <UrlTitleSuggestions
              titleSuggestions={titleSuggestions}
              handleDismissSuggestions={handleDismissSuggestions}
              handleSelectSuggestion={handleSelectSuggestion}
            />
          )}
        </AnimatePresence>
      </div>

      {footer?.(isDirty)}
    </form>
  );
};

export default URLForm;
