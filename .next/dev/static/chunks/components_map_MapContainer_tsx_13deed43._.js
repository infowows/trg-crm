(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/map/MapContainer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
"use client";
;
;
;
// Dynamic import for Leaflet to avoid SSR issues
const LeafletMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/react-leaflet/lib/index.js [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>{
        var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
        const { MapContainer: LeafletMapContainer, TileLayer, useMap, useMapEvents } = mod;
        const L = __turbopack_context__.r("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
        // Fix Leaflet's default icon
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
        });
        // Component to handle map events and expose map instance
        const MapEventHandler = ({ onBoundsChanged, setMapRef })=>{
            _s();
            const map = useMap();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
                "LeafletMap.MapEventHandler.useEffect": ()=>{
                    if (setMapRef) {
                        setMapRef(map);
                    }
                }
            }["LeafletMap.MapEventHandler.useEffect"], [
                map,
                setMapRef
            ]);
            useMapEvents({
                moveend: {
                    "LeafletMap.MapEventHandler.useMapEvents": ()=>{
                        if (onBoundsChanged) {
                            const bounds = map.getBounds();
                            onBoundsChanged(bounds);
                        }
                    }
                }["LeafletMap.MapEventHandler.useMapEvents"],
                zoomend: {
                    "LeafletMap.MapEventHandler.useMapEvents": ()=>{
                        if (onBoundsChanged) {
                            const bounds = map.getBounds();
                            onBoundsChanged(bounds);
                        }
                    }
                }["LeafletMap.MapEventHandler.useMapEvents"]
            });
            return null;
        };
        _s(MapEventHandler, "kQTt6vzY2Jn6gUUc/39gLxylGYk=", false, function() {
            return [
                useMap,
                useMapEvents
            ];
        });
        // Component to update map view when center changes
        const MapViewController = ({ center })=>{
            _s1();
            const map = useMap();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
                "LeafletMap.MapViewController.useEffect": ()=>{
                    if (center) {
                        map.setView([
                            center.lat,
                            center.lng
                        ], map.getZoom());
                    }
                }
            }["LeafletMap.MapViewController.useEffect"], [
                center,
                map
            ]);
            return null;
        };
        _s1(MapViewController, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
            return [
                useMap
            ];
        });
        return _s2(function MapContainerComponent({ customers, viewMode, selectedCustomer, onMarkerClick, onViewDetail, onBoundsChanged, setMapRef, center, loading }) {
            _s2();
            const [mapReady, setMapReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
                "LeafletMap.MapContainerComponent.useEffect": ()=>{
                    setMapReady(true);
                }
            }["LeafletMap.MapContainerComponent.useEffect"], []);
            if (!mapReady) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapContainer.tsx",
                        lineNumber: 91,
                        columnNumber: 29
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/map/MapContainer.tsx",
                    lineNumber: 90,
                    columnNumber: 25
                }, this);
            }
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LeafletMapContainer, {
                center: [
                    center.lat,
                    center.lng
                ],
                zoom: 12,
                style: {
                    height: "100%",
                    width: "100%"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TileLayer, {
                        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapContainer.tsx",
                        lineNumber: 102,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapEventHandler, {
                        onBoundsChanged: onBoundsChanged,
                        setMapRef: setMapRef
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapContainer.tsx",
                        lineNumber: 106,
                        columnNumber: 25
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapViewController, {
                        center: center
                    }, void 0, false, {
                        fileName: "[project]/components/map/MapContainer.tsx",
                        lineNumber: 110,
                        columnNumber: 25
                    }, this),
                    customers.map((customer)=>{
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
                            iconSize: [
                                24,
                                24
                            ],
                            iconAnchor: [
                                12,
                                24
                            ],
                            popupAnchor: [
                                0,
                                -24
                            ]
                        });
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(L.Marker, {
                            position: [
                                lat,
                                lng
                            ],
                            icon: customIcon,
                            eventHandlers: {
                                click: ()=>onMarkerClick(customer)
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(L.Popup, {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2",
                                    style: {
                                        minWidth: "280px",
                                        maxWidth: "320px"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start gap-3 mb-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1,
                                                    minWidth: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        style: {
                                                            fontWeight: "bold",
                                                            fontSize: "16px",
                                                            color: "#111827"
                                                        },
                                                        children: customer.fullName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/MapContainer.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 53
                                                    }, this),
                                                    customer.companyName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            fontSize: "12px",
                                                            color: "#6b7280"
                                                        },
                                                        children: customer.companyName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/map/MapContainer.tsx",
                                                        lineNumber: 184,
                                                        columnNumber: 57
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/map/MapContainer.tsx",
                                                lineNumber: 168,
                                                columnNumber: 49
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapContainer.tsx",
                                            lineNumber: 167,
                                            columnNumber: 45
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginBottom: "12px",
                                                fontSize: "12px"
                                            },
                                            children: [
                                                customer.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        gap: "8px",
                                                        marginBottom: "8px"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: "#f59e0b"
                                                            },
                                                            children: "📍"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/MapContainer.tsx",
                                                            lineNumber: 212,
                                                            columnNumber: 57
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: "#374151",
                                                                lineHeight: "1.4"
                                                            },
                                                            children: customer.address
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/MapContainer.tsx",
                                                            lineNumber: 219,
                                                            columnNumber: 57
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/map/MapContainer.tsx",
                                                    lineNumber: 205,
                                                    columnNumber: 53
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "16px"
                                                    },
                                                    children: [
                                                        customer.potentialLevel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "4px"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: "#f59e0b"
                                                                    },
                                                                    children: "⭐"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/map/MapContainer.tsx",
                                                                    lineNumber: 246,
                                                                    columnNumber: 61
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: "#374151"
                                                                    },
                                                                    children: customer.potentialLevel
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/map/MapContainer.tsx",
                                                                    lineNumber: 253,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/map/MapContainer.tsx",
                                                            lineNumber: 238,
                                                            columnNumber: 57
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                padding: "2px 8px",
                                                                borderRadius: "4px",
                                                                fontSize: "12px",
                                                                fontWeight: "500",
                                                                backgroundColor: customer.status === "customer" ? "#10b981" : "#f59e0b",
                                                                color: "white"
                                                            },
                                                            children: customer.status === "customer" ? "Khách hàng" : "Tiềm năng"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/map/MapContainer.tsx",
                                                            lineNumber: 264,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/map/MapContainer.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 49
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/map/MapContainer.tsx",
                                            lineNumber: 198,
                                            columnNumber: 45
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: "flex",
                                                gap: "8px"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onViewDetail(customer),
                                                style: {
                                                    padding: "6px 12px",
                                                    backgroundColor: "#3b82f6",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    fontSize: "12px",
                                                    cursor: "pointer"
                                                },
                                                children: "Xem chi tiết"
                                            }, void 0, false, {
                                                fileName: "[project]/components/map/MapContainer.tsx",
                                                lineNumber: 291,
                                                columnNumber: 49
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/map/MapContainer.tsx",
                                            lineNumber: 285,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/map/MapContainer.tsx",
                                    lineNumber: 160,
                                    columnNumber: 41
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/map/MapContainer.tsx",
                                lineNumber: 159,
                                columnNumber: 37
                            }, this)
                        }, customer._id, false, {
                            fileName: "[project]/components/map/MapContainer.tsx",
                            lineNumber: 151,
                            columnNumber: 33
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/components/map/MapContainer.tsx",
                lineNumber: 97,
                columnNumber: 21
            }, this);
        }, "Yl0xENVp12q5vO0p3XYBiR60A88=");
    }), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/react-leaflet/lib/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
});
_c = LeafletMap;
// Helper function to get marker color based on customer status
function getMarkerColor(customer) {
    if (customer.status === "customer") {
        return "#10b981"; // green-500
    }
    if (customer.potentialLevel && customer.potentialLevel.length >= 4) {
        return "#f59e0b"; // amber-500
    }
    return "#6b7280"; // gray-500
}
const MapContainer = (props)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full relative",
        children: [
            props.loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                }, void 0, false, {
                    fileName: "[project]/components/map/MapContainer.tsx",
                    lineNumber: 366,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/map/MapContainer.tsx",
                lineNumber: 365,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LeafletMap, {
                ...props
            }, void 0, false, {
                fileName: "[project]/components/map/MapContainer.tsx",
                lineNumber: 369,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/map/MapContainer.tsx",
        lineNumber: 363,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c1 = MapContainer;
const __TURBOPACK__default__export__ = MapContainer;
var _c, _c1;
__turbopack_context__.k.register(_c, "LeafletMap");
__turbopack_context__.k.register(_c1, "MapContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/map/MapContainer.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/map/MapContainer.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_map_MapContainer_tsx_13deed43._.js.map