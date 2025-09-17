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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@/hooks/useMutation";
import { queryClient } from "@/lib/queryClient";
import { urlSchema } from "@/schema/url";
import { yupResolver } from "@hookform/resolvers/yup";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface URLListProps {
  url: URLItem;
}

const UpdateURLDialog = ({ url }: URLListProps) => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
  } = useForm({
    resolver: yupResolver(urlSchema),
    defaultValues: {
      original_url: url.original_url,
      title: url.title,
    },
  });

  const { mutate: mutateUpdate, isPending } = useMutation({
    mutationFn: handleUpdateUrl,
  });

  useEffect(() => {
    setValue("original_url", url.original_url);
    setValue("title", url.title);
  }, [url.original_url, url.title]);

  async function handleUpdateUrl(data: any) {
    await updateUrl(url.id?.toString(), data);
    reset();
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Enter a title for this URL"
              error={errors?.title}
              {...register("title")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-url">Original URL</Label>
            <Input
              id="edit_url"
              type="url"
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              error={errors.original_url}
              {...register("original_url")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose className={buttonVariants({ variant: "outline" })}>
              Cancel
            </DialogClose>
            <Button
              onClick={handleSubmit(d => mutateUpdate(d))}
              disabled={isPending || !isDirty}
            >
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateURLDialog;
