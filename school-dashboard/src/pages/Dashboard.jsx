import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { FaSchool } from "react-icons/fa";
import { PiStudentFill } from "react-icons/pi";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 130px)",
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ schools: [], alumnos: [] });
  const [selected, setSelected] = useState(null);

  const defaultCenter = useMemo(() => ({ lat: 13.69294, lng: -89.21819 }), []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/map-data");
      setData({
        schools: res.data?.schools || [],
        alumnos: res.data?.alumnos || [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const parseLatLng = (obj) => {
    const lat = Number(obj?.latitud);
    const lng = Number(obj?.longitud);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  };

  const makePinSvg = (color = "#2563eb") => {
    const svg = `
      <svg width="34" height="34" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="${color}" d="M12 2c-3.86 0-7 3.14-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
        <circle cx="12" cy="9" r="2.8" fill="#fff"/>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const schoolIcon = useMemo(() => {
    if (!isLoaded || !window.google?.maps) return undefined;
    return {
      url: makePinSvg("#2563eb"), // azul
      scaledSize: new window.google.maps.Size(34, 34),
      anchor: new window.google.maps.Point(17, 34),
    };
  }, [isLoaded]);

  const alumnoIcon = useMemo(() => {
    if (!isLoaded || !window.google?.maps) return undefined;
    return {
      url: makePinSvg("#ef4444"),
      scaledSize: new window.google.maps.Size(34, 34),
      anchor: new window.google.maps.Point(17, 34),
    };
  }, [isLoaded]);

  const onLoadMap = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    let added = 0;

    data.schools.forEach((s) => {
      const pos = parseLatLng(s);
      if (pos) {
        bounds.extend(pos);
        added++;
      }
    });

    data.alumnos.forEach((a) => {
      const pos = parseLatLng(a);
      if (pos) {
        bounds.extend(pos);
        added++;
      }
    });

    if (added > 0) {
      map.fitBounds(bounds);
    } else {
      map.setCenter(defaultCenter);
      map.setZoom(12);
    }
  };

  return (
    <div
      style={{
        overflow: "hidden",
        height: "calc(100vh - 90px)",
        backgroundColor: "white",
      }}
    >
      <div style={{ marginTop: 0 }}>
        {loading ? (
          <div>Cargando mapa...</div>
        ) : !isLoaded ? (
          <div>Cargando Google Maps...</div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            onClick={() => setSelected(null)}
            onLoad={onLoadMap}
            options={{
              clickableIcons: false,
              fullscreenControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            {data.schools.map((s) => {
              const pos = parseLatLng(s);
              if (!pos) return null;
              return (
                <Marker
                  key={`school-${s.id_school}`}
                  position={pos}
                  icon={schoolIcon}
                  onClick={() => setSelected({ type: "school", item: s })}
                  title={`Escuela: ${s.nombre}`}
                />
              );
            })}

            {data.alumnos.map((a) => {
              const pos = parseLatLng(a);
              if (!pos) return null;
              return (
                <Marker
                  key={`alumno-${a.id_alumno}`}
                  position={pos}
                  icon={alumnoIcon}
                  onClick={() => setSelected({ type: "alumno", item: a })}
                  title={`Alumno: ${a.nombre_completo}`}
                />
              );
            })}

            {selected && (
              <InfoWindow
                position={parseLatLng(selected.item)}
                onCloseClick={() => setSelected(null)}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -6),
                  disableAutoPan: false,
                }}
              >
                <div style={{ width: 260, padding: 12 }}>
                  {selected.type === "school" ? (
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <FaSchool size={18} />
                      <div>
                        <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                          Escuela
                        </div>
                        <div>{selected.item.nombre}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          ID: {selected.item.id_school}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <PiStudentFill size={18} />
                      <div>
                        <div style={{ fontWeight: 800, lineHeight: 1.2 }}>
                          Alumno
                        </div>
                        <div>{selected.item.nombre_completo}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          ID: {selected.item.id_alumno}
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    style={{ marginTop: 10, fontSize: 12, color: "#374151" }}
                  >
                    Lat: {selected.item.latitud} <br />
                    Lng: {selected.item.longitud}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 8,
            paddingBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#2563eb",
                display: "inline-block",
              }}
            />
            <FaSchool />
            <b>Escuelas:</b> {data.schools.length}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ef4444",
                display: "inline-block",
              }}
            />
            <PiStudentFill />
            <b>Alumnos:</b> {data.alumnos.length}
          </div>
        </div>
      </div>
    </div>
  );
}
