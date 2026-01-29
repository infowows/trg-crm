import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/leaflet.css";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Trường Giang CRM - Hệ thống Quản lý Khách hàng",
    description: "Hệ thống CRM toàn diện cho doanh nghiệp",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/images/logo.png", sizes: "32x32", type: "image/png" },
            { url: "/images/logo.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [
            {
                url: "/images/logo.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
