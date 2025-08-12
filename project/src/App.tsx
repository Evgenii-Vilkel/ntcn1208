import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';


// Компоненты для рисования фигур
function DrawControl({ onShapeCreated }: { onShapeCreated: (coords: any) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: {},
        polygon: {},
        rectangle: {},
        circle: {},
        marker: {},
      },
      edit: {
        featureGroup: drawnItems,
      },
    });

    if (!(map as any)._hasDrawControl) {
      map.addControl(drawControl);
      (map as any)._hasDrawControl = true;
    }

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);

      let coords: any = null;
      if (layer.getLatLngs) {
        coords = layer.getLatLngs();
      } else if (layer.getLatLng) {
        coords = layer.getLatLng();
      }

      onShapeCreated(coords);
    });

    return () => {
      map.off(L.Draw.Event.CREATED);
    };
  }, [map, onShapeCreated]);

  return null;
}

// Модальное окно
function Modal({ coords, onClose }: { coords: any; onClose: () => void }) {
  if (!coords) return null;

  // Преобразуем координаты в таблицу
  let flatCoords: { lat: number; lng: number }[] = [];
  if (Array.isArray(coords)) {
    const flatten = (arr: any[]) => {
      arr.forEach((item) => {
        if (Array.isArray(item)) {
          flatten(item);
        } else if (item.lat !== undefined && item.lng !== undefined) {
          flatCoords.push({ lat: item.lat, lng: item.lng });
        }
      });
    };
    flatten(coords);
  } else if (coords.lat && coords.lng) {
    flatCoords.push(coords);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h3>Координаты выделенной области</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>#</th>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>Широта (lat)</th>
              <th style={{ border: '1px solid #ccc', padding: '5px' }}>Долгота (lng)</th>
            </tr>
          </thead>
          <tbody>
            {flatCoords.map((c, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>{i + 1}</td>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>{c.lat.toFixed(6)}</td>
                <td style={{ border: '1px solid #ccc', padding: '5px' }}>{c.lng.toFixed(6)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onClose}
          style={{
            marginTop: '10px',
            padding: '8px 12px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [coords, setCoords] = useState<any>(null);

  return (
    <>
      <MapContainer
        center={[53.902922, 27.562122]}
        zoom={12}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawControl onShapeCreated={setCoords} />
      </MapContainer>

      <Modal coords={coords} onClose={() => setCoords(null)} />
    </>
  );
}