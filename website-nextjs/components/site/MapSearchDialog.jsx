'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, ArrowRight, Building, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchSuggestions } from '@/lib/hooks/useProperties';
import { cn } from '@/lib/utils';

const NAGPUR_CENTER = { lat: 21.1458, lng: 79.0882 };

// Custom DOM Marker Generator for Properties (displays thumbnail inside pin)
const createPropertyMarkerElement = (property) => {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.cursor = 'pointer';

  // Outer pin container
  const pin = document.createElement('div');
  pin.style.position = 'relative';
  pin.style.width = '46px';
  pin.style.height = '52px';
  pin.style.filter = 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))';
  
  // Circle for the thumbnail image
  const circle = document.createElement('div');
  circle.style.position = 'absolute';
  circle.style.top = '0px';
  circle.style.left = '0px';
  circle.style.width = '46px';
  circle.style.height = '46px';
  circle.style.borderRadius = '50%';
  circle.style.border = '2.5px solid #ffffff';
  circle.style.backgroundColor = '#e11d48'; // Primary brand color
  circle.style.overflow = 'hidden';
  circle.style.display = 'flex';
  circle.style.alignItems = 'center';
  circle.style.justifyContent = 'center';
  circle.style.zIndex = '2';

  const img = document.createElement('img');
  img.src = property.photos?.[0] || property.images?.[0] || 'https://placehold.co/46x46/png?text=Home';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  circle.appendChild(img);

  // Triangular pointer at the bottom of pin
  const pointer = document.createElement('div');
  pointer.style.position = 'absolute';
  pointer.style.bottom = '3px';
  pointer.style.left = '17px';
  pointer.style.width = '12px';
  pointer.style.height = '12px';
  pointer.style.backgroundColor = '#e11d48'; // Matches circle background
  pointer.style.borderRight = '2px solid #ffffff';
  pointer.style.borderBottom = '2px solid #ffffff';
  pointer.style.transform = 'rotate(45deg)';
  pointer.style.zIndex = '1';

  pin.appendChild(circle);
  pin.appendChild(pointer);
  container.appendChild(pin);

  return container;
};

// Custom DOM Marker Generator for Selected Location Center (Blue Pin)
const createUserMarkerElement = () => {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.cursor = 'pointer';

  const pin = document.createElement('div');
  pin.style.position = 'relative';
  pin.style.width = '36px';
  pin.style.height = '42px';
  pin.style.filter = 'drop-shadow(0 2px 5px rgba(0,0,0,0.25))';
  
  const circle = document.createElement('div');
  circle.style.position = 'absolute';
  circle.style.top = '0px';
  circle.style.left = '0px';
  circle.style.width = '36px';
  circle.style.height = '36px';
  circle.style.borderRadius = '50%';
  circle.style.border = '2.5px solid #ffffff';
  circle.style.backgroundColor = '#0284c7'; // Blue for selection
  circle.style.display = 'flex';
  circle.style.alignItems = 'center';
  circle.style.justifyContent = 'center';
  circle.style.zIndex = '2';

  const dot = document.createElement('div');
  dot.style.width = '9px';
  dot.style.height = '9px';
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = '#ffffff';
  circle.appendChild(dot);

  const pointer = document.createElement('div');
  pointer.style.position = 'absolute';
  pointer.style.bottom = '2px';
  pointer.style.left = '12px';
  pointer.style.width = '10px';
  pointer.style.height = '10px';
  pointer.style.backgroundColor = '#0284c7';
  pointer.style.borderRight = '2px solid #ffffff';
  pointer.style.borderBottom = '2px solid #ffffff';
  pointer.style.transform = 'rotate(45deg)';
  pointer.style.zIndex = '1';

  pin.appendChild(circle);
  pin.appendChild(pointer);
  container.appendChild(pin);

  return container;
};

export function MapSearchDialog({
  isOpen,
  onClose,
  properties = [],
  areas = [],
  currentArea,
  onSelectArea,
  onSelectLocality,
}) {
  const loaded = useGoogleMaps();
  const markersRef = useRef([]);
  const locationMarkerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [markerPos, setMarkerPos] = useState(NAGPUR_CENTER);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Debounce search query to prevent excessive API suggestions calls
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: apiSuggestions = [] } = useSearchSuggestions(debouncedSearchQuery);

  // Map API suggestions to clean search elements
  const suggestions = useMemo(() => {
    const list = Array.isArray(apiSuggestions) ? apiSuggestions : [];
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) return [];
    return list.slice(0, 5).map((s) => ({
      label: s.title || s.label || s.name || (typeof s === 'string' ? s : ''),
      sublabel: s.subtitle || s.sublabel || s.type || 'Locality',
      areaSlug: s.areaSlug || s.slug,
    }));
  }, [apiSuggestions, debouncedSearchQuery]);

  // Helper to extract locality from geocoded address components
  const resolveLocalityName = useCallback((components) => {
    const get = (type) => components.find((c) => c.types.includes(type))?.long_name ?? '';
    return (
      get('sublocality_level_1') ||
      get('sublocality') ||
      get('neighborhood') ||
      get('locality')
    );
  }, []);

  // Helper to Geocode address and zoom/pan the map
  const handleGeocodeAddress = useCallback((address) => {
    if (!window.google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${address}, Nagpur, Maharashtra, India` }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const pos = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        setMarkerPos(pos);
        
        const localityName = resolveLocalityName(results[0].address_components || []);
        if (localityName) {
          setSelectedLocality(localityName);
        } else {
          setSelectedLocality(address);
        }
      }
    });
  }, [resolveLocalityName]);

  // Sync initial state when dialog opens or currentArea changes
  useEffect(() => {
    if (isOpen) {
      setSelectedProperty(null);
      if (currentArea) {
        const found = areas.find((a) => a.slug === currentArea);
        if (found) {
          setSelectedLocality(found.name);
          setSearchQuery(found.name);
          // Geocode area name to position marker
          if (loaded && window.google) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: `${found.name}, Nagpur, Maharashtra` }, (results, status) => {
              if (status === 'OK' && results?.[0]?.geometry?.location) {
                const pos = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng(),
                };
                setMarkerPos(pos);
              }
            });
          }
        }
      } else {
        setSelectedLocality('');
        setSearchQuery('');
        setMarkerPos(NAGPUR_CENTER);
      }
    }
  }, [isOpen, currentArea, loaded, areas]);

  // Reverse geocode a position
  const handleReverseGeocode = useCallback((pos) => {
    if (!window.google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setSearchQuery(results[0].formatted_address || '');
        const localityName = resolveLocalityName(results[0].address_components || []);
        if (localityName) {
          setSelectedLocality(localityName);
        }
      }
    });
  }, [resolveLocalityName]);

  // Initialize Map with a small timeout to let dialog mounting animation complete
  useEffect(() => {
    if (!isOpen || !loaded || !window.google) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('dialog-map-canvas');
      if (!container) return;
      
      const map = new google.maps.Map(container, {
        center: markerPos,
        zoom: currentArea ? 14 : 12,
        mapId: 'DEMO_MAP_ID', // Required for custom AdvancedMarkerElement DOM nodes
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
      });
      setMapInstance(map);

      // Create user/selected location pin (draggable)
      let userMarker;
      if (window.google?.maps?.marker?.AdvancedMarkerElement) {
        userMarker = new google.maps.marker.AdvancedMarkerElement({
          position: markerPos,
          map,
          title: 'Search Center',
          content: createUserMarkerElement(),
          gmpDraggable: true,
        });
      } else {
        userMarker = new google.maps.Marker({
          position: markerPos,
          map,
          draggable: true,
          title: 'Search Center',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#0284c7',
            fillOpacity: 0.9,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 8,
          },
        });
      }
      locationMarkerRef.current = userMarker;

      userMarker.addListener('dragend', () => {
        const pos = userMarker.position || userMarker.getPosition();
        if (pos) {
          const latVal = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
          const lngVal = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
          const newPos = { lat: Number(latVal), lng: Number(lngVal) };
          setMarkerPos(newPos);
          handleReverseGeocode(newPos);
        }
      });

      map.addListener('click', (e) => {
        if (!e.latLng) return;
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPos(newPos);
        if (userMarker.setPosition) {
          userMarker.setPosition(e.latLng);
        } else {
          userMarker.position = e.latLng;
        }
        handleReverseGeocode(newPos);
      });

      // Force maps resize layout calculations
      google.maps.event.trigger(map, 'resize');
    }, 200);

    return () => {
      clearTimeout(timer);
      setMapInstance(null);
      if (locationMarkerRef.current) {
        locationMarkerRef.current.setMap(null);
        locationMarkerRef.current = null;
      }
    };
  }, [isOpen, loaded, handleReverseGeocode]);

  // Sync user location marker position on markerPos change
  useEffect(() => {
    if (locationMarkerRef.current && markerPos && mapInstance) {
      if (locationMarkerRef.current.setPosition) {
        locationMarkerRef.current.setPosition(markerPos);
      } else {
        locationMarkerRef.current.position = markerPos;
      }
      mapInstance.panTo(markerPos);
    }
  }, [markerPos, mapInstance]);

  // Render Property Markers (displays property thumbnail inside pin)
  useEffect(() => {
    if (!isOpen || !loaded || !mapInstance || !window.google) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasValidPoints = false;

    properties.forEach((p) => {
      if (Array.isArray(p.coordinates) && p.coordinates.length === 2) {
        const lng = p.coordinates[0];
        const lat = p.coordinates[1];

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          const pos = { lat: Number(lat), lng: Number(lng) };
          
          let marker;
          if (window.google?.maps?.marker?.AdvancedMarkerElement) {
            marker = new google.maps.marker.AdvancedMarkerElement({
              position: pos,
              map: mapInstance,
              title: p.title,
              content: createPropertyMarkerElement(p),
            });
          } else {
            marker = new google.maps.Marker({
              position: pos,
              map: mapInstance,
              title: p.title,
              icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: '#e11d48', // primary brand color
                fillOpacity: 0.95,
                strokeWeight: 1,
                strokeColor: '#ffffff',
                scale: 6,
              },
            });
          }

          marker.addListener('click', () => {
            setSelectedProperty(p);
            mapInstance.panTo(pos);
            mapInstance.setZoom(15);
          });

          markersRef.current.push(marker);
          bounds.extend(pos);
          hasValidPoints = true;
        }
      }
    });

    // Fit bounds only if properties exist and there is no active area slug zoom focus
    if (hasValidPoints && !currentArea) {
      mapInstance.fitBounds(bounds);
    }
  }, [isOpen, loaded, mapInstance, properties, currentArea]);

  const selectPopularArea = useCallback((areaName) => {
    setSearchQuery(areaName);
    handleGeocodeAddress(areaName);
  }, [handleGeocodeAddress]);

  const handleApplyFilter = () => {
    if (!selectedLocality) {
      onSelectArea?.(null);
      onSelectLocality?.('');
      onClose();
      return;
    }

    // Try to find a matching area from the list to set standard slug filter
    const matched = areas.find(
      (a) =>
        a.name.toLowerCase() === selectedLocality.toLowerCase() ||
        selectedLocality.toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes(selectedLocality.toLowerCase())
    );

    if (matched) {
      onSelectArea?.(matched.slug);
    } else {
      // Fallback: set search text input
      onSelectArea?.(null);
      onSelectLocality?.(selectedLocality);
    }
    onClose();
  };

  const selectedLocalityDisplay = selectedLocality || 'Nagpur (Center)';

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        {/* Overlay backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* Dialog Content Container */}
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-5xl h-[85vh] translate-x-[-50%] translate-y-[-50%] border border-border bg-background shadow-glow duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-2xl overflow-hidden flex flex-col md:flex-row focus:outline-none">
          
          {/* Left Sidebar Control Panel */}
          <aside className="w-full md:w-80 flex-shrink-0 bg-background border-b md:border-b-0 md:border-r border-border p-5 flex flex-col gap-5 overflow-y-auto z-10">
            <div className="flex items-center justify-between">
              <DialogPrimitive.Title className="text-base font-bold flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-primary" /> Map Location Search
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="md:hidden rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>

            {/* Suggestions Autocomplete Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleGeocodeAddress(searchQuery);
                  }
                }}
                placeholder="Search locality or landmark…"
                className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedLocality(''); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Autocomplete suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-elegant ring-1 ring-black/5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(s.label);
                        handleGeocodeAddress(s.label);
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-accent border-b border-border/40 last:border-0"
                    >
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="min-w-0">
                        <div className="truncate font-semibold text-foreground">{s.label}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{s.sublabel}</div>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Localities Quick Filter */}
            {areas.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Popular Localities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {areas.slice(0, 6).map((a) => {
                    const isActive = selectedLocality.toLowerCase() === a.name.toLowerCase();
                    return (
                      <button
                        key={a.slug}
                        type="button"
                        onClick={() => selectPopularArea(a.name)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1 cursor-pointer",
                          isActive
                            ? "bg-primary border-primary text-primary-foreground shadow-glow"
                            : "bg-muted border-transparent hover:border-primary/50 text-foreground"
                        )}
                      >
                        {isActive && <Check className="h-3 w-3" />}
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected details and actions */}
            <div className="mt-auto border-t border-border pt-4 space-y-4">
              <div className="bg-muted/50 rounded-xl p-3.5 border border-border/50">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Selected Search Area
                </div>
                <div className="text-sm font-semibold truncate text-foreground mt-1 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  {selectedLocalityDisplay}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                  {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
                </div>
              </div>

              <Button onClick={handleApplyFilter} className="w-full py-5 rounded-xl text-sm font-bold shadow-soft">
                Apply Location Filter
              </Button>
            </div>

            {/* Active Property Card Selection Display */}
            {selectedProperty && (
              <div className="border-t border-border pt-4 animate-in fade-in slide-in-from-bottom duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-primary" /> Property Selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProperty(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-3 items-center p-2 rounded-xl border bg-card text-card-foreground shadow-soft relative overflow-hidden">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={selectedProperty.photos?.[0] || selectedProperty.images?.[0] || 'https://placehold.co/100x100/png?text=Property'}
                      alt={selectedProperty.title || 'Property'}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate text-foreground">{selectedProperty.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {selectedProperty.locality || selectedProperty.area || 'Nagpur'}
                    </p>
                    <p className="text-xs font-bold text-primary mt-1">
                      {selectedProperty.totalPrice || 'Price on request'}
                    </p>
                  </div>
                  <Link
                    href={`/properties/${selectedProperty.slug || selectedProperty._id}`}
                    className="text-primary hover:text-primary-glow flex-shrink-0 p-1.5 bg-muted rounded-full ml-1"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </aside>

          {/* Map Canvas Wrapper */}
          <div className="flex-1 h-full relative bg-muted flex flex-col">
            {!loaded ? (
              <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground gap-2">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                Loading Map Canvas…
              </div>
            ) : (
              <div id="dialog-map-canvas" className="flex-1 w-full h-full" style={{ minHeight: '350px', height: '100%', width: '100%' }} />
            )}

            {/* Desktop Close Button floating on Map */}
            <DialogPrimitive.Close className="hidden md:flex absolute top-4 right-4 z-30 rounded-full bg-background/90 p-2 shadow-soft hover:bg-background transition-all border border-border focus:outline-none hover:scale-105 active:scale-95 cursor-pointer">
              <X className="h-4 w-4 text-foreground" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Floating Instructions Banner */}
            <div className="absolute top-4 left-4 right-16 md:right-auto md:w-80 pointer-events-none z-10 bg-background/90 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-border text-xs text-muted-foreground shadow-soft">
              <span className="font-semibold text-foreground">Tip:</span> Click/drag the blue pin or search an address. Click red property markers to view card details.
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
