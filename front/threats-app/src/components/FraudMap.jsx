import { useContext, useEffect, useRef, useState } from "react";
import { TransactionsContext } from "../contexts/TransactionsContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, AlertTriangle } from "lucide-react";

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FraudMap = () => {
  const { last30Minutes } = useContext(TransactionsContext);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795], // Center of US
      zoom: 4,
      zoomControl: true,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create a layer group for markers
    markersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers for fraudulent transactions - recreate all markers to update opacity
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !markersLayerRef.current ||
      !Array.isArray(last30Minutes)
    )
      return;

    // Clear all existing markers
    markersLayerRef.current.clearLayers();

    // Get all fraudulent transactions with location
    const fraudulentTransactions = last30Minutes.filter((tx) => {
      const isFraud =
        tx.ml_prediction === true ||
        tx.ml_prediction === 1 ||
        tx.ml_prediction === "1" ||
        tx.is_fraud;
      const hasLocation = tx.lat && tx.long;
      return isFraud && hasLocation;
    });

    if (fraudulentTransactions.length === 0) return;

    // Create markers for all fraud transactions with time-based opacity
    fraudulentTransactions.forEach((tx) => {
      const lat = parseFloat(tx.lat);
      const lng = parseFloat(tx.long);

      if (isNaN(lat) || isNaN(lng)) return;

      // Parse transaction date - combine trans_date and trans_time
      let transactionDate;
      if (tx.trans_date && tx.trans_time) {
        transactionDate = new Date(`${tx.trans_date} ${tx.trans_time}`);
      }

      // Create custom red icon for fraud markers
      const redIcon = L.divIcon({
        className: "custom-fraud-marker",
        html: `
          <div style="
            background-color: #ef4444;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon: redIcon });

      const amount = parseFloat(tx.amt || tx.amount || 0);
      const merchant = tx.merchant || "Unknown";
      const category = tx.category || "Unknown";
      const timestamp =
        transactionDate && !isNaN(transactionDate.getTime())
          ? transactionDate.toLocaleString()
          : tx.trans_date && tx.trans_time
          ? `${tx.trans_date} ${tx.trans_time}`
          : "Unknown";

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <div style="font-weight: bold; color: #ef4444; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 16px;">⚠️</span> Fraudulent Transaction
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Amount:</strong> $${amount.toFixed(2)}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Merchant:</strong> ${merchant}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Category:</strong> ${category}
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Time:</strong> ${timestamp}
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280;">
            ID: ${tx.transaction_id}
          </div>
        </div>
      `);

      marker.addTo(markersLayerRef.current);
    });
  }, [last30Minutes]); // Recreate all markers whenever data changes

  // Get fraud stats
  const fraudCount =
    last30Minutes?.filter(
      (tx) =>
        tx.ml_prediction === true ||
        tx.ml_prediction === 1 ||
        tx.ml_prediction === "1" ||
        tx.is_fraud
    ).length || 0;

  const fraudWithLocation =
    last30Minutes?.filter((tx) => {
      const isFraud =
        tx.ml_prediction === true ||
        tx.ml_prediction === 1 ||
        tx.ml_prediction === "1" ||
        tx.is_fraud;
      return isFraud && tx.lat && tx.long;
    }).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Fraud Location Map
        </h2>
        <p className="text-gray-600">
          Geographic distribution of fraudulent transactions (Last 30 Minutes)
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">
                Total Fraud (Last 30m)
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {fraudCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Mapped Locations</div>
              <div className="text-2xl font-bold text-gray-900">
                {fraudWithLocation.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="w-6 h-6 text-orange-600 font-bold text-center leading-6">
                %
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Coverage Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {fraudCount > 0
                  ? Math.round((fraudWithLocation / fraudCount) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div ref={mapRef} className="w-full h-[600px]" style={{ zIndex: 0 }} />
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-sm font-semibold text-gray-700">Legend:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-sm text-gray-600">
              Fraudulent Transaction
            </span>
          </div>
          <div className="text-xs text-gray-500 ml-auto">
            Click on markers for transaction details
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudMap;
