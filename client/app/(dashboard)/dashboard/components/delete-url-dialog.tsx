import { deleteUrl } from "@/api/url";
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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface URLListProps {
  url: URLItem;
}

const DeleteURLDialog = ({ url }: URLListProps) => {
  const [open, setOpen] = useState(false);

  const { mutate: mutateDelete, isPending } = useMutation({
    mutationFn: handleDeleteUrl,
  });

  async function handleDeleteUrl() {
    await deleteUrl(url.id?.toString());
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["urls"] });
    toast.success("URL deleted successfully! 🗑️");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "text-destructive hover:!text-destructive",
        })}
      >
        <Trash2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete URL</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this URL? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium text-sm">{url.title || "Untitled"}</p>
            <p className="text-sm text-muted-foreground truncate">
              {url.original_url}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose className={buttonVariants({ variant: "outline" })}>
              Cancel
            </DialogClose>
            <Button
              onClick={mutateDelete}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteURLDialog;
