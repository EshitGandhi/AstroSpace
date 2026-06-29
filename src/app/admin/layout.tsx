import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | AstroGuru",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream min-h-screen">
      <AdminSidebar />
      <div className="lg:ml-[300px] pt-16 lg:pt-0 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto pt-6">{children}</div>
      </div>
    </div>
  );
}
