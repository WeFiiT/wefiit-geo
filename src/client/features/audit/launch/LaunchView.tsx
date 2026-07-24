import { AuditHistorySection } from "@/client/features/audit/launch/AuditHistorySection";
import { LaunchFormCard } from "@/client/features/audit/launch/LaunchFormCard";
import { useLaunchController } from "@/client/features/audit/launch/useLaunchController";
import { PageTitle } from "@/client/components/PageTitle";

export function LaunchView({
  projectId,
  onAuditStarted,
}: {
  projectId: string;
  onAuditStarted: (auditId: string) => void;
}) {
  const controller = useLaunchController({ projectId, onAuditStarted });

  return (
    <div className="py-4 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="wefiit-pad-x mx-auto max-w-5xl space-y-4">
        <PageTitle>Site Audit</PageTitle>

        <LaunchFormCard
          launchForm={controller.launchForm}
          commitMaxPagesInput={controller.commitMaxPagesInput}
        />

        <AuditHistorySection
          projectId={projectId}
          history={controller.historyQuery.data ?? []}
          isLoading={controller.historyQuery.isLoading}
          onDelete={controller.deleteAudit}
        />
      </div>
    </div>
  );
}
