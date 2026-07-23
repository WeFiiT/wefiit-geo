import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SeoTabs } from "@/client/features/rank-tracking/SeoTabs";

export const Route = createFileRoute("/_project/p/$projectId/rank-tracking")({
  component: RankTrackingLayout,
});

function RankTrackingLayout() {
  const { projectId } = Route.useParams();

  return (
    <div className="px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Suivi des positions SEO</h1>
        </div>

        <SeoTabs projectId={projectId} />

        <Outlet />
      </div>
    </div>
  );
}
