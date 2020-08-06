import React, { useCallback, useEffect, useRef, useState } from "react";
import useInterval from "use-interval";
import ReactMapGL, {
  FlyToInterpolator,
  Marker,
  NavigationControl,
} from "react-map-gl";
import useSupercluster from "use-supercluster";
import * as d3 from "d3-ease";

// APIs
import {
  fetchRoute,
  getAirport,
  getDecodedFlightRoute,
  getMETAR,
  getTAF,
  getWeather,
  getFlights,
  getFlight,
} from "./api/api";

// Interfaces
import {
  IAirport,
  ICluster,
  IClusterDetails,
  IMetar,
  ITAF,
  IViewport,
  IFlightVatStatsDetails,
  IFlightVatStats,
} from "./declaration/app";

// Utilities
import {
  assembleClusterData,
  drawWeatherLayer,
  getTypeOfAircraft,
  getTypeOfAircraftSelected,
} from "./helpers/utils";

// Components
import { AirportData } from "./components/AirportData/airport-data.component";
import { FlightData } from "./components/FlightData/flight-data.component";
import { NavigationMenu } from "./components/NavigationMenu/navigation-menu.component";
import { Spinner } from "./components/Spinner/spinner.component";

function App() {
  const [viewport, setViewport] = useState<IViewport>({
    latitude: 0,
    longitude: 0,
    maxZoom: 20,
    height: "100vh",
    width: "100%",
    zoom: 1,
  });
  const [flightData, setFlightData] = useState<IFlightVatStats[] | null>([]);
  const [plannedDepartures, setPlannedDepartures] = useState<
    IFlightVatStats[] | null
  >([]);
  const [clusterData, setClusterData] = useState<ICluster[]>([]);
  const [icaoData, setIcaoData] = useState<object[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<IClusterDetails | null>(
    null
  );
  const [displaySelectedFlight, setDisplaySelectedFlight] = useState<boolean>(
    false
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAirport, setSelectedAirport] = useState<IAirport | null>(null);
  const [displaySelectedAirport, setDisplaySelectedAirport] = useState<boolean>(
    false
  );
  const [toggleNavigationMenu, setToggleNavigationMenu] = useState<boolean>(
    false
  );
  const [latestWeatherTimestamp, setLatestWeatherTimestamp] = useState<
    number | null
  >(null);
  const [icaoInput, setIcaoInput] = useState<string>("");

  const mapRef = useRef<any>(null);

  const [superClusterData, setSuperClusterData] = useState({
    points: clusterData,
    bounds:
      mapRef && mapRef.current
        ? mapRef.current.getMap().getBounds().toArray().flat()
        : null,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 10 },
  });

  const handleGetFlightData = useCallback(async () => {
    const data = await getFlights();

    if (typeof data === "object" && Object.keys(data).length > 0) {
      setFlightData(data.active_flights);
      setPlannedDepartures(data.departures);
      setClusterData(assembleClusterData(data.active_flights));
    } else {
      setTimeout(() => {
        setFlightData(null);
      }, 2000);
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

  // Assign the Cluster Data, Bounds, Zoom, and other Options to Superclister.
  const { clusters, supercluster } = useSupercluster(superClusterData);

  // Check if Selected Flight is still selected.
  const checkStillActive = useCallback(() => {
    return (
      flightData?.find(
        (flight: IFlightVatStats) =>
          selectedFlight?.callsign === flight.callsign
      ) ?? null
    );
  }, [flightData, selectedFlight]);

  // Get the Route data to draw on the screen.
  const getRoute = async (
    location,
    planned_depairport,
    planned_route,
    planned_destairport,
    transitionToFlightLoc
  ) => {
    const decodedFlightRoute = await getDecodedFlightRoute(
      planned_depairport,
      planned_route,
      planned_destairport
    );

    const routeData = await fetchRoute(decodedFlightRoute.id);

    if (decodedFlightRoute.encodedPolyline) {
      drawRoute(routeData.route.nodes, location, transitionToFlightLoc);
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
      map.removeLayer("route-idents").removeSource("route-idents");

      if (map.getLayer("route-points")) {
        // Remove the Waypoints circles..
        map.removeLayer("route-points").removeSource("route-points");
      }
    }
  };

  // Draw the Waypoints of the Selected Flight.
  const drawRoute = useCallback(
    (flightCoordinates, location?, transitionToFlightLoc = false) => {
      const map = mapRef.current.getMap();

      removeRoute();

      if (flightCoordinates && location) {
        // Assemble Coordinates.
        const coordinates = flightCoordinates.reduce((r, acc) => {
          const { lon, lat } = acc;

          r.push([lon, lat]);

          return r;
        }, []);

        var createGeoJSONCircle = function (
          { latitude, longitude },
          radiusInKm = 10,
          points
        ) {
          if (!points) points = 64;

          // var coords = {
          //     latitude: center[1],
          //     longitude: center[0]
          // };

          var km = radiusInKm;

          var ret: any[] = [];
          var distanceX = km / (111.32 * Math.cos((latitude * Math.PI) / 180));
          var distanceY = km / 110.574;

          console.log(distanceX, distanceY);

          var theta, x, y;
          for (var i = 0; i < points; i++) {
            theta = (i / points) * (2 * Math.PI);
            x = distanceX * Math.cos(theta);
            y = distanceY * Math.sin(theta);

            ret.push([longitude + x, latitude + y]);
          }
          ret.push(ret[0]);

          return {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [ret],
                  },
                },
              ],
            },
          };
        };

        // Assemble GeoJSON Data.
        const parseCoordsData = flightCoordinates.reduce((r, acc) => {
          const { lon, lat, ident } = acc;

          const obj = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lon, lat],
            },
            properties: {
              title: ident,
            },
          };

          r.push(obj);

          return r;
        }, []);

        // Draw the Route Line.
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

        // Draw the Route Waypoint Idents.
        map.addLayer({
          id: "route-idents",
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
            "text-offset": [0, 0.5],
            "text-anchor": "top",
          },
        });

        // Draw the Route Waypoint circles..
        // map.addSource(
        //   "polygon",
        //   createGeoJSONCircle(
        //     { latitude: 41.58527859, longitude: -93.6248586 },
        //     10,
        //     0.5
        //   )
        // );

        // map.addLayer({
        //   id: "polygon",
        //   type: "fill",
        //   source: "polygon",
        //   layout: {},
        //   paint: {
        //     "fill-color": "red",
        //     "fill-opacity": 1,
        //   },
        // });

        // map.addLayer({
        //   id: "route-points",
        //   type: "circle",
        //   source: {
        //     type: "geojson",
        //     features: [
        //       {
        //         type: "Feature",
        //         geometry: {
        //           type: "Point",
        //           coordinates: [49.8537377, -97.2923063],
        //         },
        //       },
        //     ],
        //   },
        //   // layout: {
        //   //   visibility: "none",
        //   // },
        //   paint: {
        //     "circle-radius": 10,
        //     "circle-color": "#5b94c6",
        //     "circle-opacity": 1,
        //   },
        // });

        if (transitionToFlightLoc) {
          navigateToFlight(location);
        }

        // const [first, last] = [
        //   coordinates[0],
        //   coordinates[coordinates.length - 1],
        // ];

        // map.fitBounds([first, last], {
        //   padding: 20,
        // });

        // setSuperClusterData({
        //   ...superClusterData,
        //   bounds: [first, last],
        // });
      }
    },
    []
  );

  const navigateToFlight = (location) => {
    const { longitude, latitude } = location;

    setViewport({
      ...viewport,
      longitude,
      latitude,
      zoom: 5,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: d3.easeQuad,
    });
  };

  const navigateToAirport = async (location) => {
    const { longitude, latitude } = location;

    const offset = 0.095;

    // Get the Departures for the Selected Airport from the Departures data.
    const departures = flightData?.filter(
      (departure) => location.icao === departure.planned_dep_airport__icao
    );

    // Get the Arrivals for the Selected Airport from the Active Flight data.
    const arrivals = flightData?.filter(
      (arrival) => location.icao === arrival.planned_dest_airport__icao
    );

    console.log(flightData);

    console.log(arrivals);

    setViewport({
      ...viewport,
      longitude: longitude + offset,
      latitude,
      zoom: 12,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: d3.easeQuad,
    });
  };

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

  const selectFlight = async (
    flight: ICluster,
    transitionToFlightLoc: boolean = false
  ) => {
    const selectedFlightData: IFlightVatStatsDetails = await getFlight(
      flight.properties.id
    );

    const { current_latitude, current_longitude } = selectedFlightData;

    setSelectedFlight(selectedFlightData);

    await getRoute(
      { latitude: current_latitude, longitude: current_longitude },
      selectedFlightData.planned_dep_airport.icao,
      selectedFlightData.planned_route,
      selectedFlightData.planned_dest_airport.icao,
      transitionToFlightLoc
    );
  };

  // Deselect the Flight.
  const deselectFlightFunc = useCallback(() => {
    setSelectedFlight(null);
    setDisplaySelectedFlight(false);
    removeRoute();
  }, []);

  // Deselect the Airport.
  const deselectAirportFunc = useCallback(() => {
    setSelectedAirport(null);
    setDisplaySelectedAirport(false);
  }, []);

  // Select the Flight.
  const selectFlightFunc = async (
    flight,
    transitionToFlightLoc: boolean = false
  ) => {
    setLoading(true);

    // Disable the Selected Flight to clear the screen and allow for the new selection to load togerther.
    if (selectedFlight) {
      setSelectedFlight(null);
    }

    await selectFlight(flight, transitionToFlightLoc);

    setLoading(false);

    setDisplaySelectedAirport(false);

    if (!transitionToFlightLoc) {
      setDisplaySelectedFlight(true);
    }
  };

  // Go through the process of Selecting an Airport.
  const selectAirportFunc = async (icao) => {
    deselectFlightFunc();
    deselectAirportFunc();
    setToggleNavigationMenu(false);
    setLoading(true);

    let airportData = await getAirport(icao);
    const taf: ITAF = await getTAF(airportData.icao);
    const metar: IMetar = await getMETAR(airportData.icao);

    airportData = {
      ...airportData,
      weather: {
        ...taf,
        ...metar["M"]["decoded"],
        metar_raw: metar["M"]["report"],
      },
    };

    await navigateToAirport(airportData);

    setLoading(false);
    setSelectedAirport(airportData);
    setDisplaySelectedAirport(true);
  };

  // Continue to retrieve Flight and Weather data every 15 seconds.
  useInterval(() => {
    handleGetFlightData();
    getUpdatedWeather();
  }, 15000);

  useEffect(() => {
    if (!checkStillActive()) {
      deselectFlightFunc();
    }
  }, [checkStillActive, clusterData, drawRoute, deselectFlightFunc]);

  // When the app renders, get the data and continue to get the data every 15 seconds.
  useEffect(() => {
    handleGetFlightData();
    getUpdatedWeather(true);

    const listener = (e) => {
      if (e.key === "Escape") {
        deselectFlightFunc();
        deselectAirportFunc();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [
    handleGetFlightData,
    drawRoute,
    getUpdatedWeather,
    deselectFlightFunc,
    deselectAirportFunc,
  ]);

  useInterval(() => {
    handleGetFlightData();
  }, 15000);

  useEffect(() => {
    const bounds =
      mapRef && mapRef.current
        ? mapRef.current.getMap().getBounds().toArray().flat()
        : null;

    setSuperClusterData({
      points: clusterData,
      bounds,
      zoom: viewport.zoom,
      options: { radius: 75, maxZoom: 10 },
    });
  }, [clusterData, viewport.zoom]);

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/incarnate/ckc5i9a5s02w21ipgctm9js0w"
      onViewportChange={(viewportObj: IViewport) => {
        setViewport({ ...viewportObj, height: "100vh", width: "100%" });
      }}
      onTransitionEnd={() => {
        if (selectedFlight && !displaySelectedFlight) {
          setDisplaySelectedFlight(true);
        }
      }}
      ref={mapRef}
    >
      {flightData &&
        clusters.map((clusterObj: ICluster) => {
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

                  selectFlightFunc(clusterObj);
                  setDisplaySelectedFlight(false);
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

      <div className="navigation-control">
        <NavigationControl />
      </div>

      <Spinner isEnabled={loading} />

      <div className={`no-data ${!flightData && "no-data-enabled"}`.trim()}>
        No data.
      </div>

      <NavigationMenu
        toggleNavigationMenu={toggleNavigationMenu}
        clusterData={clusterData}
        setToggleNavigationMenu={setToggleNavigationMenu}
        selectFlightFunc={selectFlightFunc}
        setDisplaySelectedFlight={setDisplaySelectedFlight}
        setIcaoInput={setIcaoInput}
        setIcaoData={setIcaoData}
        selectAirportFunc={selectAirportFunc}
        icaoData={icaoData}
      />

      {selectedFlight && (
        <FlightData
          selectedFlight={selectedFlight}
          displaySelectedFlight={displaySelectedFlight}
          checkStillActive={checkStillActive}
          deselectFlightFunc={deselectFlightFunc}
        />
      )}

      {selectedAirport && (
        <AirportData
          deselectAirportFunc={deselectAirportFunc}
          selectedAirport={selectedAirport}
          displaySelectedAirport={displaySelectedAirport}
        />
      )}
    </ReactMapGL>
  );
}

export default App;
