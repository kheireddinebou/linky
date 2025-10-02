import { updateUrl } from "@/api/url";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "@/hooks/use-mutation";
import { queryClient } from "@/lib/queryClient";
import { Edit } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import URLForm from "./url-form";

interface URLListProps {
  url: URLItem;
}

const UpdateURLDialog = ({ url }: URLListProps) => {
  const [open, setOpen] = useState(false);

  const { mutate: mutateUpdate, isPending } = useMutation({
    mutationFn: handleUpdateUrl,
  });

  const resetForm = useRef("" as unknown as () => void);

  async function handleUpdateUrl(data: any) {
    await updateUrl(url.id?.toString(), data);
    resetForm?.current();
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["urls"] });
    toast.success("URL updated successfully! ✨");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
          size: "sm",
        })}
      >
        <Edit className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit URL</DialogTitle>
          <DialogDescription>
            Update the title or original URL
          </DialogDescription>
        </DialogHeader>
        <URLForm
          mutate={mutateUpdate}
          initialTitle={url.title}
          initialUrl={url.original_url}
          resetForm={resetForm}
          footer={isDirty => (
            <div className="mt-4 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="magic"
                disabled={!isDirty || isPending}
              >
                {isPending ? "Updating..." : "Update URL"}
              </Button>
            </div>
          )}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateURLDialog;
