import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleSignin, isLoading, error } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");

    if (!code) {
      return;
    }

    const handleCallback = async () => {
      const success = await googleSignin(code);
      if (success) {
        navigate("/app");
      }
    };

    handleCallback();
  }, [searchParams, navigate, googleSignin]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/auth/signin" className="text-primary hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (!searchParams.get("code")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">
            No authorization code received
          </p>
          <a href="/auth/signin" className="text-primary hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2 text-muted-foreground">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <p>Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
