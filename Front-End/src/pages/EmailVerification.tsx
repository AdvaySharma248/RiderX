import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { authApi, toApiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

type VerificationStatus = "verifying" | "success" | "error";

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  const verificationParams = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      token: String(query.get("token") || "").trim(),
      tokenHash: String(query.get("token_hash") || "").trim(),
      type: String(query.get("type") || "").trim(),
    };
  }, [location.search]);

  const accountType = useMemo(
    () => (location.pathname.startsWith("/captain/") ? ("driver" as const) : ("rider" as const)),
    [location.pathname]
  );

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const verify = async () => {
      if (!verificationParams.token && !verificationParams.tokenHash) {
        setStatus("error");
        setMessage("This verification link is invalid or missing a token.");
        return;
      }

      try {
        await authApi.verifyEmailToken({
          token: verificationParams.token || undefined,
          tokenHash: verificationParams.tokenHash || undefined,
          type: verificationParams.type || undefined,
          accountType,
        });

        if (cancelled) return;

        setStatus("success");
        setMessage("Email verified successfully. Redirecting to sign in...");
        toast.success("Email verified successfully.");

        redirectTimer = setTimeout(() => {
          if (!cancelled) {
            navigate("/", { replace: true });
          }
        }, 1800);
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(toApiErrorMessage(error, "Verification link is invalid or has expired."));
      }
    };

    void verify();

    return () => {
      cancelled = true;
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [accountType, navigate, verificationParams]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-full inline-flex items-center justify-center",
              status === "success" && "bg-green-500/15 text-green-500",
              status === "error" && "bg-red-500/15 text-red-500",
              status === "verifying" && "bg-primary/15 text-primary"
            )}
          >
            {status === "success" ? (
              <CheckCircle2 size={20} />
            ) : status === "error" ? (
              <CircleAlert size={20} />
            ) : (
              <Loader2 size={20} className="animate-spin" />
            )}
          </div>
          <h1 className="text-xl font-display font-bold">Email Verification</h1>
        </div>

        <p className="text-sm text-muted-foreground">{message}</p>

        {(status === "success" || status === "error") && (
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
          >
            Go To Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
