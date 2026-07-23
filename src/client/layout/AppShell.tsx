import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import {
  AppContent,
  MissingSeoSetupModal,
  SeoApiStatusBanners,
} from "@/client/layout/AppShellParts";
import { getProjectNavGroups } from "@/client/navigation/items";
import { getSeoApiKeyStatus } from "@/serverFunctions/config";
import { getOrCreateDefaultProject } from "@/serverFunctions/projects";

const DATAFORSEO_HELP_PATH = "/help/dataforseo-api-key";

function WeFiiTFavicon() {
  return (
    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-[#0a3ba8] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
      <img
        src="/favicon.svg"
        alt="WeFiiT"
        className="h-full w-full object-contain"
      />
    </span>
  );
}

function BrandName() {
  return (
    <span className="text-[15.5px] font-semibold tracking-[-0.1px] text-base-content">
      Dashboard GEO
      <span className="text-[1.4em] font-extrabold text-accent">.</span>
    </span>
  );
}
export function AuthenticatedAppLayout({
  children,
  projectId,
  banner,
}: {
  children: React.ReactNode;
  projectId?: string;
  banner?: React.ReactNode;
}) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const setupModalRef = React.useRef<HTMLDivElement | null>(null);
  const [showMissingSeoApiKeyModal, setShowMissingSeoApiKeyModal] =
    React.useState(false);
  const defaultProjectQuery = useQuery({
    queryKey: ["defaultProject"],
    queryFn: () => getOrCreateDefaultProject(),
    enabled: !projectId,
  });
  const headerProjectId = projectId ?? defaultProjectQuery.data?.id ?? null;
  const shouldCheckSeoApiKeyStatus = true;
  const seoApiKeyStatusQuery = useQuery({
    queryKey: ["seoApiKeyStatus"],
    queryFn: () => getSeoApiKeyStatus(),
    enabled: shouldCheckSeoApiKeyStatus,
  });
  const isSeoApiKeyConfigured = shouldCheckSeoApiKeyStatus
    ? (seoApiKeyStatusQuery.data?.configured ?? null)
    : null;
  const seoApiKeyStatusError =
    shouldCheckSeoApiKeyStatus && seoApiKeyStatusQuery.isError;

  React.useEffect(() => {
    if (!shouldCheckSeoApiKeyStatus) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }

    if (seoApiKeyStatusQuery.isError) {
      setShowMissingSeoApiKeyModal(false);
      return;
    }

    if (!seoApiKeyStatusQuery.isSuccess) return;
    setShowMissingSeoApiKeyModal(!seoApiKeyStatusQuery.data.configured);
  }, [
    location.pathname,
    seoApiKeyStatusQuery.data,
    seoApiKeyStatusQuery.isError,
    seoApiKeyStatusQuery.isSuccess,
    shouldCheckSeoApiKeyStatus,
  ]);

  const shouldShowMissingSeoApiKeyModal =
    showMissingSeoApiKeyModal && location.pathname !== DATAFORSEO_HELP_PATH;

  const shouldShowSeoApiWarning =
    !seoApiKeyStatusError &&
    isSeoApiKeyConfigured === false &&
    !shouldShowMissingSeoApiKeyModal;

  React.useEffect(() => {
    if (!shouldShowMissingSeoApiKeyModal) return;

    setupModalRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMissingSeoApiKeyModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldShowMissingSeoApiKeyModal]);

  React.useEffect(() => {
    if (!projectId) {
      setDrawerOpen(false);
    }
  }, [projectId]);

  return (
    <div className="flex h-[100dvh] flex-col bg-base-200">
      <TopNav
        drawerOpen={drawerOpen}
        projectId={headerProjectId}
        pathname={location.pathname}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <SeoApiStatusBanners
        shouldShowSeoApiWarning={shouldShowSeoApiWarning}
        seoApiKeyStatusError={seoApiKeyStatusError}
      />

      {banner}

      <AppContent
        drawerOpen={drawerOpen}
        projectId={headerProjectId}
        onCloseDrawer={() => setDrawerOpen(false)}
      >
        {children}
      </AppContent>

      <MissingSeoSetupModal
        ref={setupModalRef}
        isOpen={shouldShowMissingSeoApiKeyModal}
        onClose={() => setShowMissingSeoApiKeyModal(false)}
      />
    </div>
  );
}

function TopNav({
  drawerOpen,
  projectId,
  pathname,
  onOpenDrawer,
}: {
  drawerOpen: boolean;
  projectId: string | null;
  pathname: string;
  onOpenDrawer: () => void;
}) {
  const navGroups = projectId ? getProjectNavGroups(projectId) : [];

  return (
    <div className="navbar shrink-0 border-b border-base-300 bg-base-100 px-0">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 md:px-6">
        <div className="flex flex-none items-center md:hidden">
          {projectId ? (
            <button
              type="button"
              className="btn btn-square btn-ghost"
              aria-label="Toggle sidebar"
              aria-expanded={drawerOpen}
              onClick={onOpenDrawer}
            >
              <Menu className="h-6 w-6" />
            </button>
          ) : null}
          <Link to="/" className="ml-1 flex items-center gap-2">
            <WeFiiTFavicon />
            <BrandName />
          </Link>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <WeFiiTFavicon />
            <BrandName />
          </Link>
          <nav className="flex items-center gap-1" aria-label="Sections">
            {projectId
              ? navGroups.map((entry) => {
                  const { icon: Icon, matchSegment, ...linkProps } =
                    entry.item;
                  const isActive = pathname.includes(matchSegment);
                  return (
                    <Link
                      key={linkProps.to}
                      {...linkProps}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold transition-colors ${
                        isActive
                          ? "bg-base-200 text-primary"
                          : "text-base-content/60 hover:bg-base-200/60 hover:text-primary"
                      }`}
                    >
                      <Icon className="h-[15px] w-[15px]" />
                      {entry.item.label}
                    </Link>
                  );
                })
              : null}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="hidden items-center gap-3.5 md:flex">
          <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-base-content/60">
            <span className="h-[7px] w-[7px] rounded-full bg-success shadow-[0_0_0_3px_oklch(93%_0.05_145)]" />
            Connecté à DataForSEO
          </span>
        </div>
      </div>
    </div>
  );
}
