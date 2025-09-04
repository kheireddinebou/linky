import { useRouter } from "next/navigation";

const useGoogleAuth = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const currentURLOrigin = window.location.origin;
  const router = useRouter();

  const googleURL = `${API_BASE_URL}/oauth2/google?redirectUrl=${currentURLOrigin}/oauth2/callback`;

  const handleConnectWithGoogle = () => {
    router.push(googleURL);
  };

  return { googleURL, handleConnectWithGoogle };
};

export default useGoogleAuth;
