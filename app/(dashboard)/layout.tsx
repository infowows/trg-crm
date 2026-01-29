import Navigation from "../components/Navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="flex-1 bg-white overflow-x-hidden min-h-screen lg:pl-64">
                {children}
            </main>
        </div>
    );
}
