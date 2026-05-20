import { createFileRoute } from "@tanstack/react-router";
import { GeoPage } from "@/client/features/geo/GeoPage";

export const Route = createFileRoute("/_project/p/$projectId/geo")({
  component: GeoRoute,
});

function GeoRoute() {
  const { projectId } = Route.useParams();
  return <GeoPage projectId={projectId} />;
}
