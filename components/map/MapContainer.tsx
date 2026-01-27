"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, RefreshCw } from "lucide-react";

// Dynamic import for Leaflet to avoid SSR issues
const LeafletMap = dynamic(
    () =>
        import("react-leaflet").then((mod) => {
            const {
                MapContainer: LeafletMapContainer,
                TileLayer,
                useMap,
                useMapEvents,
            } = mod;
            const L = require("leaflet");

            // Fix Leaflet's default icon
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });

            // Component to handle map events and expose map instance
            const MapEventHandler = ({ onBoundsChanged, setMapRef }: any) => {
                const map = useMap();

                useEffect(() => {
                    if (setMapRef) {
                        setMapRef(map);
                    }
                }, [map, setMapRef]);

                useMapEvents({
                    moveend: () => {
                        if (onBoundsChanged) {
                            const bounds = map.getBounds();
                            onBoundsChanged(bounds);
                        }
                    },
                    zoomend: () => {
                        if (onBoundsChanged) {
                            const bounds = map.getBounds();
                            onBoundsChanged(bounds);
                        }
                    },
                });

                return null;
            };

            // Component to update map view when center changes
            const MapViewController = ({ center }: any) => {
                const map = useMap();

                useEffect(() => {
                    if (center) {
                        map.setView([center.lat, center.lng], map.getZoom());
                    }
                }, [center, map]);

                return null;
            };

            return function MapContainerComponent({
                customers,
                viewMode,
                selectedCustomer,
                onMarkerClick,
                onViewDetail,
                onBoundsChanged,
                setMapRef,
                center,
                loading,
            }: any) {
                const [mapReady, setMapReady] = useState(false);

                useEffect(() => {
                    setMapReady(true);
                }, []);

                if (!mapReady) {
                    return (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    );
                }

                return (
                    <LeafletMapContainer
                        center={[center.lat, center.lng]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapEventHandler
                            onBoundsChanged={onBoundsChanged}
                            setMapRef={setMapRef}
                        />
                        <MapViewController center={center} />

                        {/* Markers will be added here */}
                        {customers.map((customer: any) => {
                            const lat = parseFloat(customer.lat.toString());
                            const lng = parseFloat(customer.lng.toString());

                            if (isNaN(lat) || isNaN(lng)) return null;

                            const markerColor = getMarkerColor(customer);

                            const customIcon = L.divIcon({
                                className: "custom-marker-icon",
                                html: `
                                <div style="
                                    background-color: ${markerColor};
                                    width: 24px;
                                    height: 24px;
                                    border-radius: 50% 50% 50% 0;
                                    transform: rotate(-45deg);
                                    border: 2px solid white;
                                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                                ">
                                    <div style="
                                        width: 8px;
                                        height: 8px;
                                        background-color: white;
                                        border-radius: 50%;
                                        position: absolute;
                                        top: 50%;
                                        left: 50%;
                                        transform: translate(-50%, -50%);
                                    "></div>
                                </div>
                            `,
                                iconSize: [24, 24],
                                iconAnchor: [12, 24],
                                popupAnchor: [0, -24],
                            });

                            return (
                                <L.Marker
                                    key={customer._id}
                                    position={[lat, lng]}
                                    icon={customIcon}
                                    eventHandlers={{
                                        click: () => onMarkerClick(customer),
                                    }}
                                >
                                    <L.Popup>
                                        <div
                                            className="p-2"
                                            style={{
                                                minWidth: "280px",
                                                maxWidth: "320px",
                                            }}
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <h3
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontSize: "16px",
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        {customer.fullName}
                                                    </h3>
                                                    {customer.companyName && (
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color: "#6b7280",
                                                            }}
                                                        >
                                                            {
                                                                customer.companyName
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    marginBottom: "12px",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {customer.address && (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "8px",
                                                            marginBottom: "8px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                color: "#f59e0b",
                                                            }}
                                                        >
                                                            📍
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: "#374151",
                                                                lineHeight:
                                                                    "1.4",
                                                            }}
                                                        >
                                                            {customer.address}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "16px",
                                                    }}
                                                >
                                                    {customer.potentialLevel && (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "4px",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: "#f59e0b",
                                                                }}
                                                            >
                                                                ⭐
                                                            </span>
                                                            <span
                                                                style={{
                                                                    color: "#374151",
                                                                }}
                                                            >
                                                                {
                                                                    customer.potentialLevel
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    <span
                                                        style={{
                                                            padding: "2px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "12px",
                                                            fontWeight: "500",
                                                            backgroundColor:
                                                                customer.status ===
                                                                "customer"
                                                                    ? "#10b981"
                                                                    : "#f59e0b",
                                                            color: "white",
                                                        }}
                                                    >
                                                        {customer.status ===
                                                        "customer"
                                                            ? "Khách hàng"
                                                            : "Tiềm năng"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        onViewDetail(customer)
                                                    }
                                                    style={{
                                                        padding: "6px 12px",
                                                        backgroundColor:
                                                            "#3b82f6",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </L.Popup>
                                </L.Marker>
                            );
                        })}
                    </LeafletMapContainer>
                );
            };
        }),
    { ssr: false },
);

// Helper function to get marker color based on customer status
function getMarkerColor(customer: any) {
    if (customer.status === "customer") {
        return "#10b981"; // green-500
    }
    if (customer.potentialLevel && customer.potentialLevel.length >= 4) {
        return "#f59e0b"; // amber-500
    }
    return "#6b7280"; // gray-500
}

interface Customer {
    _id: string;
    fullName: string;
    companyName?: string;
    address?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    source?: string;
    potentialLevel?: string;
    salesPerson?: string;
    status?: string;
    createdAt: string;
    updatedAt: string;
}

interface MapContainerProps {
    customers: Customer[];
    viewMode: "cluster" | "heatmap";
    selectedCustomer: Customer | null;
    onMarkerClick: (customer: Customer) => void;
    onViewDetail: (customer: Customer) => void;
    onBoundsChanged: (bounds: any) => void;
    setMapRef: (ref: any) => void;
    center: { lat: number; lng: number };
    loading: boolean;
}

const MapContainer = (props: MapContainerProps) => {
    return (
        <div className="w-full h-full relative">
            {props.loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            <LeafletMap {...props} />
        </div>
    );
};

export default MapContainer;
