import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || !url.includes("maps.app.goo.gl")) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        console.log("Resolving short URL:", url);

        // Fetch the short URL with redirect handling
        const response = await fetch(url, {
            method: "HEAD",
            redirect: "manual", // Don't follow redirects automatically
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        // Get the final URL from Location header
        const finalUrl =
            response.headers.get("location") ||
            response.headers.get("Location");

        // Sau khi có finalUrl
        if (finalUrl) {
            // 1. Thử tìm tọa độ chính xác trong tham số !3d và !4d
            const preciseMatch = finalUrl.match(/!3d([-.\d]+)!4d([-.\d]+)/);

            // 2. Nếu không có, mới lấy tọa độ sau dấu @
            const approximateMatch = finalUrl.match(/@([-.\d]+),([-.\d]+)/);

            let lat, lng;

            if (preciseMatch) {
                lat = preciseMatch[1];
                lng = preciseMatch[2];
                console.log("Tọa độ chính xác từ Hex Params:", lat, lng);
            } else if (approximateMatch) {
                lat = approximateMatch[1];
                lng = approximateMatch[2];
                console.log("Tọa độ xấp xỉ từ @:", lat, lng);
            }

            return NextResponse.json({
                finalUrl,
                coordinates: lat && lng ? { lat, lng } : null,
            });
        } else {
            // If HEAD doesn't work, try GET and extract from response
            console.log("HEAD failed, trying GET method...");
            const getResponse = await fetch(url, {
                method: "GET",
                redirect: "manual",
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
            });

            const getFinalUrl =
                getResponse.headers.get("location") ||
                getResponse.headers.get("Location");

            if (getFinalUrl) {
                console.log("GET redirected to:", getFinalUrl);
                return NextResponse.json({ finalUrl: getFinalUrl });
            }

            // If still no redirect, try to extract from response body
            const text = await getResponse.text();
            const urlMatch = text.match(/https:\/\/maps\.google\.com[^"'\s]+/);

            if (urlMatch) {
                console.log("Extracted URL from body:", urlMatch[0]);
                return NextResponse.json({ finalUrl: urlMatch[0] });
            }
        }

        return NextResponse.json(
            { error: "Could not resolve URL" },
            { status: 400 },
        );
    } catch (error) {
        console.error("Error resolving URL:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
