"use client";

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
import { useAuthStore } from "@/store/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const LogoutDialog = () => {
  const { logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    logout();
    setOpen(false);
    toast.success("Logged out successfully! 👋");
    router.push("/login");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "gap-2",
        })}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out of your account?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <DialogClose className={buttonVariants({ variant: "outline" })}>
            Cancel
          </DialogClose>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
