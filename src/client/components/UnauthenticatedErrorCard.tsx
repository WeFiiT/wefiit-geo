import { useEffect } from "react";
import { getSignInHref, getSignInHrefForLocation } from "@/lib/auth-redirect";
import {
  isEntraIdClientAuthMode,
  isHostedClientAuthMode,
} from "@/lib/auth-mode";

type UnauthenticatedErrorCardProps = {
  message: string;
  onRetry?: () => void;
};

function getEntraLoginHref() {
  if (typeof window === "undefined") {
    return "/api/auth/entra/login";
  }

  const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `/api/auth/entra/login?redirect=${encodeURIComponent(redirect)}`;
}

export function UnauthenticatedErrorCard({
  message,
  onRetry,
}: UnauthenticatedErrorCardProps) {
  const isHostedMode = isHostedClientAuthMode();
  const isEntraIdMode = isEntraIdClientAuthMode();
  const shouldRedirect = isHostedMode || isEntraIdMode;
  const signInHref = isEntraIdMode
    ? getEntraLoginHref()
    : typeof window === "undefined"
      ? getSignInHref("/")
      : getSignInHrefForLocation(window.location);

  useEffect(() => {
    if (typeof window === "undefined" || !shouldRedirect) {
      return;
    }

    window.location.replace(signInHref);
  }, [shouldRedirect, signInHref]);

  if (shouldRedirect) {
    return null;
  }

  return (
    <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-xl">
      <div className="card-body gap-4">
        <h2 className="card-title">Authentication required</h2>
        <p className="text-sm text-base-content/70">{message}</p>
        <p className="text-sm text-base-content/70">
          This deployment uses external authentication. Refresh your access
          session, then try again.
        </p>
        {onRetry ? (
          <div className="card-actions justify-end">
            <button className="btn btn-primary btn-sm" onClick={onRetry}>
              Try Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
