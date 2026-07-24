import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageTitle } from "@/client/components/PageTitle";
import { SeoTabs } from "@/client/features/rank-tracking/SeoTabs";

export const Route = createFileRoute("/_project/p/$projectId/rank-tracking")({
  component: RankTrackingLayout,
});

function RankTrackingLayout() {
  const { projectId } = Route.useParams();

  return (
    <div className="py-4 pb-24 overflow-auto md:py-6 md:pb-8">
      <div className="wefiit-pad-x mx-auto max-w-7xl space-y-4">
        <div>
          <PageTitle>Suivi des positions SEO</PageTitle>
        </div>

        <SeoTabs projectId={projectId} />

        <Outlet />
      </div>
    </div>
  );
}
