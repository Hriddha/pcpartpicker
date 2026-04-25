import { DashboardLayout } from "@/components/dashboard-layout";
import { PCBuilder } from "@/components/pc-builder";
export const dynamic = 'force-dynamic'

export default function BuilderPage() {
  return (
    <DashboardLayout>
      <PCBuilder />
    </DashboardLayout>
  );
}
