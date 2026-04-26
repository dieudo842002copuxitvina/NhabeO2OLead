"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { DealerWithDistance } from "./page";

type DaiLyMapProps = {
  dealers: DealerWithDistance[];
  selectedDealerId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onSelectDealer: (dealerId: string) => void;
};

function createDealerIcon(active: boolean, isOpen: boolean) {
  const coreColor = isOpen ? "#4CAF50" : "#9CA3AF";
  const ringColor = isOpen ? "rgba(76,175,80,0.2)" : "rgba(156,163,175,0.22)";
  const outerSize = active ? 46 : 38;
  const innerSize = active ? 34 : 28;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${outerSize}px;
        height:${outerSize}px;
        border-radius:9999px;
        background:${ringColor};
        display:flex;
        align-items:center;
        justify-content:center;
        transform:${active ? "translateY(-6px)" : "translateY(0px)"};
        transition:all 180ms ease;
      ">
        <div style="
          width:${innerSize}px;
          height:${innerSize}px;
          border-radius:9999px;
          background:${coreColor};
          border:3px solid #FFFFFF;
          box-shadow:0 10px 20px rgba(17,24,39,0.22);
        "></div>
      </div>
    `,
    iconSize: [outerSize, outerSize],
    iconAnchor: [outerSize / 2, outerSize - 2],
  });
}

function createClusterIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:9999px;
        background:#4CAF50;
        border:3px solid #FFFFFF;
        box-shadow:0 10px 20px rgba(17,24,39,0.2);
        color:#FFFFFF;
        font-weight:800;
        font-size:13px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Arial, sans-serif;
      ">${count}</div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:22px;
      height:22px;
      border-radius:9999px;
      background:#2563EB;
      border:4px solid #FFFFFF;
      box-shadow:0 0 0 7px rgba(37,99,235,0.2), 0 10px 18px rgba(17,24,39,0.2);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function DealerClusterLayer({
  dealers,
  selectedDealerId,
  onSelectDealer,
}: {
  dealers: DealerWithDistance[];
  selectedDealerId: string | null;
  onSelectDealer: (dealerId: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 12,
      iconCreateFunction: (cluster) => createClusterIcon(cluster.getChildCount()),
    });

    dealers.forEach((dealer) => {
      const marker = L.marker([dealer.lat, dealer.lng], {
        icon: createDealerIcon(selectedDealerId === dealer.id, dealer.status === "Mở cửa"),
      });
      marker.on("click", () => onSelectDealer(dealer.id));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      clusterGroup.clearLayers();
      map.removeLayer(clusterGroup);
    };
  }, [dealers, map, onSelectDealer, selectedDealerId]);

  return null;
}

function MapFocus({
  dealers,
  selectedDealerId,
  userLocation,
}: {
  dealers: DealerWithDistance[];
  selectedDealerId: string | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    const selected = dealers.find((dealer) => dealer.id === selectedDealerId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 12, { duration: 0.75 });
      return;
    }

    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 0.8 });
      return;
    }

    if (dealers.length > 0) {
      const bounds = L.latLngBounds(
        dealers.map((dealer) => [dealer.lat, dealer.lng] as [number, number]),
      );
      map.fitBounds(bounds.pad(0.25), { maxZoom: 8 });
    }
  }, [dealers, map, selectedDealerId, userLocation]);

  return null;
}

export default function DaiLyMap({
  dealers,
  selectedDealerId,
  userLocation,
  onSelectDealer,
}: DaiLyMapProps) {
  return (
    <MapContainer
      center={[12.2, 107.4]}
      zoom={6}
      minZoom={5}
      scrollWheelZoom
      className="h-full w-full bg-white"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFocus dealers={dealers} selectedDealerId={selectedDealerId} userLocation={userLocation} />
      <DealerClusterLayer
        dealers={dealers}
        selectedDealerId={selectedDealerId}
        onSelectDealer={onSelectDealer}
      />

      {userLocation ? <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} /> : null}
    </MapContainer>
  );
}
