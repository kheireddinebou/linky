import { createUrl, fetchUrlTitleSuggestions } from "@/api/url";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@/hooks/useMutation";
import { useQuery } from "@/hooks/useQuery";
import { queryClient } from "@/lib/queryClient";
import { urlSchema } from "@/schema/url";
import { yupResolver } from "@hookform/resolvers/yup";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { Link2, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import UrlTitleSuggestions from "./url-title-suggestions";
import { cn } from "@/lib/utils";

interface URLFormProps {
  initialUrl?: string;
}

type FormValues = typeof urlSchema.__outputType;

const URLForm = ({ initialUrl = "" }: URLFormProps) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [debouncedUrl, setDebouncedUrl] = useState(initialUrl);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(urlSchema),
    defaultValues: {
      original_url: initialUrl,
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
    enabled: isValidUrl(debouncedUrl),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1,
  });

  const { mutate: mutateAddUrl, isPending } = useMutation({
    mutationFn: handleAddUrl,
  });

  async function handleAddUrl(values: FormValues) {
    await createUrl(values);
    toast.success("✨ URL shortened successfully!");
    queryClient.invalidateQueries({ queryKey: ["urls"] });
    reset();
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setValue("title", suggestion);
    setShowSuggestions(false);
  };

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
    queryClient.setQueryData(["url-title-suggestions", debouncedUrl], []);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-magic border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Shorten New URL
          </CardTitle>
          <CardDescription>
            Transform your long URL into a magical short link
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(v => mutateAddUrl(v))}
            className="space-y-4"
          >
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

            <Button
              type="submit"
              variant="magic"
              disabled={isPending}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              {isPending ? "Shortening..." : "Shorten URL"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default URLForm;
