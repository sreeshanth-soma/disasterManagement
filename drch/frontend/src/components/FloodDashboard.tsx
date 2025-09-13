"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from "framer-motion";
import { GoogleMap, Polygon, InfoWindow } from '@react-google-maps/api';
import { floodEventApi } from '../services/api';
import type { GeoJSONFeature, FloodEventProperties, GeoJSONPolygon } from '../types';

// Utility function
const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

// Warning Graphic Component
interface WarningGraphicProps {
  width?: number;
  height?: number;
  className?: string;
  enableAnimations?: boolean;
  animationSpeed?: number;
  color?: string;
}

function WarningGraphic({
  width = 354,
  height = 115,
  className,
  enableAnimations = true,
  animationSpeed = 1,
  color = "#FDC221",
}: WarningGraphicProps = {}) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;
  const speedMultiplier = 1 / animationSpeed;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? 0.15 * speedMultiplier : 0,
        delayChildren: shouldAnimate ? 0.1 * speedMultiplier : 0,
      },
    },
  };

  const pathLineVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0.3,
    },
    visible: {
      pathLength: 1,
      opacity: 0.3,
      transition: {
        pathLength: { duration: 1.2 * speedMultiplier, ease: "easeOut" },
        delay: shouldAnimate ? 0.0 : 0,
      },
    },
  };

  const triangleVariants = {
    hidden: {
      opacity: 0,
      pathLength: 0,
    },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        pathLength: { duration: 0.8 * speedMultiplier, ease: "easeOut" },
        opacity: { duration: 0.3 * speedMultiplier },
        delay: shouldAnimate ? 0.6 * speedMultiplier : 0,
      },
    },
  };

  const elementVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      y: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: shouldAnimate ? 2.5 * speedMultiplier : 0,
      },
    },
  };

  const leftStripeVariants = {
    hidden: {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "right center",
    },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay: shouldAnimate ? 1.4 * speedMultiplier : 0,
      },
    },
  };

  const rightStripeVariants = {
    hidden: {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay: shouldAnimate ? 1.4 * speedMultiplier : 0,
      },
    },
  };

  const stripesContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldAnimate ? 0.08 * speedMultiplier : 0,
        delayChildren: shouldAnimate ? 1.4 * speedMultiplier : 0,
      },
    },
  };

  const exclamationVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: [0, 1.3, 1],
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
        scale: {
          times: [0, 0.6, 1],
          duration: 0.6 * speedMultiplier,
        },
        delay: shouldAnimate ? 2.0 * speedMultiplier : 0,
      },
    },
  };

  return (
    <motion.svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width}
      height={height}
      viewBox="0 0 176.958 57.531"
      className={cn("", className)}
      variants={shouldAnimate ? containerVariants : {}}
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.g>
        <motion.rect
          y="25.128"
          width="0.538"
          height="0.538"
          transform="translate(-25.128 25.666) rotate(-90)"
          fill={color}
          variants={elementVariants}
        />
        <motion.rect
          y="22.449"
          width="0.538"
          height="0.538"
          transform="translate(-22.449 22.987) rotate(-90)"
          fill={color}
          variants={elementVariants}
        />
        <motion.rect
          x="176.42"
          y="25.128"
          width="0.538"
          height="0.538"
          transform="translate(151.292 202.086) rotate(-90)"
          fill={color}
          variants={elementVariants}
        />
        <motion.rect
          x="176.42"
          y="22.449"
          width="0.538"
          height="0.538"
          transform="translate(153.971 199.408) rotate(-90)"
          fill={color}
          variants={elementVariants}
        />

        <motion.g variants={containerVariants}>
          <motion.path
            d="M25.949,24.432H5.565a.375.375,0,0,1,0-.75H25.52l8.068-13.7H59.015a.375.375,0,0,1,0,.75h-25Z"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            variants={pathLineVariants}
          />
          <motion.path
            d="M171.393,24.432H151.009l-8.068-13.7h-25a.375.375,0,0,1,0-.75H143.37l8.068,13.7h19.955a.375.375,0,0,1,0,.75Z"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            variants={pathLineVariants}
          />
          <motion.path
            d="M57.3,57.531a.375.375,0,0,1-.321-.182L47.147,41.043H18.507l-7.71-7.71H7.66a.375.375,0,1,1,0-.75h3.448l7.709,7.71H47.571L57.623,56.962a.376.376,0,0,1-.127.515A.382.382,0,0,1,57.3,57.531Z"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            variants={pathLineVariants}
          />
          <motion.path
            d="M119.656,57.531a.376.376,0,0,1-.321-.569l10.052-16.669h28.754l7.709-7.71H169.3a.375.375,0,0,1,0,.75h-3.137l-7.71,7.71h-28.64l-9.833,16.306A.377.377,0,0,1,119.656,57.531Z"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeLinecap="round"
            variants={pathLineVariants}
          />
        </motion.g>

        <motion.path
          d="M93.582,1l26.746,46.327-5.1,8.828H61.737L56.63,47.326,83.377,1h10.2m.577-1H82.8L55.475,47.327l5.685,9.828h54.648l5.675-9.828L94.159,0Z"
          fill={color}
          variants={triangleVariants}
        />

        <motion.g variants={stripesContainerVariants}>
          <motion.polygon
            points="51.838 37.309 61.852 37.309 75.448 13.85 65.434 13.85 51.838 37.309"
            fill={color}
            variants={leftStripeVariants}
          />
          <motion.polygon
            points="37.422 37.309 47.436 37.309 61.033 13.85 51.019 13.85 37.422 37.309"
            fill={color}
            variants={leftStripeVariants}
          />
          <motion.polygon
            points="23.007 37.309 33.021 37.309 46.617 13.85 36.603 13.85 23.007 37.309"
            fill={color}
            variants={leftStripeVariants}
          />

          <motion.polygon
            points="125.121 37.309 115.107 37.309 101.51 13.85 111.524 13.85 125.121 37.309"
            fill={color}
            variants={rightStripeVariants}
          />
          <motion.polygon
            points="139.536 37.309 129.522 37.309 115.926 13.85 125.94 13.85 139.536 37.309"
            fill={color}
            variants={rightStripeVariants}
          />
          <motion.polygon
            points="153.951 37.309 143.937 37.309 130.341 13.85 140.355 13.85 153.951 37.309"
            fill={color}
            variants={rightStripeVariants}
          />
        </motion.g>

        <motion.path
          d="M88.469,38.939a3.158,3.158,0,0,1,2.29.838,3.058,3.058,0,0,1,0,4.269,3.521,3.521,0,0,1-4.56,0,2.827,2.827,0,0,1-.868-2.125,2.858,2.858,0,0,1,.868-2.134A3.11,3.11,0,0,1,88.469,38.939Zm2.339-3.079H86.13l-.662-19.666h6Z"
          fill={color}
          variants={exclamationVariants}
        />
      </motion.g>
    </motion.svg>
  );
}

// Table Components
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-50",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border-gray-300",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
}

// Main Disaster Dashboard Component
interface DisasterData {
  id: string;
  type: "flood" | "earthquake" | "wildfire" | "hurricane" | "tornado";
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedPopulation: number;
  status: "active" | "monitoring" | "resolved";
  reportedAt: string;
  lastUpdate: string;
  evacuationZones?: string[];
  emergencyContacts?: string[];
  confidence?: number;
  source?: string;
}

interface FloodDashboardProps {
  onAlertClick?: (id: string) => void;
  onEvacuationOrder?: (zones: string[]) => void;
  className?: string;
  isLoaded?: boolean;
  loadError?: Error | undefined;
}

// Convert API flood data to DisasterData format
const convertFloodEventToDisasterData = (event: GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>): DisasterData => {
  const getSeverityFromConfidence = (confidence: number): "low" | "medium" | "high" | "critical" => {
    if (confidence >= 0.9) return "critical";
    if (confidence >= 0.7) return "high";
    if (confidence >= 0.5) return "medium";
    return "low";
  };

  const getStatusFromSource = (source: string): "active" | "monitoring" | "resolved" => {
    if (source === 'social_media') return "monitoring";
    return "active";
  };

  return {
    id: event.id.toString(),
    type: "flood",
    location: event.properties.name,
    severity: getSeverityFromConfidence(event.properties.confidence),
    affectedPopulation: Math.floor(Math.random() * 10000) + 1000, // Mock data since not in API
    status: getStatusFromSource(event.properties.source),
    reportedAt: event.properties.detected_at,
    lastUpdate: event.properties.detected_at,
    evacuationZones: event.properties.confidence > 0.8 ? [`Zone ${event.id}A`, `Zone ${event.id}B`] : [],
    emergencyContacts: ["Emergency: 911", "Flood Hotline: 1-800-FLOOD"],
    confidence: event.properties.confidence,
    source: event.properties.source
  };
};

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

function FloodDashboard({
  onAlertClick,
  onEvacuationOrder,
  className,
  isLoaded = false,
  loadError
}: FloodDashboardProps = {}) {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterData | null>(null);
  const [showEvacuationModal, setShowEvacuationModal] = useState(false);
  const [floodEvents, setFloodEvents] = useState<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMapFeature, setSelectedMapFeature] = useState<GeoJSONFeature<FloodEventProperties, GeoJSONPolygon> | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(11);

  // Check if API key is missing (API key comes from App.tsx as props)
  const isApiKeyMissing = !loadError && !isLoaded;

  // Fetch flood data from API
  useEffect(() => {
    const fetchFloodEvents = async () => {
      try {
        const events = await floodEventApi.getAll();
        setFloodEvents(events);
        setError(null);
      } catch (err) {
        setError('Failed to load flood events: ' + (err as Error).message);
        console.error('Flood events fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFloodEvents();
  }, []);

  // Convert API data to component format
  const data = floodEvents.map(convertFloodEventToDisasterData);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-red-600 bg-red-50";
      case "monitoring": return "text-yellow-600 bg-yellow-50";
      case "resolved": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getDisasterIcon = (type: string) => {
    switch (type) {
      case "flood": return "🌊";
      case "earthquake": return "🌍";
      case "wildfire": return "🔥";
      case "hurricane": return "🌀";
      case "tornado": return "🌪️";
      default: return "⚠️";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#dc2626';
    if (confidence >= 0.6) return '#ea580c';
    return '#eab308';
  };

  // Handle incident selection from table
  const handleIncidentSelect = (disaster: DisasterData) => {
    // Find the corresponding flood event
    const floodEvent = floodEvents.find(event => event.id.toString() === disaster.id);
    
    if (floodEvent && floodEvent.geometry && floodEvent.geometry.type === 'Polygon') {
      // Calculate center of polygon for map centering
      const coordinates = floodEvent.geometry.coordinates[0] as [number, number][];
      const centerLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
      const centerLng = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
      
      // Update map center and zoom
      setMapCenter({ lat: centerLat, lng: centerLng });
      setMapZoom(14);
      
      // Set selected features
      setSelectedMapFeature(floodEvent);
      setSelectedDisaster(disaster);
      
      // Scroll to map
      document.getElementById('flood-map-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      // If no map coordinates, just show the details
      setSelectedDisaster(disaster);
      setSelectedMapFeature(null);
    }
  };

  const criticalAlerts = data.filter(d => d.severity === "critical" && d.status === "active");
  const activeDisasters = data.filter(d => d.status === "active");
  const totalAffected = data.reduce((sum, d) => sum + d.affectedPopulation, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flood data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <WarningGraphic width={60} height={20} color="#dc2626" />
          <p className="text-red-600 mt-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 p-6", className)}>
      {/* Header with Warning Graphic */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <WarningGraphic 
              width={120} 
              height={40} 
              color="#dc2626"
              className="flex-shrink-0"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flood Response Dashboard</h1>
              <p className="text-gray-600">Real-time flood monitoring and response coordination</p>
            </div>
          </div>
          
          {criticalAlerts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <WarningGraphic width={24} height={8} color="#dc2626" />
                <span className="font-semibold">{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{activeDisasters.length}</div>
            <div className="text-sm text-gray-600">Active Floods</div>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalAffected.toLocaleString()}</div>
            <div className="text-sm text-gray-600">People Affected</div>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{criticalAlerts.length}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{data.filter(d => d.status === "resolved").length}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div id="flood-map-section" className="mb-8">
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Flood Events Map
              {selectedDisaster && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  → {selectedDisaster.location}
                </span>
              )}
            </h2>
          </div>
          <div className="p-4">
            {isApiKeyMissing || loadError || !isLoaded ? (
              <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h3>
                  {loadError ? (
                    <p className="text-red-600 mb-4">Map loading error: {loadError.message}</p>
                  ) : isApiKeyMissing ? (
                    <p className="text-gray-600 mb-4">Map requires Google Maps API key</p>
                  ) : (
                    <p className="text-gray-600 mb-4">Loading map...</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                    {data.slice(0, 3).map((disaster, index) => (
                      <div key={disaster.id} className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl mb-1">{getDisasterIcon(disaster.type)}</div>
                        <div className="text-xs font-medium text-gray-700">{disaster.location}</div>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getSeverityColor(disaster.severity)}`}>
                          {disaster.severity}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(isApiKeyMissing || (loadError?.message?.includes('billing'))) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mt-4 max-w-md mx-auto">
                      <h4 className="font-semibold text-yellow-800 mb-2">To enable interactive map:</h4>
                      {loadError?.message?.includes('billing') ? (
                        <ol className="text-sm text-yellow-700 space-y-1">
                          <li>1. Go to Google Cloud Console</li>
                          <li>2. Enable billing for your project</li>
                          <li>3. Add a payment method (free tier available)</li>
                          <li>4. Refresh the page</li>
                          <li className="text-xs text-yellow-600 mt-2">Note: Google Maps offers $200/month free credit</li>
                        </ol>
                      ) : (
                        <ol className="text-sm text-yellow-700 space-y-1">
                          <li>1. Get a Google Maps API key from Google Cloud Console</li>
                          <li>2. Create a .env file in the frontend directory</li>
                          <li>3. Add: VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</li>
                          <li>4. Restart the development server</li>
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={mapZoom}
                options={{ 
                  streetViewControl: false, 
                  mapTypeControl: false, 
                  fullscreenControl: false,
                  styles: [
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#193341" }]
                    },
                    {
                      featureType: "landscape",
                      elementType: "geometry",
                      stylers: [{ color: "#2c5a2c" }]
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#5a5a5a" }]
                    },
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    },
                    {
                      featureType: "transit",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                }}
              >
                {/* Render Flood Event Polygons */}
                {floodEvents.map((feature) => {
                  if (feature.geometry && feature.geometry.type === 'Polygon' && Array.isArray(feature.geometry.coordinates[0])) {
                    const polygonCoordinates = feature.geometry.coordinates[0] as [number, number][];
                    const paths = polygonCoordinates.map(coord => ({
                      lat: coord[1],
                      lng: coord[0],
                    }));

                    const isSelected = selectedMapFeature?.id === feature.id;

                    return (
                      <Polygon
                        key={feature.id}
                        paths={paths}
                        options={{
                          strokeColor: isSelected ? '#3b82f6' : getConfidenceColor(feature.properties.confidence),
                          strokeOpacity: isSelected ? 1 : 0.8,
                          strokeWeight: isSelected ? 4 : 3,
                          fillColor: isSelected ? '#3b82f6' : getConfidenceColor(feature.properties.confidence),
                          fillOpacity: isSelected ? 0.6 : 0.4,
                        }}
                        onClick={() => {
                          const disaster = data.find(d => d.id === feature.id.toString());
                          if (disaster) {
                            handleIncidentSelect(disaster);
                          }
                        }}
                      />
                    );
                  }
                  return null;
                })}

                {/* InfoWindow for selected feature */}
                {selectedMapFeature && selectedMapFeature.geometry && selectedMapFeature.geometry.type === 'Polygon' && (
                  <InfoWindow
                    position={{
                      lat: selectedMapFeature.geometry.coordinates[0][0][1],
                      lng: selectedMapFeature.geometry.coordinates[0][0][0],
                    }}
                    onCloseClick={() => setSelectedMapFeature(null)}
                  >
                    <div className="p-3 max-w-xs">
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedMapFeature.properties.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Confidence:</strong> {(selectedMapFeature.properties.confidence * 100).toFixed(1)}%</p>
                        <p><strong>Source:</strong> {selectedMapFeature.properties.source}</p>
                        <p><strong>Detected:</strong> {formatDate(selectedMapFeature.properties.detected_at)}</p>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
        </div>
      </div>

      {/* Selected Incident Details Card */}
      {selectedDisaster && (
        <div className="mb-8">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getDisasterIcon(selectedDisaster.type)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 capitalize">
                      {selectedDisaster.type} Incident
                    </h3>
                    <p className="text-gray-600">{selectedDisaster.location}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedDisaster(null);
                    setSelectedMapFeature(null);
                    setMapCenter(center);
                    setMapZoom(11);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Severity Level</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedDisaster.severity)}`}>
                    {selectedDisaster.severity.toUpperCase()}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Current Status</div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedDisaster.status)}`}>
                    {selectedDisaster.status.toUpperCase()}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Affected Population</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedDisaster.affectedPopulation.toLocaleString()}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Confidence Level</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedDisaster.confidence ? `${(selectedDisaster.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Incident Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">First Reported</div>
                        <div className="text-sm text-gray-600">{formatDate(selectedDisaster.reportedAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Last Updated</div>
                        <div className="text-sm text-gray-600">{formatDate(selectedDisaster.lastUpdate)}</div>
                      </div>
                    </div>
                    {selectedDisaster.source && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Detection Source</div>
                          <div className="text-sm text-gray-600 capitalize">{selectedDisaster.source}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Response Actions</h4>
                  <div className="space-y-3">
                    <button 
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      onClick={() => onAlertClick?.(selectedDisaster.id)}
                    >
                      🚨 Issue Emergency Alert
                    </button>
                    
                    {selectedDisaster.evacuationZones && selectedDisaster.evacuationZones.length > 0 && (
                      <button 
                        className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                        onClick={() => {
                          setShowEvacuationModal(true);
                          onEvacuationOrder?.(selectedDisaster.evacuationZones || []);
                        }}
                      >
                        🏃‍♂️ Coordinate Evacuation
                      </button>
                    )}
                    
                    <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      📊 Generate Report
                    </button>
                    
                    <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      📞 Contact Emergency Services
                    </button>
                  </div>
                </div>
              </div>

              {selectedDisaster.evacuationZones && selectedDisaster.evacuationZones.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Evacuation Zones</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDisaster.evacuationZones.map((zone, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disaster List */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Active Flood Incidents</h2>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((disaster) => {
                  const isSelected = selectedDisaster?.id === disaster.id;
                  return (
                    <TableRow 
                      key={disaster.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleIncidentSelect(disaster)}
                    >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDisasterIcon(disaster.type)}</span>
                        <span className="capitalize">{disaster.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{disaster.location}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(disaster.severity)}>
                        {disaster.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(disaster.status)}>
                        {disaster.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {disaster.confidence ? `${(disaster.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(disaster.lastUpdate)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button 
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAlertClick?.(disaster.id);
                          }}
                        >
                          Alert
                        </button>
                        {disaster.evacuationZones && disaster.evacuationZones.length > 0 && (
                          <button 
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEvacuationModal(true);
                              onEvacuationOrder?.(disaster.evacuationZones || []);
                            }}
                          >
                            Evacuate
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contacts */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Emergency Services</span>
                <span className="font-mono">911</span>
              </div>
              <div className="flex justify-between">
                <span>Flood Hotline</span>
                <span className="font-mono">1-800-FLOOD</span>
              </div>
              <div className="flex justify-between">
                <span>FEMA</span>
                <span className="font-mono">1-800-621-3362</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Issue Emergency Alert
              </button>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                Coordinate Evacuation
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Request Resources
              </button>
            </div>
          </div>

          {/* Weather Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <WarningGraphic width={20} height={7} color="#d97706" />
              <h3 className="font-semibold text-yellow-800">Weather Alert</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Heavy rainfall expected in the next 6 hours. Monitor flood-prone areas closely.
            </p>
          </div>
        </div>
      </div>

      {/* Disaster Detail Modal */}
      {selectedDisaster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getDisasterIcon(selectedDisaster.type)}</span>
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    {selectedDisaster.type} - {selectedDisaster.location}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedDisaster(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Severity</label>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(selectedDisaster.severity)}>
                      {selectedDisaster.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedDisaster.status)}>
                      {selectedDisaster.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence Level</label>
                  <p className="text-lg font-semibold">
                    {selectedDisaster.confidence ? `${(selectedDisaster.confidence * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Source</label>
                  <p className="text-sm capitalize">{selectedDisaster.source}</p>
                </div>
              </div>

              {selectedDisaster.evacuationZones && selectedDisaster.evacuationZones.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600">Evacuation Zones</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDisaster.evacuationZones.map((zone, index) => (
                      <Badge key={index} variant="outline">{zone}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDisaster.emergencyContacts && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-600">Emergency Contacts</label>
                  <div className="mt-2 space-y-1">
                    {selectedDisaster.emergencyContacts.map((contact, index) => (
                      <p key={index} className="text-sm font-mono">{contact}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Issue Alert
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Update Status
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evacuation Modal */}
      {showEvacuationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <WarningGraphic width={30} height={10} color="#dc2626" />
                <h2 className="text-xl font-bold text-gray-900">Evacuation Order</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to issue an evacuation order? This will send alerts to all residents in the affected zones.
              </p>
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => setShowEvacuationModal(false)}
                >
                  Confirm Evacuation
                </button>
                <button 
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => setShowEvacuationModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloodDashboard;
