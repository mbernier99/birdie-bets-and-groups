import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, MapPin, Zap, Eye, EyeOff } from 'lucide-react';
import { EnhancedARMeasurement } from '@/components/ar/EnhancedARMeasurement';

interface ReferencePoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  photoUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  method?: string;
}

interface ShotData {
  id: string;
  playerId: string;
  playerName: string;
  measurement: EnhancedARMeasurement;
  distanceYards: number;
  timestamp: number;
  ranking: number;
}

interface BetRoomMapProps {
  referencePoints: {
    pin?: ReferencePoint;
    tee?: ReferencePoint;
    start?: ReferencePoint;
  };
  shots: ShotData[];
  gameMode: 'ctp' | 'long-drive';
  currentPlayerId: string;
  mapboxToken?: string;
}

const BetRoomMap: React.FC<BetRoomMapProps> = ({
  referencePoints,
  shots,
  gameMode,
  currentPlayerId,
  mapboxToken
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showAllShots, setShowAllShots] = useState(true);
  const [selectedShot, setSelectedShot] = useState<ShotData | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Get center point for map initialization
  const getCenterPoint = () => {
    const relevantPoint = gameMode === 'ctp' 
      ? referencePoints.pin || referencePoints.start
      : referencePoints.tee;
    
    if (relevantPoint) {
      return [relevantPoint.longitude, relevantPoint.latitude] as [number, number];
    }
    
    // If no reference point, use first shot location
    if (shots.length > 0) {
      const firstShot = shots[0];
      return [firstShot.measurement.longitude, firstShot.measurement.latitude] as [number, number];
    }
    
    // Default to a generic golf course location
    return [-74.5, 40] as [number, number];
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: getCenterPoint(),
      zoom: 17,
      pitch: 45,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add reference points
    Object.entries(referencePoints).forEach(([type, point]) => {
      if (!point) return;

      const el = document.createElement('div');
      el.className = 'reference-marker';
      el.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
      `;

      if (type === 'pin') {
        el.style.backgroundColor = '#22c55e';
        el.innerHTML = '📍';
      } else if (type === 'tee') {
        el.style.backgroundColor = '#f97316';
        el.innerHTML = '🏌️';
      } else if (type === 'start') {
        el.style.backgroundColor = '#3b82f6';
        el.innerHTML = '🎯';
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.longitude, point.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)} Location</h3>
                <p class="text-sm">Accuracy: ±${point.accuracy?.toFixed(1) || '5.0'}m</p>
                <p class="text-sm">Confidence: ${point.confidence?.toUpperCase() || 'MEDIUM'}</p>
              </div>
            `)
        )
        .addTo(map.current);

      markers.current.push(marker);
    });

    // Add shot markers
    if (showAllShots) {
      shots.forEach((shot, index) => {
        const isCurrentPlayer = shot.playerId === currentPlayerId;
        
        const el = document.createElement('div');
        el.className = 'shot-marker';
        el.style.cssText = `
          width: 25px;
          height: 25px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
          background-color: ${isCurrentPlayer ? '#8b5cf6' : '#64748b'};
        `;
        el.innerHTML = `${index + 1}`;

        el.addEventListener('click', () => {
          setSelectedShot(shot);
        });

        const distanceInfo = gameMode === 'ctp' 
          ? `${shot.distanceYards.toFixed(1)} yards from pin`
          : `${shot.distanceYards.toFixed(1)} yards from tee`;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([shot.measurement.longitude, shot.measurement.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-3">
                  <h3 class="font-semibold">${shot.playerName}</h3>
                  <p class="text-sm font-medium">${distanceInfo}</p>
                  <p class="text-xs text-gray-600">
                    ${shot.measurement.confidence.toUpperCase()} confidence • 
                    ${new Date(shot.timestamp).toLocaleTimeString()}
                  </p>
                  ${shot.measurement.stabilityScore ? 
                    `<p class="text-xs text-gray-600">Stability: ${shot.measurement.stabilityScore.toFixed(0)}%</p>` : ''
                  }
                </div>
              `)
          )
          .addTo(map.current);

        markers.current.push(marker);
      });
    }

    // Fit map to show all markers
    if (markers.current.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add reference points to bounds
      Object.values(referencePoints).forEach(point => {
        if (point) bounds.extend([point.longitude, point.latitude]);
      });
      
      // Add shots to bounds
      if (showAllShots) {
        shots.forEach(shot => {
          bounds.extend([shot.measurement.longitude, shot.measurement.latitude]);
        });
      }
      
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 18
      });
    }
  }, [mapLoaded, referencePoints, shots, showAllShots, currentPlayerId, gameMode]);

  if (!mapboxToken) {
    return (
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shot Location Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-yellow-600 mb-2">⚠️ Mapbox Token Required</div>
            <p className="text-sm text-muted-foreground">
              Please add your Mapbox public token to Supabase Edge Function Secrets to enable the map.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => window.open('https://mapbox.com/', '_blank')}
            >
              Get Mapbox Token
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shot Location Map
              <Badge variant="outline" className="text-xs">
                {gameMode === 'ctp' ? 'Closest to Pin' : 'Long Drive'}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllShots(!showAllShots)}
            >
              {showAllShots ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide Shots
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show All Shots
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Container */}
          <div className="relative">
            <div ref={mapContainer} className="w-full h-80 rounded-lg overflow-hidden" />
            
            {/* Map Legend */}
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full border border-white"></div>
                  <span>Pin Location</span>
                </div>
                {gameMode === 'long-drive' && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full border border-white"></div>
                    <span>Tee Location</span>
                  </div>
                )}
                {gameMode === 'ctp' && referencePoints.start && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
                    <span>Start Point</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full border border-white"></div>
                  <span>Your Shots</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded-full border border-white"></div>
                  <span>Other Shots</span>
                </div>
              </div>
            </div>
            
            {/* Shot Count */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white rounded-lg px-2 py-1 text-xs">
              {shots.length} shot{shots.length !== 1 ? 's' : ''} recorded
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Shot Details */}
      {selectedShot && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Shot Details - {selectedShot.playerName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Distance</div>
                <div className="text-lg font-bold text-purple-600">
                  {selectedShot.distanceYards.toFixed(1)} yards
                </div>
              </div>
              <div>
                <div className="font-medium">Ranking</div>
                <div className="text-lg font-bold">
                  #{selectedShot.ranking || 'N/A'}
                </div>
              </div>
              <div>
                <div className="font-medium">Accuracy</div>
                <Badge variant={
                  selectedShot.measurement.confidence === 'high' ? 'default' : 
                  selectedShot.measurement.confidence === 'medium' ? 'secondary' : 'outline'
                }>
                  ±{selectedShot.measurement.accuracy.toFixed(1)}m
                </Badge>
              </div>
              <div>
                <div className="font-medium">Method</div>
                <Badge variant="outline" className="text-xs">
                  {selectedShot.measurement.method === 'enhanced-ar' ? 'Enhanced AR' :
                   selectedShot.measurement.method === 'ar-camera' ? 'AR Camera' : 'GPS'}
                </Badge>
              </div>
              {selectedShot.measurement.stabilityScore && (
                <div>
                  <div className="font-medium">Stability</div>
                  <div className="text-muted-foreground">
                    {selectedShot.measurement.stabilityScore.toFixed(0)}%
                  </div>
                </div>
              )}
              <div>
                <div className="font-medium">Time</div>
                <div className="text-muted-foreground">
                  {new Date(selectedShot.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setSelectedShot(null)}
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BetRoomMap;