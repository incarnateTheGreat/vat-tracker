import React, { useCallback, useEffect, useRef, useState } from "react";
import useInterval from "use-interval";
import ReactMapGL, {
  FlyToInterpolator,
  Marker,
  NavigationControl,
} from "react-map-gl";
import useSupercluster from "use-supercluster";
// import * as d3 from "d3-ease";
import polyline from "@mapbox/polyline";
import { getDecodedFlightRoute, getVatsimData, getWeather } from "./api/api";
import { ICluster, IViewport, IFlight } from "./declaration/app";
import {
  assembleClusterData,
  getTypeOfAircraft,
  getTypeOfAircraftSelected,
} from "./helpers/utils";

function App() {
  const [viewport, setViewport] = useState<IViewport>({
    latitude: 43.7147326,
    longitude: -79.2541669,
    maxZoom: 20,
    width: "100vw",
    height: "100vh",
    zoom: 1,
  });
  const [flightData, setFlightData] = useState<IFlight[]>([]);
  const [flightRoute, setFlightRoute] = useState<number[]>([]);
  const [clusterData, setClusterData] = useState<ICluster[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ICluster | null>(null);
  const [toggleNavigationMenu, setToggleNavigationMenu] = useState<boolean>(
    false
  );
  const [latestWeatherTimestamp, setLatestWeatherTimestamp] = useState<
    number | null
  >(null);
  // const [flightSearch, setFlightSearch] = useState<string>("");
  const mapRef = useRef<any>(null);

  // Get the Data from the API Service.
  const handleGetData = useCallback(async () => {
    const data = await getVatsimData();

    if (Object.keys(data).length > 0) {
      setFlightData(data.flights);

      setClusterData(assembleClusterData(data.flights));
    }
  }, []);

  // Click on a Cluster and zoom in to its active children.
  const handleClusterClick = (
    clusterObj: ICluster,
    latitude: number,
    longitude: number
  ) => () => {
    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(clusterObj.properties.cluster_id),
      20
    );

    setViewport({
      ...viewport,
      latitude,
      longitude,
      zoom: expansionZoom,
      transitionInterpolator: new FlyToInterpolator({
        speed: 1.5,
      }),
      transitionDuration: 500,
    });
  };

  // View a Flight's details.
  const displayFlightDataView = () => {
    const isStillSelected = checkStillActive();

    if (selectedFlight && isStillSelected) {
      const {
        callsign,
        name,
        planned_aircraft,
        planned_depairport,
        planned_destairport,
        altitude,
        heading,
        groundspeed,
      } = isStillSelected;

      return (
        <div className="flight-data flight-data-enabled">
          <div>
            <h3>{callsign}</h3>
            <h5>{name}</h5>
            <div>{planned_depairport}</div>
            <div>{planned_destairport}</div>
            <div>{planned_aircraft}</div>
            <div>{altitude} FT.</div>
            <div>{heading}&deg;</div>
            <div>{groundspeed} kts</div>
          </div>
          <div
            className="flight-data-close"
            onClick={() => {
              setSelectedFlight(null);
              removeRoute();
            }}
          >
            X
          </div>
        </div>
      );
    }

    return <div className="flight-data"></div>;
  };

  // Navigation Menu
  const navigationMenu = () => {
    if (toggleNavigationMenu) {
      return (
        <div
          className={`navigation-menu ${
            toggleNavigationMenu ? "navigation-menu-enabled" : ""
          }`}
        >
          <h2>Vat-Tracker</h2>
          <div></div>
          <div
            className="navigation-menu-close"
            onClick={() => setToggleNavigationMenu(false)}
          >
            X
          </div>
        </div>
      );
    }

    return <div className="navigation-menu"></div>;
  };

  // If a Selected Flight is inside of a Cluster, highlight the Cluster to indicate this.
  const indicateFlightInCluster = (clusterObj) => {
    const flightsInClusters = supercluster.getLeaves(
      clusterObj.properties.cluster_id,
      Infinity
    );

    return flightsInClusters.find((flight: ICluster) => {
      return flight.properties.callsign === selectedFlight?.properties.callsign;
    });
  };

  // Handle the Airplane Icon type.
  const handleIcon = (flightData: ICluster, isHover?: boolean) => {
    if (flightData.properties.isController) {
      return getTypeOfAircraft("controller");
    }

    const aircraftType = getTypeOfAircraft(
      flightData.properties.planned_aircraft
    );

    // If a Flight is selected, assign the Selected Airplane Icon to it.
    if (
      selectedFlight?.properties.callsign === flightData.properties.callsign ||
      isHover
    ) {
      return getTypeOfAircraftSelected(flightData.properties.planned_aircraft);
    }

    return aircraftType;
  };

  // Get the Bounds of the Map.
  const bounds =
    mapRef && mapRef.current
      ? mapRef.current.getMap().getBounds().toArray().flat()
      : null;

  // Assign the Cluster Data, Bounds, Zoom, and other Options to Superclister.
  const { clusters, supercluster } = useSupercluster({
    points: clusterData,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 10 },
  });

  // const goToNYC = () => {
  //   const viewportNYC = {
  //     ...viewport,
  //     longitude: -74.1,
  //     latitude: 40.7,
  //     zoom: 14,
  //     transitionDuration: 2000,
  //     transitionInterpolator: new FlyToInterpolator(),
  //     transitionEasing: d3.easeQuad,
  //   };

  //   setViewport(viewportNYC);
  // };

  // Check if Selected Flight is still selected.
  const checkStillActive = useCallback(() => {
    return flightData.find(
      (flight: IFlight) =>
        selectedFlight?.properties.callsign === flight.callsign
    );
  }, [flightData, selectedFlight]);

  // Remove the Waypoints of the Selected Flight.
  const removeRoute = () => {
    const map = mapRef.current.getMap();

    if (map.getLayer("route")) {
      map.removeLayer("route").removeSource("route");
    }
  };

  // Get the Route data to draw on the screen.
  const getRoute = async (
    planned_depairport,
    planned_route,
    planned_destairport
  ) => {
    const res = await getDecodedFlightRoute(
      planned_depairport,
      planned_route,
      planned_destairport
    );

    if (res.encodedPolyline) {
      setFlightRoute(polyline.decode(res.encodedPolyline));
      drawRoute(polyline.decode(res.encodedPolyline));
    } else {
      drawRoute(null);
    }
  };

  // Draw the Waypoints of the Selected Flight.
  const drawRoute = useCallback((flightCoordinates) => {
    const map = mapRef.current.getMap();

    removeRoute();

    if (flightCoordinates) {
      const coordinates = flightCoordinates.reduce((r, acc) => {
        const [latitude, longitude] = acc;

        r.push([longitude, latitude]);

        return r;
      }, []);

      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#de3a1f",
          "line-width": 3,
        },
      });
    }
  }, []);

  const drawWeather = useCallback(
    async (isInit = false) => {
      const map = mapRef.current.getMap();

      const latestWeatherData: number[] = await getWeather();

      let timestamp: number | null = null;

      if (latestWeatherData.length > 0) {
        timestamp = latestWeatherData[latestWeatherData.length - 1];

        const drawWeatherLayer = () =>
          map.addLayer({
            id: "weatherLayer",
            type: "raster",
            source: {
              id: "weatherLayerSource",
              type: "raster",
              tiles: [
                `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/2/1_1.png`,
              ],
              tileSize: 256,
            },
            minZoom: 0,
            maxZoom: 12,
            layout: {},
            paint: {
              "raster-opacity": 0.5,
            },
          });

        // Render the Weather Layer on render. Otherwise, update it.
        if (isInit) {
          map.on("load", () => {
            drawWeatherLayer();

            setLatestWeatherTimestamp(timestamp);
          });
        } else {
          if (latestWeatherTimestamp && latestWeatherTimestamp !== timestamp) {
            map.removeLayer("weatherLayer").removeSource("weatherLayer");

            drawWeatherLayer();

            setLatestWeatherTimestamp(timestamp);
          }
        }
      }
    },
    [latestWeatherTimestamp]
  );

  const getUpdatedWeather = useCallback(
    async (isInit = false) => {
      await drawWeather(isInit);
    },
    [drawWeather]
  );

  // Continue to retrieve Flight and Weather data every 15 seconds.
  useInterval(() => {
    handleGetData();
    getUpdatedWeather();
  }, 15000);

  useEffect(() => {
    if (!checkStillActive()) {
      setSelectedFlight(null);
      drawRoute(null);
    }
  }, [checkStillActive, clusterData, drawRoute]);

  // When the app renders, get the data and continue to get the data every 15 seconds.
  useEffect(() => {
    handleGetData();
    getUpdatedWeather(true);

    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedFlight(null);
        drawRoute(null);
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleGetData, drawRoute, getUpdatedWeather]);

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/incarnate/ckc5i9a5s02w21ipgctm9js0w"
      onViewportChange={(viewportObj: IViewport) => {
        setViewport(viewportObj);
      }}
      ref={mapRef}
    >
      <div className="navigation-control">
        <NavigationControl />
      </div>

      {clusters.map((clusterObj: ICluster) => {
        const [longitude, latitude] = clusterObj.geometry.coordinates;
        const {
          cluster: isCluster,
          point_count: pointCount,
        } = clusterObj.properties;

        if (isCluster) {
          return (
            <Marker
              key={`cluster-${clusterObj.properties.cluster_id}`}
              latitude={latitude}
              longitude={longitude}
            >
              <div
                className={`cluster-marker ${
                  indicateFlightInCluster(clusterObj)
                    ? "cluster-marker-active"
                    : ""
                }`}
                onClick={handleClusterClick(clusterObj, latitude, longitude)}
                style={{
                  width: `${10 + (pointCount / clusterData.length) * 20}px`,
                  height: `${10 + (pointCount / clusterData.length) * 20}px`,
                }}
              >
                {pointCount}
              </div>
            </Marker>
          );
        }

        return (
          <Marker
            className="marker"
            key={`marker-${clusterObj.properties.callsign}`}
            latitude={latitude}
            longitude={longitude}
          >
            <img
              onClick={(e) => {
                const {
                  planned_depairport,
                  planned_route,
                  planned_destairport,
                } = clusterObj.properties;
                e.preventDefault();

                if (!clusterObj.properties.isController) {
                  setSelectedFlight(clusterObj);

                  getRoute(
                    planned_depairport,
                    planned_route,
                    planned_destairport
                  );
                }
              }}
              onMouseOver={(e) => {
                e.currentTarget.src = handleIcon(clusterObj, true);
              }}
              onMouseOut={(e) => {
                e.currentTarget.src = handleIcon(clusterObj);
              }}
              className="marker-image"
              src={handleIcon(clusterObj)}
              alt={clusterObj.properties.callsign}
              style={{
                transform: `rotate(${clusterObj.properties.heading}deg)`,
              }}
            />
          </Marker>
        );
      })}
      {/* 
      <div>
        <input
          className="search"
          name="flightSearch"
          type="text"
          value={flightSearch}
          onChange={(e) => {
            setFlightSearch(e.target.value);
          }}
        />
      </div> */}

      {
        <img
          onClick={() => setToggleNavigationMenu(!toggleNavigationMenu)}
          className="menu"
          src="/icons/menu-icon.png"
          alt="Navigation Menu"
        />
      }

      {navigationMenu()}
      {displayFlightDataView()}
    </ReactMapGL>
  );
}

export default App;
