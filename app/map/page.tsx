'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap } from 'leaflet';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface HealthcareProvider {
  id: string;
  name: string;
  type: 'Endocrinologist' | 'Primary Care' | 'Pharmacy' | 'Hospital' | 'Urgent Care' | 'Lab';
  address: string;
  phone: string;
  distance: number;
  rating: number;
  coordinates: [number, number];
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
  type: 'Emergency' | 'Support' | 'Information';
  phone: string;
  email?: string;
  website?: string;
  description: string;
  hours: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Map() {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedType, setSelectedType] = useState('All Providers');
  const [selectedDistance, setSelectedDistance] = useState('10 miles');
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [contactStations] = useState<ContactStation[]>([
    {
      id: 'emergency-1',
      name: 'Diabetes Emergency Hotline',
      type: 'Emergency',
      phone: '1-800-DIABETES',
      description: '24/7 emergency support for severe hypoglycemia or hyperglycemia',
      hours: '24/7',
      priority: 'high'
    },
    {
      id: 'support-1',
      name: 'American Diabetes Association',
      type: 'Support',
      phone: '1-800-342-2383',
      email: 'support@diabetes.org',
      website: 'www.diabetes.org',
      description: 'Comprehensive diabetes support, education, and resources',
      hours: 'Mon-Fri 8:30 AM-8:00 PM ET',
      priority: 'medium'
    },
    {
      id: 'support-2',
      name: 'Diabetes Support Network',
      type: 'Support',
      phone: '1-855-DSN-HELP',
      email: 'help@diabetessupport.org',
      description: 'Peer support groups and counseling services',
      hours: 'Mon-Fri 9:00 AM-6:00 PM',
      priority: 'medium'
    },
    {
      id: 'info-1',
      name: 'Medicare Diabetes Coverage Info',
      type: 'Information',
      phone: '1-800-MEDICARE',
      description: 'Information about Medicare coverage for diabetes supplies and services',
      hours: '24/7',
      priority: 'low'
    },
    {
      id: 'emergency-2',
      name: 'Poison Control Center',
      type: 'Emergency',
      phone: '1-800-222-1222',
      description: 'Emergency assistance for medication overdose or poisoning',
      hours: '24/7',
      priority: 'high'
    }
  ]);
  const [selectedProvider, setSelectedProvider] = useState<HealthcareProvider | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const mapRef = useRef<LeafletMap | null>(null);

  // Add useEffect to load Leaflet CSS
  useEffect(() => {
    // Dynamically import Leaflet CSS and configure markers
    const configureLeaflet = async () => {
      if (typeof window !== 'undefined') {
        await import('leaflet/dist/leaflet.css');
        
        // Fix for default markers using dynamic import
        const L = await import('leaflet');
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      }
    };
    
    configureLeaflet();
  }, []);

  // Generate sample healthcare providers data
  useEffect(() => {
    const generateProviders = (): HealthcareProvider[] => {
      const sampleProviders: HealthcareProvider[] = [
        // Endocrinologists
        {
          id: 'endo-1',
          name: 'Dr. Sarah Martinez - Diabetes Specialists',
          type: 'Endocrinologist',
          address: '123 Medical Center Dr, Suite 500, New York, NY 10001',
          phone: '(212) 555-0123',
          distance: 0.8,
          rating: 4.8,
          coordinates: [40.7589, -73.9851],
          services: ['Type 2 Diabetes Management', 'Insulin Therapy', 'CGM Setup', 'Diabetes Education'],
          hours: 'Mon-Fri 8:00 AM-6:00 PM',
          accepting: true,
          insurance: ['Medicare', 'Medicaid', 'BlueCross', 'Aetna', 'United Healthcare'],
          specialties: ['Type 2 Diabetes', 'Gestational Diabetes', 'Thyroid Disorders'],
          emergencyContact: '(212) 555-0199'
        },
        {
          id: 'endo-2',
          name: 'Manhattan Endocrine Associates',
          type: 'Endocrinologist',
          address: '456 Park Avenue, 8th Floor, New York, NY 10022',
          phone: '(212) 555-0234',
          distance: 1.2,
          rating: 4.6,
          coordinates: [40.7614, -73.9776],
          services: ['Diabetes Management', 'Insulin Pump Training', 'Nutrition Counseling'],
          hours: 'Mon-Fri 7:30 AM-7:00 PM, Sat 9:00 AM-1:00 PM',
          accepting: true,
          insurance: ['Medicare', 'BlueCross', 'Cigna', 'Humana'],
          specialties: ['Type 1 & 2 Diabetes', 'Metabolic Disorders']
        },
        // Primary Care
        {
          id: 'primary-1',
          name: 'Downtown Family Medicine',
          type: 'Primary Care',
          address: '789 Broadway, Suite 200, New York, NY 10003',
          phone: '(212) 555-0345',
          distance: 1.5,
          rating: 4.4,
          coordinates: [40.7505, -73.9934],
          services: ['Routine Diabetes Care', 'A1C Testing', 'Blood Pressure Monitoring', 'Preventive Care'],
          hours: 'Mon-Fri 8:00 AM-6:00 PM',
          accepting: true,
          insurance: ['Medicare', 'Medicaid', 'Most Major Insurance'],
          specialties: ['Family Medicine', 'Diabetes Management']
        },
        // Pharmacies
        {
          id: 'pharmacy-1',
          name: 'HealthMart Pharmacy',
          type: 'Pharmacy',
          address: '321 First Avenue, New York, NY 10009',
          phone: '(212) 555-0456',
          distance: 0.6,
          rating: 4.7,
          coordinates: [40.7282, -73.9776],
          services: ['Prescription Fill', 'Diabetes Supplies', 'Blood Glucose Testing', 'Medication Counseling', 'Insurance Billing'],
          hours: 'Mon-Fri 8:00 AM-9:00 PM, Sat-Sun 9:00 AM-7:00 PM',
          accepting: true,
          insurance: ['Medicare Part D', 'Most Insurance Plans']
        },
        {
          id: 'pharmacy-2',
          name: 'CVS Pharmacy',
          type: 'Pharmacy',
          address: '654 Lexington Avenue, New York, NY 10022',
          phone: '(212) 555-0567',
          distance: 1.1,
          rating: 4.2,
          coordinates: [40.7589, -73.9683],
          services: ['24/7 Prescription Service', 'Diabetes Care Center', 'MinuteClinic', 'Insulin Storage'],
          hours: '24/7',
          accepting: true,
          insurance: ['Medicare', 'Medicaid', 'CVS Caremark', 'Most Plans']
        },
        // Hospitals
        {
          id: 'hospital-1',
          name: 'NewYork-Presbyterian Hospital',
          type: 'Hospital',
          address: '525 East 68th Street, New York, NY 10065',
          phone: '(212) 555-0678',
          distance: 2.3,
          rating: 4.9,
          coordinates: [40.7648, -73.9540],
          services: ['Emergency Care', 'Diabetes Unit', 'Endocrinology Dept', '24/7 Lab Services', 'Diabetes Education Center'],
          hours: '24/7',
          accepting: true,
          insurance: ['Medicare', 'Medicaid', 'All Major Insurance'],
          emergencyContact: '(212) 555-0911'
        },
        // Urgent Care
        {
          id: 'urgent-1',
          name: 'CityMD Urgent Care',
          type: 'Urgent Care',
          address: '147 West 42nd Street, New York, NY 10036',
          phone: '(212) 555-0789',
          distance: 1.8,
          rating: 4.3,
          coordinates: [40.7549, -73.9840],
          services: ['Urgent Diabetes Care', 'A1C Testing', 'Blood Sugar Monitoring', 'Prescription Refills'],
          hours: 'Mon-Sun 8:00 AM-10:00 PM',
          accepting: true,
          insurance: ['Medicare', 'Most Major Plans']
        },
        // Lab Services
        {
          id: 'lab-1',
          name: 'LabCorp',
          type: 'Lab',
          address: '200 Water Street, New York, NY 10038',
          phone: '(212) 555-0890',
          distance: 2.0,
          rating: 4.5,
          coordinates: [40.7074, -74.0113],
          services: ['A1C Testing', 'Glucose Tolerance Test', 'Comprehensive Metabolic Panel', 'Lipid Panel'],
          hours: 'Mon-Fri 6:30 AM-4:00 PM, Sat 7:00 AM-12:00 PM',
          accepting: true,
          insurance: ['Medicare', 'Medicaid', 'Most Insurance Plans']
        }
      ];

      return sampleProviders;
    };

    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setProviders(generateProviders());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredProviders = providers.filter(provider => {
    if (selectedType === 'All Providers') return true;
    return provider.type === selectedType;
  });

  const handleSearch = () => {
    // In a real app, this would geocode the search location
    // For demo purposes, we'll just center the map on a new location
    if (searchLocation.toLowerCase().includes('boston')) {
      setMapCenter([42.3601, -71.0589]);
    } else if (searchLocation.toLowerCase().includes('chicago')) {
      setMapCenter([41.8781, -87.6298]);
    } else {
      setMapCenter([40.7128, -74.0060]); // Default to NYC
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'Endocrinologist': return '🩺';
      case 'Primary Care': return '👨‍⚕️';
      case 'Pharmacy': return '💊';
      case 'Hospital': return '🏥';
      case 'Urgent Care': return '🚑';
      case 'Lab': return '🧪';
      default: return '📍';
    }
  };

  const getContactPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Create a safe map component with proper typing
  interface SafeMapContainerProps {
    children: React.ReactNode;
    center: [number, number];
    zoom: number;
    style: React.CSSProperties;
    scrollWheelZoom: boolean;
  }

  const SafeMapContainer = ({ children, ...props }: SafeMapContainerProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return (
        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      );
    }

    return (
      <MapContainer
        ref={mapRef}
        key={`map-${mapCenter.join('-')}`} // Force remount when center changes
        {...props}
      >
        {children}
      </MapContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Healthcare Provider Map
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find nearby diabetes specialists, pharmacies, and healthcare services with contact details
          </p>
        </div>

        {/* Emergency Contact Stations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Contact Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactStations.map((station) => (
              <div
                key={station.id}
                className={`p-4 rounded-lg border-2 ${getContactPriorityColor(station.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{station.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                    {station.type}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium">📞</span>
                    <a href={`tel:${station.phone}`} className="ml-2 hover:underline">
                      {station.phone}
                    </a>
                  </div>
                  {station.email && (
                    <div className="flex items-center">
                      <span className="font-medium">✉️</span>
                      <a href={`mailto:${station.email}`} className="ml-2 hover:underline">
                        {station.email}
                      </a>
                    </div>
                  )}
                  {station.website && (
                    <div className="flex items-center">
                      <span className="font-medium">🌐</span>
                      <a href={`https://${station.website}`} target="_blank" rel="noopener noreferrer" className="ml-2 hover:underline">
                        {station.website}
                      </a>
                    </div>
                  )}
                  <p className="mt-2">{station.description}</p>
                  <p className="text-xs opacity-75">Hours: {station.hours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Location
                </label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter address or zip code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type
                </label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance
                </label>
                <select 
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option>5 miles</option>
                  <option>10 miles</option>
                  <option>25 miles</option>
                  <option>50 miles</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleSearch}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                >
                  🔍 Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🗺️ Interactive Map
              </h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <SafeMapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredProviders.map((provider) => (
                    <Marker key={provider.id} position={provider.coordinates}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-lg mb-2">
                            {getProviderIcon(provider.type)} {provider.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{provider.address}</p>
                          <p className="text-sm">
                            <strong>📞 Phone:</strong> {provider.phone}
                          </p>
                          <p className="text-sm">
                            <strong>⭐ Rating:</strong> {provider.rating}/5
                          </p>
                          <p className="text-sm">
                            <strong>📍 Distance:</strong> {provider.distance} miles
                          </p>
                          <button
                            onClick={() => setSelectedProvider(provider)}
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

          {/* Results List */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Nearby Providers ({filteredProviders.length})
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredProviders.map((provider) => (
                  <div 
                    key={provider.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">
                        {getProviderIcon(provider.type)} {provider.name}
                      </h3>
                      <div className="flex items-center text-sm">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1">{provider.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{provider.address}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600">{provider.distance} miles</span>
                      <span className={`px-2 py-1 rounded ${provider.accepting ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {provider.accepting ? 'Accepting Patients' : 'Not Accepting'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provider Details Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {getProviderIcon(selectedProvider.type)} {selectedProvider.name}
                    </h2>
                    <p className="text-gray-600">{selectedProvider.type}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📞 Contact Information</h3>
                    <div className="space-y-2">
                      <p><strong>Address:</strong> {selectedProvider.address}</p>
                      <p><strong>Phone:</strong> <a href={`tel:${selectedProvider.phone}`} className="text-blue-600 hover:underline">{selectedProvider.phone}</a></p>
                      {selectedProvider.emergencyContact && (
                        <p><strong>Emergency:</strong> <a href={`tel:${selectedProvider.emergencyContact}`} className="text-red-600 hover:underline">{selectedProvider.emergencyContact}</a></p>
                      )}
                      <p><strong>Hours:</strong> {selectedProvider.hours}</p>
                      <p><strong>Distance:</strong> {selectedProvider.distance} miles</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ Details</h3>
                    <div className="space-y-2">
                      <p><strong>Rating:</strong> ⭐ {selectedProvider.rating}/5</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedProvider.accepting ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedProvider.accepting ? 'Accepting Patients' : 'Not Accepting'}
                        </span>
                      </p>
                      {selectedProvider.specialties && (
                        <div>
                          <strong>Specialties:</strong>
                          <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                            {selectedProvider.specialties.map((specialty, index) => (
                              <li key={index}>{specialty}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🏥 Services Offered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedProvider.services.map((service, index) => (
                      <div key={index} className="bg-blue-50 text-blue-800 px-3 py-2 rounded text-sm">
                        • {service}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">💳 Insurance Accepted</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedProvider.insurance.map((plan, index) => (
                      <div key={index} className="bg-green-50 text-green-800 px-3 py-2 rounded text-sm">
                        ✓ {plan}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <a
                    href={`tel:${selectedProvider.phone}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-center transition-colors"
                  >
                    📞 Call Now
                  </a>
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProvider.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md text-center transition-colors"
                  >
                    🗺️ Get Directions
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