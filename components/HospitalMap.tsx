"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

const HOSPITAL: [number, number] = [67.08408, 24.90882];
const MAP_LINK =
  "https://www.openstreetmap.org/?mlat=24.90882&mlon=67.08408#map=17/24.90882/67.08408";

export default function HospitalMap({
  expanded = false,
}: {
  expanded?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let disposed = false;
    let started = false;
    let resize: ResizeObserver | undefined;
    let theme: MutationObserver | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const style = () =>
      `https://tiles.openfreemap.org/styles/positron?theme=${document.documentElement.dataset.theme === "dark" ? "dark" : "light"}`;

    async function initialize() {
      if (started || !element || disposed) return;
      // A hidden mobile preview should not download tiles.
      if (!expanded && !element.getBoundingClientRect().width) return;
      started = true;
      setStatus("loading");
      try {
        const {
          Map,
          Marker,
          Popup,
          NavigationControl,
          setWorkerUrl,
        } = await import("maplibre-gl");
        if (disposed) return;
        setWorkerUrl("/maplibre-worker.js");
        const map = new Map({
          container: element,
          style: style(),
          center: [69.3, 29.5],
          zoom: expanded ? 4.2 : 3.6,
          interactive: expanded,
          scrollZoom: false,
          attributionControl: false,
          renderWorldCopies: false,
        });
        mapRef.current = map;
        // Reapply after every theme style load; keep route numbers untouched.
        map.on("style.load", () => {
          const dark = document.documentElement.dataset.theme === "dark";
          for (const layer of map.getStyle().layers) {
            // Keep Positron's layers, zoom thresholds, and label density in both themes.
            if (dark) {
              if (layer.type === "background") {
                map.setPaintProperty(layer.id, "background-color", "#20221f");
              } else if (layer.type === "fill") {
                map.setPaintProperty(
                  layer.id,
                  "fill-color",
                  layer.id.includes("water") ? "#171b1d" : "#272b27",
                );
              } else if (layer.type === "line") {
                map.setPaintProperty(layer.id, "line-color", "#41463f");
              } else if (
                layer.type === "symbol" &&
                layer.layout?.["text-field"]
              ) {
                map.setPaintProperty(layer.id, "text-color", "#a4aaa0");
                map.setPaintProperty(layer.id, "text-halo-color", "#20221f");
              }
            }
            if (layer.type !== "symbol" || !layer.layout?.["text-field"])
              continue;
            const field = JSON.stringify(layer.layout["text-field"]);
            if (!field.includes('"name')) continue;
            map.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name:en"],
              ["get", "name_en"],
              ["get", "name:latin"],
              "",
            ]);
          }
        });
        const pin = new Marker({ color: "#319b91" }).setLngLat(HOSPITAL);
        if (expanded) {
          pin.setPopup(
            new Popup({ offset: 28 }).setText(
              "Ashfaq Memorial Hospital · University Road, Karachi",
            ),
          );
          map.addControl(
            new NavigationControl({ showCompass: false }),
            "top-right",
          );
        }
        pin.addTo(map);
        timeout = setTimeout(() => {
          if (!disposed && !map.isStyleLoaded()) setStatus("error");
        }, 15000);
        map.once("load", () => {
          if (disposed) return;
          clearTimeout(timeout);
          setStatus("ready");
          if (expanded) {
            const reduced = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            map.flyTo({
              center: HOSPITAL,
              zoom: 15.5,
              duration: reduced ? 0 : 2400,
            });
          }
        });
        map.on("error", (event) => {
          console.error("Hospital map: map resource failed", event.error);
        });
        resize = new ResizeObserver(() => map.resize());
        resize.observe(element);
        let currentStyle = style();
        theme = new MutationObserver(() => {
          const nextStyle = style();
          if (nextStyle !== currentStyle) {
            currentStyle = nextStyle;
            map.setStyle(nextStyle);
          }
        });
        theme.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      } catch (error) {
        console.error("Hospital map could not initialize", error);
        if (!disposed) setStatus("error");
      }
    }

    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void initialize();
      },
      { rootMargin: "150px" },
    );
    visibility.observe(element);
    return () => {
      disposed = true;
      visibility.disconnect();
      resize?.disconnect();
      theme?.disconnect();
      clearTimeout(timeout);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [expanded, attempt]);

  return (
    <>
      <div
        className={`hospital-map ${expanded ? "hospital-map-expanded" : "hospital-map-preview"}`}
      >
        <div
          ref={container}
          className="hospital-map-canvas"
          aria-label="Map of Ashfaq Memorial Hospital in Karachi, Pakistan"
        />
        {status === "loading" && (
          <div className="map-loading" role="status">
            Loading map…
          </div>
        )}
        {status === "error" && (
          <div className="map-fallback" role="status">
            <p>The map couldn&apos;t load.</p>
            <a href={MAP_LINK} target="_blank" rel="noopener noreferrer">
              View hospital on OpenStreetMap ↗
            </a>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </>
  );
}
