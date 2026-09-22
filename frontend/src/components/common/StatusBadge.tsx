import { Badge } from "@/components/ui/badge";
import type { RoadmapItemStatus } from "@/types/roadmap";

export function StatusBadge({ status }: { status: RoadmapItemStatus | string }) {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "started":
      return <Badge variant="warning">In Progress</Badge>;
    case "skipped":
      return <Badge variant="secondary">Skipped</Badge>;
    case "pending":
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}
