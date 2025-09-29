"use client";

import { registerNewUser } from "@/api/auth";
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
import { registerSchema } from "@/schema/auth";
import { useAuthStore } from "@/store/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@/hooks/use-mutation";
import { Lock, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const RegisterForm = () => {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const { mutate: mutateRegister, isPending } = useMutation({
    mutationFn: handleRegister,
  });
  const { setUser } = useAuthStore();
  const router = useRouter();

  async function handleRegister(values: any) {
    const { confirmPassword, ...apiData } = values;
    // API call
    const response = await registerNewUser(apiData);
    setUser(response.user);
    toast.success("Account created successfully! Welcome to URL Wizardry ✨");
    router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(d => mutateRegister(d))}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <UserPlus className="w-5 h-5" />
          Create Account
        </CardTitle>
        <CardDescription>Fill in your details to get started</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="John"
              error={errors.first_name}
              {...register("first_name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Doe"
              error={errors.last_name}
              {...register("last_name")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            error={errors.email}
            {...register("email")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password *
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            error={errors.password}
            {...register("password")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Confirm Password *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          className="w-full"
          variant="magic"
          disabled={isPending}
        >
          {isPending ? "Creating Account..." : "Create Account"}
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

        <GoogleButton disabled={isPending} title="Sign up with Google" />

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto font-normal" asChild>
            <Link href="/login">Sign in here</Link>
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};

export default RegisterForm;
