import { createUrl } from "@/api/url";
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
import { queryClient } from "@/lib/queryClient";
import { urlSchema } from "@/schema/url";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { Link2, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface URLFormProps {
  initialUrl?: string;
}

type FormValues = typeof urlSchema.__outputType;

const URLForm = ({ initialUrl = "" }: URLFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(urlSchema),
    defaultValues: {
      original_url: initialUrl,
    },
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
            <div className="space-y-2">
              <Label htmlFor="original_url">URL to Shorten *</Label>
              <Input
                id="original_url"
                type="url"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                error={errors.original_url}
                {...register("original_url")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Give your link a memorable title"
                error={errors.title}
                {...register("title")}
              />
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
