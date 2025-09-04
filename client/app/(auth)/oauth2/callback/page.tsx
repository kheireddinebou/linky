"use client";

import { fetchCurrentUser } from "@/api/user";
import { useAuthStore } from "@/store/auth";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const OAuth2Callback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");
    const error = searchParams.get("error");

    const handleAuthenticateUser = async () => {
      if (error) {
        toast.error("Authentication failed: " + error);
        router.push("/login");
        return;
      }

      if (token) {
        try {
          setToken(token);
          const userData = await fetchCurrentUser();
          setUser(userData);
          toast.success("Successfully signed in with Google! ✨");
          router.push("/dashboard");
        } catch (error) {
          toast.error("Failed to process authentication data");
          router.push("/login");
        }
      } else {
        toast.error("Invalid authentication response");
        router.push("/login");
      }
    };

    handleAuthenticateUser();
  }, [searchParams, router, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
};

export default OAuth2Callback;
