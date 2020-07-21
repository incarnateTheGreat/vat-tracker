import React, { useCallback, useEffect, useRef, useState } from "react";
import useInterval from "use-interval";
import ReactMapGL, {
  FlyToInterpolator,
  Marker,
  NavigationControl,
} from "react-map-gl";
import useSupercluster from "use-supercluster";
import * as d3 from "d3-ease";
import polyline from "@mapbox/polyline";

import {
  fetchRoute,
  getDecodedFlightRoute,
  getVatsimData,
  getWeather,
  getFlights,
  getFlight,
} from "./api/api";
import {
  ICluster,
  IClusterTwo,
  IViewport,
  IFlightTwoDetails,
  IFlightTwo,
} from "./declaration/app";
import {
  assembleClusterData,
  drawWeatherLayer,
  getTypeOfAircraft,
  getTypeOfAircraftSelected,
} from "./helpers/utils";

function App() {
  const [viewport, setViewport] = useState<IViewport>({
    latitude: 43.7147326,
    longitude: -79.2541669,
    maxZoom: 20,
    // width: "100vw",
    height: "100vh",
    width: "100%",
    zoom: 1,
  });
  const [flightData, setFlightData] = useState<IFlightTwo[]>([]);
  const [clusterData, setClusterData] = useState<ICluster[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<IClusterTwo | null>(
    null
  );
  const [toggleNavigationMenu, setToggleNavigationMenu] = useState<boolean>(
    false
  );
  const [latestWeatherTimestamp, setLatestWeatherTimestamp] = useState<
    number | null
  >(null);
  const [flightSearch, setFlightSearch] = useState<string>("");
  const mapRef = useRef<any>(null);

  const handleGetExperimentalFlightData = useCallback(async () => {
    const data = await getFlights();

    // setFlightDataEpx(data.active_flights);

    if (Object.keys(data).length > 0) {
      setFlightData(data.active_flights);

      setClusterData(assembleClusterData(data.active_flights));
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
        real_name,
        current_altitude,
        current_ground_speed,
        current_heading,
        planned_aircraft,
        planned_dep_airport__icao,
        planned_dep_airport__name,
        planned_dest_airport__icao,
        planned_dest_airport__name,
      } = isStillSelected;

      return (
        <div className="flight-data flight-data-enabled">
          <div>
            <h3>{callsign}</h3>
            <h5>{real_name}</h5>
            <div>
              {planned_dep_airport__icao} ({planned_dep_airport__name})
            </div>
            <div>
              {planned_dest_airport__icao} ({planned_dest_airport__name})
            </div>
            <div>{planned_aircraft}</div>
            <div>{current_altitude} FT.</div>
            <div>{current_heading}&deg;</div>
            <div>{current_ground_speed} kts</div>
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
          <div className="navigation-menu-top">
            <h2>Vat-Tracker</h2>
            <div
              className="navigation-menu-close"
              onClick={() => setToggleNavigationMenu(false)}
            >
              X
            </div>
          </div>

          <nav className="navigation-menu-links">
            <input
              className="search"
              name="flightSearch"
              type="text"
              value={flightSearch}
              onChange={(e) => {
                setFlightSearch(e.target.value.toUpperCase());
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  const res = clusterData.find(
                    (flight: ICluster) =>
                      flight.properties.callsign === flightSearch
                  );

                  if (res) {
                    selectFlight(res);
                    setToggleNavigationMenu(false);
                  }
                }
              }}
            />
          </nav>
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
      return flight.properties.callsign === selectedFlight?.callsign;
    });
  };

  // Handle the Airplane Icon type.
  const handleIcon = (flightData: ICluster, isHover?: boolean) => {
    // if (flightData.properties.isController) {
    //   return getTypeOfAircraft("controller");
    // }

    const aircraftType = getTypeOfAircraft(
      flightData.properties.planned_aircraft
    );

    // If a Flight is selected, assign the Selected Airplane Icon to it.
    if (
      selectedFlight?.callsign === flightData.properties.callsign ||
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

  // Check if Selected Flight is still selected.
  const checkStillActive = useCallback(() => {
    return flightData.find(
      (flight: IFlightTwo) => selectedFlight?.callsign === flight.callsign
    );
  }, [flightData, selectedFlight]);

  // Get the Route data to draw on the screen.
  const getRoute = async (
    location,
    planned_depairport,
    planned_route,
    planned_destairport
  ) => {
    const res = await getDecodedFlightRoute(
      planned_depairport,
      planned_route,
      planned_destairport
    );

    // console.log(res, polyline.decode(res.encodedPolyline));

    console.log(fetchRoute(res.id));

    if (res.encodedPolyline) {
      drawRoute(polyline.decode(res.encodedPolyline), location);
    } else {
      drawRoute(null);
    }
  };

  // Remove the Waypoints of the Selected Flight.
  const removeRoute = () => {
    const map = mapRef.current.getMap();

    if (map.getLayer("route")) {
      // Remove Route and its source.
      map.removeLayer("route").removeSource("route");

      // Remove the Waypoints and its source.
      map.removeLayer("route-points").removeSource("route-points");
    }
  };

  // Draw the Waypoints of the Selected Flight.
  const drawRoute = useCallback((flightCoordinates, location?) => {
    const map = mapRef.current.getMap();

    removeRoute();

    if (flightCoordinates && location) {
      const { longitude, latitude } = location;

      const coordinates = flightCoordinates.reduce((r, acc) => {
        const [latitudeCoords, longitudeCoords] = acc;

        r.push([longitudeCoords, latitudeCoords]);

        return r;
      }, []);

      const parseCoordsData = coordinates.reduce((r, acc) => {
        const obj = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: acc,
          },
          properties: {
            title: "Garry",
          },
        };

        r.push(obj);

        return r;
      }, []);

      console.log(parseCoordsData);

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

      map.addLayer({
        id: "route-points",
        type: "symbol",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: parseCoordsData,
          },
        },
        layout: {
          // get the title name from the source's "title" property
          "text-field": ["get", "title"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
        },
      });

      const navigateToFlight = {
        ...viewport,
        longitude,
        latitude,
        zoom: 5,
        transitionDuration: 2000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeQuad,
      };

      setViewport(navigateToFlight);

      // const [first, last] = [
      //   coordinates[0],
      //   coordinates[coordinates.length - 1],
      // ];

      // console.log(first, last);

      // map.fitBounds([first, last]);

      // const bounds = coordinates.reduce(function (bounds, coord) {
      //   return bounds.extend(coord);
      // }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

      // map.fitBounds(bounds, {
      //   padding: 20,
      // });

      // console.log(bounds);
    }
  }, []);

  const drawWeather = useCallback(
    async (isInit = false) => {
      const map = mapRef.current.getMap();

      // Get the latest Weather Data Epoch Timestamps.
      const latestWeatherData: number[] = await getWeather();

      let timestamp: number | null = null;

      if (latestWeatherData.length > 0) {
        timestamp = latestWeatherData[latestWeatherData.length - 1];

        // Render the Weather Layer on render. Otherwise, update it.
        if (isInit) {
          map.on("load", () => {
            drawWeatherLayer(map, timestamp);

            setLatestWeatherTimestamp(timestamp);
          });
        } else {
          if (latestWeatherTimestamp && latestWeatherTimestamp !== timestamp) {
            map.removeLayer("weatherLayer").removeSource("weatherLayer");

            drawWeatherLayer(map, timestamp);

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

  const selectFlight = async (flight: ICluster) => {
    const getSelectedFlightData: IFlightTwoDetails = await getFlight(
      flight.properties.id
    );

    const { current_latitude, current_longitude } = getSelectedFlightData;

    setSelectedFlight(getSelectedFlightData);

    getRoute(
      { latitude: current_latitude, longitude: current_longitude },
      getSelectedFlightData.planned_dep_airport.icao,
      getSelectedFlightData.planned_route,
      getSelectedFlightData.planned_dest_airport.icao
    );
  };

  // Continue to retrieve Flight and Weather data every 15 seconds.
  useInterval(() => {
    handleGetExperimentalFlightData();
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
    handleGetExperimentalFlightData();
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
  }, [handleGetExperimentalFlightData, drawRoute, getUpdatedWeather]);

  useEffect(() => {
    const map = mapRef.current.getMap();

    // map.on("resize", () => {
    //   console.log("resizing...");
    // });
  }, []);

  useInterval(() => {
    handleGetExperimentalFlightData();
  }, 15000);

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
                e.preventDefault();

                // if (!clusterObj.properties.isController) {
                selectFlight(clusterObj);
                // }
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
                transform: `rotate(${clusterObj.properties.current_heading}deg)`,
              }}
            />
          </Marker>
        );
      })}

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
