"use client";

import { login } from "@/api/auth";
import GoogleButton from "@/components/google-button";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/schema/auth";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@/hooks/useMutation";
import { Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const LoginForm = () => {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const { mutate: mutateLogin, isPending } = useMutation({
    mutationFn: handleLogin,
  });

  const { setUser } = useAuthStore();
  const router = useRouter();

  async function handleLogin(data: any) {
    const response = await login(data);
    setUser(response.user);
    toast.success("Welcome back! Logged in successfully");
    router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(d => mutateLogin(d))}>
      <CardHeader className="text-center">
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your username or email to access your dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Identifier Field */}
        <div className="space-y-2">
          <Label htmlFor="identifier" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Username or Email
          </Label>
          <Input
            id="identifier"
            type="text"
            placeholder="Enter your username or email"
            error={errors.identifier}
            {...register("identifier")}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password}
            {...register("password")}
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" variant="magic">
          {isPending ? "Signing In..." : "Sign In"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleButton disabled={isPending} />

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto font-normal" asChild>
            <Link href="/register">Create one now</Link>
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};

export default LoginForm;
