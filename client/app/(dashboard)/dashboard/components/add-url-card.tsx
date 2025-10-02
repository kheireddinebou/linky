import { createUrl } from "@/api/url";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "@/hooks/use-mutation";
import { queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Link2, Zap } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import URLForm, { URLFormValues } from "./url-form";

interface AddUrlCardProps {
  initialUrl?: string;
}

const AddUrlCard = ({ initialUrl = "" }: AddUrlCardProps) => {
  const { mutate: mutateAddUrl, isPending } = useMutation({
    mutationFn: handleAddUrl,
  });

  const resetForm = useRef("" as unknown as () => void);

  async function handleAddUrl(values: URLFormValues) {
    await createUrl(values);
    toast.success("✨ URL shortened successfully!");
    queryClient.invalidateQueries({ queryKey: ["urls"] });
    resetForm?.current();
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
          <URLForm
            resetForm={resetForm}
            initialUrl={initialUrl}
            mutate={mutateAddUrl}
            footer={() => (
              <Button
                type="submit"
                variant="magic"
                disabled={isPending}
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isPending ? "Shortening..." : "Shorten URL"}
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AddUrlCard;
