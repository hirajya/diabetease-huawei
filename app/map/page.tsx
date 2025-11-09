"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";

// Dynamically import react-leaflet components to avoid SSR issues in Next.js
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

interface HealthcareProvider {
  id: string;
  name: string;
  type: "Endocrinologist" | "Primary Care" | "Pharmacy" | "Hospital" | "Urgent Care" | "Lab";
  address: string;
  phone: string;
  distance: number; // kilometers
  rating: number;
  coordinates: [number, number]; // [lat,lng]
  services: string[];
  hours: string;
  accepting: boolean;
  insurance: string[];
  specialties?: string[];
  emergencyContact?: string;
}

interface ContactStation {
  id: string;
  name: string;
  type: "Emergency" | "Support" | "Information";
  phone: string;
  email?: string;
  website?: string;
  description: string;
  hours: string;
  priority: "high" | "medium" | "low";
}

export default function MapPage() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedType, setSelectedType] = useState("All Providers");
  const [selectedDistance, setSelectedDistance] = useState("10 km");
  const [onlyAccepting, setOnlyAccepting] = useState(false);
  const [sortBy, setSortBy] = useState("distance");
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<HealthcareProvider | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([14.5995, 120.9842]); // Manila
  const mapRef = useRef<LeafletMap | null>(null);

  const [contactStations] = useState<ContactStation[]>([
    {
      id: "emergency-1",
      name: "DOH Emergency Hotline",
      type: "Emergency",
      phone: "+63 2 711 1001",
      description: "24/7 emergency health assistance",
      hours: "24/7",
      priority: "high",
    },
    {
      id: "support-1",
      name: "Philippine Diabetes Support Center",
      type: "Support",
      phone: "+63 2 555 1100",
      email: "support@phdiabetes.org",
      website: "phdiabetes.org",
      description: "Education and counseling for diabetes management",
      hours: "Mon-Fri 9:00 AM-5:00 PM",
      priority: "medium",
    },
    {
      id: "info-1",
      name: "PhilHealth Info Line",
      type: "Information",
      phone: "+63 2 441 7442",
      description: "Coverage details for diabetes services and supplies",
      hours: "Mon-Fri 8:00 AM-5:00 PM",
      priority: "low",
    },
  ]);

  // Load Leaflet CSS & configure default marker icons
  useEffect(() => {
    const configureLeaflet = async () => {
      if (typeof window !== "undefined") {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }
        const L = await import("leaflet");
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      }
    };
    configureLeaflet();
  }, []);

  // Load Philippines dummy provider data (extended)
  useEffect(() => {
    const phProviders: HealthcareProvider[] = [
      {
        id: "endo-1",
        name: "Makati Endocrine Clinic",
        type: "Endocrinologist",
        address: "Ayala Ave, Makati, Metro Manila",
        phone: "+63 2 555 0101",
        distance: 3.2,
        rating: 4.7,
        coordinates: [14.5547, 121.0244],
        services: ["Diabetes Management", "Insulin Therapy", "Thyroid Assessment"],
        hours: "Mon-Fri 8:00 AM-6:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Maxicare", "Intellicare"],
        specialties: ["Type 2 Diabetes", "Thyroid Disorders"],
      },
      {
        id: "endo-2",
        name: "BGC Diabetes Center",
        type: "Endocrinologist",
        address: "Bonifacio Global City, Taguig",
        phone: "+63 2 555 0112",
        distance: 5.0,
        rating: 4.6,
        coordinates: [14.5352, 121.0537],
        services: ["Continuous Glucose Monitoring", "Dietary Counseling"],
        hours: "Mon-Sat 9:00 AM-5:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Maxicare"],
        specialties: ["Type 1 Diabetes", "Metabolic Disorders"],
      },
      {
        id: "primary-1",
        name: "QC Health Clinic",
        type: "Primary Care",
        address: "Quezon Ave, Quezon City",
        phone: "+63 2 555 0203",
        distance: 7.4,
        rating: 4.3,
        coordinates: [14.6760, 121.0437],
        services: ["General Consultation", "A1C Testing", "Blood Pressure Monitoring"],
        hours: "Mon-Fri 8:00 AM-6:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Medicard"],
      },
      {
        id: "pharmacy-1",
        name: "WellPlus Pharmacy",
        type: "Pharmacy",
        address: "Ortigas Center, Pasig",
        phone: "+63 2 555 0304",
        distance: 6.1,
        rating: 4.5,
        coordinates: [14.5869, 121.0605],
        services: ["Prescription Fill", "Diabetes Supplies", "Medication Counseling"],
        hours: "Mon-Sun 8:00 AM-9:00 PM",
        accepting: true,
        insurance: ["PhilHealth"],
      },
      {
        id: "hospital-1",
        name: "St. Metro Hospital",
        type: "Hospital",
        address: "Ermita, Manila",
        phone: "+63 2 555 0405",
        distance: 2.8,
        rating: 4.8,
        coordinates: [14.5826, 121.0000],
        services: ["Emergency Care", "Diabetes Ward", "24/7 Lab"],
        hours: "24/7",
        accepting: true,
        insurance: ["PhilHealth", "Maxicare", "Intellicare"],
      },
      {
        id: "urgent-1",
        name: "Rapid Urgent Care",
        type: "Urgent Care",
        address: "Mandaluyong City",
        phone: "+63 2 555 0506",
        distance: 4.9,
        rating: 4.2,
        coordinates: [14.5774, 121.0339],
        services: ["Urgent Diabetes Support", "Wound Care"],
        hours: "Mon-Sun 8:00 AM-10:00 PM",
        accepting: true,
        insurance: ["PhilHealth"],
      },
      {
        id: "lab-1",
        name: "Metro Diagnostic Lab",
        type: "Lab",
        address: "San Juan City",
        phone: "+63 2 555 0607",
        distance: 5.6,
        rating: 4.4,
        coordinates: [14.6038, 121.0315],
        services: ["A1C Testing", "Fasting Glucose", "Lipid Profile"],
        hours: "Mon-Sat 7:00 AM-5:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Maxicare"],
      },
      {
        id: "endo-3",
        name: "Pasig Endocrine Center",
        type: "Endocrinologist",
        address: "Kapitolyo, Pasig City",
        phone: "+63 2 555 0708",
        distance: 5.9,
        rating: 4.5,
        coordinates: [14.5735, 121.0470],
        services: ["CGM Setup", "Diet Coaching", "Insulin Pump Consultation"],
        hours: "Mon-Fri 9:00 AM-6:00 PM",
        accepting: false,
        insurance: ["PhilHealth", "Intellicare"],
        specialties: ["Type 1 Diabetes", "Gestational Diabetes"],
      },
      {
        id: "hospital-2",
        name: "Quezon City General Hospital",
        type: "Hospital",
        address: "Buhangin St, Quezon City",
        phone: "+63 2 555 0809",
        distance: 8.3,
        rating: 4.1,
        coordinates: [14.6507, 121.0373],
        services: ["Emergency Care", "Outpatient Diabetes", "24/7 Pharmacy"],
        hours: "24/7",
        accepting: true,
        insurance: ["PhilHealth"],
      },
      {
        id: "pharmacy-2",
        name: "CarePlus Pharmacy",
        type: "Pharmacy",
        address: "Greenhills, San Juan",
        phone: "+63 2 555 0910",
        distance: 6.2,
        rating: 4.0,
        coordinates: [14.6020, 121.0473],
        services: ["Prescription Fill", "Glucose Strips", "Nutrition Supplements"],
        hours: "Mon-Sun 8:00 AM-10:00 PM",
        accepting: true,
        insurance: ["PhilHealth"],
      },
      {
        id: "primary-2",
        name: "Makati Wellness Clinic",
        type: "Primary Care",
        address: "Poblacion, Makati City",
        phone: "+63 2 555 1011",
        distance: 3.9,
        rating: 4.6,
        coordinates: [14.5665, 121.0287],
        services: ["General Consultation", "Nutrition Advice", "Blood Pressure Monitoring"],
        hours: "Mon-Sat 8:00 AM-5:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Medicard", "Intellicare"],
      },
      {
        id: "lab-2",
        name: "Taguig Diagnostics Center",
        type: "Lab",
        address: "Western Bicutan, Taguig City",
        phone: "+63 2 555 1112",
        distance: 7.1,
        rating: 4.3,
        coordinates: [14.5087, 121.0450],
        services: ["A1C Testing", "OGTT", "Basic Metabolic Panel"],
        hours: "Mon-Fri 7:00 AM-4:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Maxicare"],
      },
      {
        id: "endo-4",
        name: "Davao Diabetes Wellness",
        type: "Endocrinologist",
        address: "Poblacion District, Davao City",
        phone: "+63 82 555 1213",
        distance: 960,
        rating: 4.9,
        coordinates: [7.0731, 125.6128],
        services: ["Telemedicine Consult", "Insulin Adjustment", "Dietary Planning"],
        hours: "Mon-Fri 9:00 AM-5:00 PM",
        accepting: true,
        insurance: ["PhilHealth", "Maxicare"],
        specialties: ["Type 2 Diabetes", "Metabolic Syndrome"],
      },
      {
        id: "primary-3",
        name: "Cebu Community Health",
        type: "Primary Care",
        address: "Cebu City",
        phone: "+63 32 555 1314",
        distance: 570,
        rating: 4.2,
        coordinates: [10.3157, 123.8854],
        services: ["General Consultation", "Blood Glucose Screening"],
        hours: "Mon-Sat 8:00 AM-6:00 PM",
        accepting: true,
        insurance: ["PhilHealth"],
      },
    ];
    setProviders(phProviders);
  }, []);

  const filteredProviders = providers
    .filter(p => (selectedType === "All Providers" ? true : p.type === selectedType))
    .filter(p => {
      const maxKm = parseInt(selectedDistance);
      return p.distance <= maxKm;
    })
    .filter(p => (onlyAccepting ? p.accepting : true));

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default: // distance
        return a.distance - b.distance;
    }
  });

  const handleSearch = () => {
    const q = searchLocation.toLowerCase();
    if (q.includes("cebu")) setMapCenter([10.3157, 123.8854]);
    else if (q.includes("davao")) setMapCenter([7.1907, 125.4553]);
    else if (q.includes("quezon")) setMapCenter([14.6760, 121.0437]);
    else if (q.includes("makati")) setMapCenter([14.5547, 121.0244]);
    else if (q.includes("taguig") || q.includes("bgc")) setMapCenter([14.5352, 121.0537]);
    else setMapCenter([14.5995, 120.9842]);
  };

  const getContactPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 border-red-300 text-red-800";
      case "medium": return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "low": return "bg-blue-100 border-blue-300 text-blue-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  interface SafeMapContainerProps {
    children: React.ReactNode;
    center: [number, number];
    zoom: number;
    style: React.CSSProperties;
    scrollWheelZoom: boolean;
  }
  const SafeMapContainer = ({ children, ...props }: SafeMapContainerProps) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) {
      return (
        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      );
    }
    return <MapContainer ref={mapRef} {...props}>{children}</MapContainer>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Healthcare Provider Map</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Find nearby diabetes specialists, pharmacies, and healthcare services in Metro Manila.</p>
        </div>

        {/* Important Contacts */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Contact Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactStations.map(station => (
              <div key={station.id} className={`p-4 rounded-lg border-2 ${getContactPriorityColor(station.priority)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{station.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">{station.type}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><strong>Phone:</strong> <a href={`tel:${station.phone}`} className="text-blue-700 hover:underline">{station.phone}</a></p>
                  {station.email && <p><strong>Email:</strong> <a href={`mailto:${station.email}`} className="text-blue-700 hover:underline">{station.email}</a></p>}
                  {station.website && <p><strong>Website:</strong> <a href={`https://${station.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{station.website}</a></p>}
                  <p className="mt-2">{station.description}</p>
                  <p className="text-xs opacity-75">Hours: {station.hours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Location</label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  placeholder="e.g. Makati, Cebu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option>All Providers</option>
                  <option>Endocrinologist</option>
                  <option>Primary Care</option>
                  <option>Pharmacy</option>
                  <option>Hospital</option>
                  <option>Urgent Care</option>
                  <option>Lab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                <select
                  value={selectedDistance}
                  onChange={e => setSelectedDistance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option>5 km</option>
                  <option>10 km</option>
                  <option>20 km</option>
                  <option>40 km</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Only Accepting</label>
                <button
                  onClick={() => setOnlyAccepting(prev => !prev)}
                  className={`w-full px-3 py-2 rounded-md border text-sm transition-colors ${onlyAccepting ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                >
                  {onlyAccepting ? 'Showing Accepting' : 'All Providers'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="distance">Distance</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

  {/* Map & Results (hidden when a provider is selected) */}
  {!selectedProvider && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Interactive Map</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <SafeMapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {sortedProviders.map(p => (
                    <Marker key={p.id} position={p.coordinates}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{p.address}</p>
                          <p className="text-sm"><strong>Phone:</strong> {p.phone}</p>
                          <p className="text-sm text-gray-600"><strong>Rating:</strong> {p.rating}/5</p>
                          <p className="text-sm"><strong>Distance:</strong> {p.distance} km</p>
                          <button
                            onClick={() => setSelectedProvider(p)}
                            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </SafeMapContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nearby Providers ({sortedProviders.length})</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sortedProviders.map(p => (
                  <div
                    key={p.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedProvider(p)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">{p.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{p.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{p.address}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600">{p.distance} km</span>
                      <span className={`px-2 py-1 rounded ${p.accepting ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.accepting ? 'Accepting Patients' : 'Not Accepting'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  </div>
  )}

        {selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProvider.name}</h2>
                    <p className="text-gray-600">{selectedProvider.type}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong>Address:</strong> {selectedProvider.address}</p>
                      <p><strong>Phone:</strong> <a href={`tel:${selectedProvider.phone}`} className="text-blue-700 hover:underline font-medium">{selectedProvider.phone}</a></p>
                      {selectedProvider.emergencyContact && (<p><strong>Emergency:</strong> <a href={`tel:${selectedProvider.emergencyContact}`} className="text-red-600 hover:underline font-medium">{selectedProvider.emergencyContact}</a></p>)}
                      <p><strong>Hours:</strong> {selectedProvider.hours}</p>
                      <p><strong>Distance:</strong> {selectedProvider.distance} km</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-2 text-sm text-gray-800">
                      <p><strong>Rating:</strong> {selectedProvider.rating}/5</p>
                      <p><strong>Status:</strong> <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedProvider.accepting ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedProvider.accepting ? 'Accepting Patients' : 'Not Accepting'}</span></p>
                      {selectedProvider.specialties && (
                        <div>
                          <strong>Specialties:</strong>
                          <ul className="list-disc list-inside text-xs text-gray-700 mt-1">
                            {selectedProvider.specialties.map(s => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedProvider.services.map(service => (
                      <div key={service} className="bg-blue-50 text-blue-800 px-3 py-2 rounded text-xs">{service}</div>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Accepted</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedProvider.insurance.map(plan => (
                      <div key={plan} className="bg-green-50 text-green-800 px-3 py-2 rounded text-xs">{plan}</div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t">
                  <a href={`tel:${selectedProvider.phone}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-center transition-colors">Call Now</a>
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProvider.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-center transition-colors"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}