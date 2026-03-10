import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type Coordinates = {
  lat: number;
  lon: number;
};

type RiderMapProps = {
  currentLocation: Coordinates | null;
  pickup: Coordinates | null;
  dropoff: Coordinates | null;
  onRouteDistanceChange?: (distanceKm: number | null) => void;
};

const INDIA_DEFAULT_CENTER: [number, number] = [28.6139, 77.209];
const OSRM_ROUTE_BASE_URL =
  import.meta.env.VITE_OSRM_ROUTE_BASE_URL?.trim() || "https://router.project-osrm.org/route/v1/driving";
const ROUTE_PROVIDER_BASE_URLS = Array.from(
  new Set([
    OSRM_ROUTE_BASE_URL,
    "https://router.project-osrm.org/route/v1/driving",
    "https://routing.openstreetmap.de/routed-car/route/v1/driving",
  ])
);

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const currentLocationIcon = L.divIcon({
  className: "current-location-marker",
  html: `
    <div class="current-location-marker__container">
      <span class="current-location-marker__pulse"></span>
      <span class="current-location-marker__dot"></span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destinationLocationIcon = L.divIcon({
  className: "destination-location-marker",
  html: `
    <div class="destination-location-marker__container">
      <span class="destination-location-marker__pulse"></span>
      <span class="destination-location-marker__dot"></span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

type OsrmRoutePayload = {
  code?: string;
  routes?: Array<{
    distance: number;
    geometry?: {
      coordinates: Array<[number, number]>;
    };
  }>;
};

const getRoadRoute = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  signal: AbortSignal
): Promise<{
  path: [number, number][];
  distanceKm: number;
}> => {
  for (const baseUrl of ROUTE_PROVIDER_BASE_URLS) {
    const routeUrl = `${baseUrl}/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson&alternatives=false&steps=false`;
    const response = await fetch(routeUrl, { signal });
    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as OsrmRoutePayload;
    const route = payload.routes?.[0];
    if (!route || payload.code !== "Ok") {
      continue;
    }

    const coordinates = route.geometry?.coordinates ?? [];
    if (coordinates.length < 2) {
      continue;
    }

    return {
      path: coordinates.map(([lon, lat]) => [lat, lon] as [number, number]),
      distanceKm: Number((route.distance / 1000).toFixed(2)),
    };
  }

  throw new Error("No road route available from configured providers");
};

const FitMapView = ({
  center,
  pickup,
  dropoff,
  routePath,
}: {
  center: [number, number];
  pickup: Coordinates | null;
  dropoff: Coordinates | null;
  routePath: [number, number][] | null;
}) => {
  const map = useMap();

  useEffect(() => {
    const routePoints =
      routePath && routePath.length > 1
        ? routePath
        : [
            pickup ? ([pickup.lat, pickup.lon] as [number, number]) : null,
            dropoff ? ([dropoff.lat, dropoff.lon] as [number, number]) : null,
          ].filter(Boolean);

    if (routePoints.length > 1) {
      map.fitBounds(routePoints as [number, number][], { padding: [40, 40], maxZoom: 15 });
      return;
    }

    map.setView(center, pickup || dropoff ? 14 : 12, { animate: true });
  }, [center, dropoff, map, pickup, routePath]);

  return null;
};

const RiderMap = ({ currentLocation, pickup, dropoff, onRouteDistanceChange }: RiderMapProps) => {
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null);

  const center = useMemo<[number, number]>(() => {
    if (pickup) return [pickup.lat, pickup.lon];
    if (currentLocation) return [currentLocation.lat, currentLocation.lon];
    return INDIA_DEFAULT_CENTER;
  }, [currentLocation, pickup]);

  useEffect(() => {
    if (!(pickup && dropoff)) {
      setRoutePath(null);
      onRouteDistanceChange?.(null);
      return;
    }

    const controller = new AbortController();
    const fetchRoute = async () => {
      try {
        const route = await getRoadRoute(pickup, dropoff, controller.signal);
        setRoutePath(route.path);
        onRouteDistanceChange?.(route.distanceKm);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        const straightDistance = haversineDistanceKm(
          pickup.lat,
          pickup.lon,
          dropoff.lat,
          dropoff.lon
        );
        setRoutePath([
          [pickup.lat, pickup.lon],
          [dropoff.lat, dropoff.lon],
        ]);
        onRouteDistanceChange?.(Number(straightDistance.toFixed(2)));
      }
    };

    fetchRoute();

    return () => controller.abort();
  }, [dropoff, onRouteDistanceChange, pickup]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl={false}
      zoomControl={false}
    >
      <FitMapView center={center} pickup={pickup} dropoff={dropoff} routePath={routePath} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {currentLocation && (
        <>
          <Circle
            center={[currentLocation.lat, currentLocation.lon]}
            radius={75}
            pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.12, weight: 1 }}
          />
          <Marker position={[currentLocation.lat, currentLocation.lon]} icon={currentLocationIcon}>
            <Popup>You are here</Popup>
          </Marker>
        </>
      )}

      {pickup && (
        <Marker position={[pickup.lat, pickup.lon]}>
          <Popup>Pickup</Popup>
        </Marker>
      )}

      {dropoff && (
        <Marker position={[dropoff.lat, dropoff.lon]} icon={destinationLocationIcon}>
          <Popup>Dropoff</Popup>
        </Marker>
      )}

      {pickup && dropoff && routePath && (
        <Polyline positions={routePath} pathOptions={{ color: "#10b981", weight: 4, opacity: 0.7 }} />
      )}
    </MapContainer>
  );
};

export default RiderMap;
