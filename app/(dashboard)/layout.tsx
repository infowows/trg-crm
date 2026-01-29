import Navigation from "../components/Navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Navigation />
            <main className="flex-1 bg-white">{children}</main>
        </div>
    );
}
