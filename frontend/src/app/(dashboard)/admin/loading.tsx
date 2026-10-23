import { DashboardContentSkeleton } from "@/features/dashboard/components/Dashboard.skeleton";

const AdminLoading = () => (
  <DashboardContentSkeleton stats={6} statColumns={3} footerCard />
);

export default AdminLoading;
