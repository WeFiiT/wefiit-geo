import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_project/p/$projectId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/p/$projectId/geo",
      params: { projectId: params.projectId },
    });
  },
});
