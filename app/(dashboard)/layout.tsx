import Navigation from "../../components/Navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Navigation />
      <main className="flex-1 bg-white overflow-x-hidden overflow-y-auto h-screen lg:pl-70">
        {children}
      </main>
    </div>
  );
}
