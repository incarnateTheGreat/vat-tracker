import React, { useCallback, useEffect, useRef, useState } from "react";
import useInterval from "use-interval";
import ReactMapGL, {
  FlyToInterpolator,
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl";
import useSupercluster from "use-supercluster";
import * as d3 from "d3-ease";
import { format } from "date-fns";
import { getTypeOfAircraft, handleDTG } from "./helpers/utils";

// APIs
import {
  fetchRoute,
  getAirport,
  getDecodedFlightRoute,
  getMETAR,
  getTAF,
  getWeather,
  getFIRs,
  getVatsimData,
  getFlightVatStats,
  getFlight,
} from "./api/api";

// Interfaces
import {
  IAirport,
  ICluster,
  IClusterDetails,
  IControllers,
  IMetar,
  ITAF,
  IViewport,
  IFlightVatStatsDetails,
  IFlightVatStats,
  IFirs,
  IFirPopup,
} from "./declaration/app";

// Utilities
import {
  assembleFlightData,
  assembleClusterDataTest,
  drawWeatherLayer,
  getTypeOfAircraftIcon,
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
  const [controllers, setControllers] = useState<IControllers[] | null>([]);
  const [onlineFirs, setOnlineFirs] = useState<IFirs[]>([]);
  const [clusterData, setClusterData] = useState<ICluster[]>([]);
  const [icaoData, setIcaoData] = useState<object[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<IClusterDetails | null>(
    null
  );
  const [displaySelectedFlight, setDisplaySelectedFlight] = useState<boolean>(
    false
  );
  const [loading, setLoading] = useState<boolean>(true);
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
  const [displayPopup, setDisplayPopup] = useState<ICluster | null>(null);
  const mapRef = useRef<any>(null);

  const [showPopup, setShowPopup] = useState<IFirPopup | null>(null);

  // Create the Cluster Data.
  const [superClusterData, setSuperClusterData] = useState({
    points: clusterData,
    bounds:
      mapRef && mapRef.current
        ? mapRef.current.getMap().getBounds().toArray().flat()
        : null,
    zoom: viewport.zoom,
    options: { radius: 200, maxZoom: 10 },
  });

  // Assign the Flight and Cluster Data.
  const handleGetFlightData = useCallback(async () => {
    let { controllers, flights } = await getVatsimData();

    if (typeof flights === "object" && Object.keys(flights).length > 0) {
      setControllers(controllers);
      setFlightData(assembleFlightData([...flights]));
      setClusterData(assembleClusterDataTest([...flights]));
    } else {
      setTimeout(() => {
        setFlightData(null);
      }, 2000);
    }
  }, []);

  // Draw the Online FIRs
  const drawOnlineFIRs = useCallback((onlineFirs) => {
    if (Object.keys(onlineFirs).length > 0) {
      const map = mapRef.current.getMap();

      // Get the existing FIR Layer Keys.
      const firLayers = mapRef.current
        .getMap()
        .getStyle()
        .layers.filter(
          (layer) => layer.id.includes("FIR-") && layer.type === "fill"
        )
        .map((layer) => layer.id.replace("FIR-", ""));

      // Get the updated online FIR Keys.
      const onlineFirKeys = Object.keys(onlineFirs);

      // Loop through the Online FIR Keys to determine what are currently rendered and what should be removed if no longer active.
      for (const fir of onlineFirKeys) {
        const { bounds, members, fir: firData } = onlineFirs[fir];
        const { icao: firIcao, name, prefix } = firData;

        const lineBoundaries: number[][] = [];

        if (!map.getLayer(`FIR-${firIcao}`) && bounds?.length > 0) {
          // Extract and correct the Boundaries for the FIRs.
          const boundaries = bounds[0].reduce((r: object[], acc) => {
            const [lng, lat] = acc;

            // Convert the Lat and Lngs from Strings to Numbers.
            r.push([+lat, +lng]);

            lineBoundaries.push([+lat, +lng]);

            return r;
          }, []);

          // To complete the trace of a Line around the Boundary, add the first point to the end of the Line Boundaries Array.
          lineBoundaries.push(lineBoundaries[0]);

          // Draw the polygon area.
          map.addLayer({
            id: `FIR-${firIcao}`,
            type: "fill",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {
                  members: { ...members },
                  name,
                  prefix,
                },
                geometry: {
                  type: "Polygon",
                  coordinates: [boundaries],
                },
              },
            },
            layout: {},
            paint: {
              "fill-color": "#1978c8",
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                1,
                0.2,
              ],
            },
          });

          // Give the FIR Boundary a thicker border with a Line.
          map.addLayer({
            id: `FIR-${firIcao}-LINE`,
            type: "line",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: lineBoundaries,
                },
              },
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#5b94c6",
              "line-width": 3,
              "line-opacity": 0.5,
            },
          });
        }
      }

      // Loop through the active FIR Layers. If they're no longer active, then remove them from the map.
      for (const firKey of firLayers) {
        if (!onlineFirKeys.includes(firKey)) {
          map.removeLayer(`FIR-${firKey}`).removeSource(`FIR-${firKey}`);
          map
            .removeLayer(`FIR-${firKey}-LINE`)
            .removeSource(`FIR-${firKey}-LINE`);
        }
      }
    }
  }, []);

  // Get FIRs data
  const handleGetFIRsData = useCallback(async () => {
    const data = await getFIRs();

    setOnlineFirs(data);

    drawOnlineFIRs(data);
  }, [drawOnlineFIRs]);

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
    let aircraftIcon;

    // TODO: Handle Controllers with new API.
    // if (flightData.properties.isController) {
    //   aircraftIcon = getTypeOfAircraftIcon("controller");
    // } else {
    aircraftIcon = getTypeOfAircraftIcon(flightData.properties.aircraft_short);
    // }

    // If a Flight is selected, assign the Selected Airplane Icon to it.
    if (
      selectedFlight?.callsign === flightData.properties.callsign ||
      (isHover && !flightData.properties.isController)
    ) {
      aircraftIcon = getTypeOfAircraftSelected(
        flightData.properties.aircraft_short
      );
    }

    return aircraftIcon;
  };

  // Assign the Cluster Data, Bounds, Zoom, and other Options to Superclister.
  const { clusters, supercluster } = useSupercluster(superClusterData);

  // Check if Selected Flight is still selected.
  const checkStillActive = useCallback(() => {
    return (
      (selectedFlight &&
        flightData?.find((flight: IFlightVatStats) => {
          return selectedFlight?.callsign === flight.callsign;
        })) ??
      null
    );
  }, [flightData, selectedFlight]);

  // Get the Route data to draw on the screen.
  const getRoute = async (
    location,
    planned_depairport,
    planned_route,
    completed_route,
    planned_destairport,
    transitionToFlightLoc,
    isInit
  ) => {
    if (planned_depairport && planned_destairport && isInit) {
      const decodedFlightRoute = await getDecodedFlightRoute(
        planned_depairport,
        planned_route,
        planned_destairport
      );

      // Draw out the Polyline route, but only if the service successfully returns data.
      // if (decodedFlightRoute.encodedPolyline) {
      const routeData = await fetchRoute(decodedFlightRoute.id);

      drawPlannedRoute(
        routeData.route?.nodes ?? null,
        location,
        transitionToFlightLoc
      );
      // }
    }

    if (completed_route) {
      drawCompletedRoute(completed_route, location);
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

      // Remove the Waypoints idents.
      map.removeLayer("route-points").removeSource("route-points");
    }

    if (map.getLayer("route-completed")) {
      map.removeLayer("route-completed").removeSource("route-completed");
    }
  };

  // In the event that the Aircraft is travelling across the Anti-Merdian (180 deg. Longitude), make sure the Route line continues drawing successfully.
  const handleAntiMeridian = (coordinates) => {
    for (let coord = 0; coord < coordinates?.length; coord++) {
      if (coord > 0) {
        let lonPointA = coordinates[coord - 1][0];
        let lonPointB = coordinates[coord][0];

        if (lonPointB - lonPointA > 180) {
          coordinates[coord][0] += -360;
        } else if (lonPointA - lonPointB > 180) {
          coordinates[coord][0] += 360;
        } else {
          coordinates[coord][0] += 0;
        }
      }
    }
  };

  // Navigate the view to the selected flight.
  const navigateToFlight = useCallback(
    (location) => {
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
    },
    [viewport]
  );

  // Navigate the view to the selected Controller.
  const navigateToController = useCallback(
    (location) => {
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
    },
    [viewport]
  );

  // Draw the Waypoints of the Selected Flight.
  const drawPlannedRoute = useCallback(
    (flightCoordinates, location?, transitionToFlightLoc = false) => {
      if (flightCoordinates && location) {
        removeRoute();

        // Assemble Coordinates.
        const coordinates = flightCoordinates.reduce((r, acc) => {
          const { lon, lat } = acc;

          r.push([lon, lat]);

          return r;
        }, []);

        // Handle the Anti-Merdian Line.
        handleAntiMeridian(coordinates);

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
        mapRef.current.getMap().addLayer({
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
            "line-round-limit": 10,
          },
          paint: {
            "line-color": "#5b94c6",
            "line-width": 3,
            "line-opacity": 0.5,
          },
        });

        // Draw the Route Waypoint Idents.
        mapRef.current.getMap().addLayer({
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
            // Get the title name from the source's "title" property.
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.5],
            "text-size": 12,
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#202",
            "text-halo-color": "#fff",
            "text-halo-width": 50,
          },
        });

        // Draw the Route Waypoint Circle Points.
        mapRef.current.getMap().addLayer({
          id: "route-points",
          type: "circle",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: parseCoordsData,
            },
          },
          paint: {
            // Use get expression to get the radius property. Divided by 10 to be able to display it.
            "circle-radius": ["/", ["get", "radius"], 110],
            "circle-color": "#426d93",
          },
        });
      }

      if (transitionToFlightLoc) {
        navigateToFlight(location);
      }
    },
    [navigateToFlight]
  );

  const drawCompletedRoute = (completed_route, location) => {
    // Assemble Completed Coordinates.
    const completedRouteCoordinates = completed_route?.reduce((r, acc) => {
      const { latitude, longitude } = acc;

      r.push([longitude, latitude]);

      return r;
    }, []);

    // In a hacky way to align the flight data with the latest drawn element of the Completed Route,
    // apply the latest point to the line from the Cluster Data in an attempt to properly connect the plane with the data.
    completedRouteCoordinates.push([location.longitude, location.latitude]);

    // Handle the Anti-Merdian Line for the Completed Route.
    handleAntiMeridian(completedRouteCoordinates);

    if (mapRef.current.getMap().getLayer("route-completed")) {
      mapRef.current
        .getMap()
        .getSource("route-completed")
        .setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: completedRouteCoordinates,
          },
        });
    } else {
      // Draw the Completed Route based on real-time data.
      mapRef.current.getMap().addLayer({
        id: "route-completed",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: completedRouteCoordinates,
            },
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
          "line-round-limit": 10,
        },
        paint: {
          "line-width": ["get", "width"],
          "line-dasharray": [4, 4],
          "line-color": "red",
        },
      });
    }
  };

  // Navigate the view to the selected airport.
  const navigateToAirport = (location) => {
    const { longitude, latitude } = location;

    const offset = 0.095;

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

  // Draw the Weather on the map.
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
          drawWeatherLayer(map, timestamp);

          setLatestWeatherTimestamp(timestamp);
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

  // Update the Weather Radar data.
  const getUpdatedWeather = useCallback(
    async (isInit = false) => {
      await drawWeather(isInit);
    },
    [drawWeather]
  );

  // Collect the extended flight data and then get the route.
  const selectFlight = async (
    callsign,
    transitionToFlightLoc: boolean = false,
    isInit: boolean = true,
    location?
  ) => {
    const findFlight = flightData?.find((flight) => {
      return flight.callsign === callsign;
    });

    if (findFlight) {
      const flightFromVatStatus = await getFlightVatStats(findFlight.callsign);

      if (flightFromVatStatus) {
        const selectedFlightData: IFlightVatStatsDetails = await getFlight(
          flightFromVatStatus.id
        );

        // Assign Location data for Transition to Flight Location if there is no passed Location parameter.
        if (!location) {
          const {
            current_latitude: latitude,
            current_longitude: longitude,
          } = selectedFlightData;

          location = { latitude, longitude };
        }

        setSelectedFlight(selectedFlightData);

        await getRoute(
          location,
          selectedFlightData.planned_dep_airport?.icao ?? "",
          selectedFlightData.planned_route,
          selectedFlightData.data_points,
          selectedFlightData.planned_dest_airport?.icao ?? "",
          transitionToFlightLoc,
          isInit
        );
      }
      // else {
      //   console.log({ checkStillActive: checkStillActive() }, { findFlight });

      //   if (!checkStillActive()) {
      //     deselectFlightFunc();
      //   } else {
      //     setSelectedFlight(findFlight);
      //   }
      // }
    }
  };

  // Update the Selected Flight data.
  const getUpdatedSelectedFlight = useCallback(() => {
    if (selectedFlight) {
      const getActiveFlightData: ICluster = clusters.find((flightData) => {
        return flightData.properties.callsign === selectedFlight.callsign;
      });

      let longitude, latitude;

      // If, for some reason, this data doesn't return successfully, account for it with an undefined return.
      if (getActiveFlightData) {
        longitude = getActiveFlightData.geometry.coordinates[0];
        latitude = getActiveFlightData.geometry.coordinates[1];
      }

      selectFlight(
        selectedFlight.callsign,
        false,
        false,
        longitude
          ? {
              latitude,
              longitude,
            }
          : undefined
      );
    }
  }, [clusters, selectedFlight]);

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
    callsign,
    transitionToFlightLoc: boolean = false,
    location?
  ) => {
    setLoading(true);
    setToggleNavigationMenu(false);

    // Disable the Selected Flight to clear the screen and allow for the new selection to load togerther.
    if (selectedFlight) {
      setSelectedFlight(null);
    }

    if (selectedAirport) {
      setDisplaySelectedAirport(false);
    }

    await selectFlight(callsign, transitionToFlightLoc, true, location);

    setLoading(false);
    setDisplaySelectedFlight(true);
  };

  // Select the Controller
  const selectControllerFunc = async (controllerObj) => {
    setLoading(true);
    setToggleNavigationMenu(false);

    // Disable the Selected Flight to clear the screen and allow for the new selection to load togerther.
    if (selectedFlight) {
      setSelectedFlight(null);
    }

    if (selectedAirport) {
      setDisplaySelectedAirport(false);
    }

    await navigateToController({
      longitude: controllerObj.properties.longitude,
      latitude: controllerObj.properties.latitude,
    });

    setLoading(false);
    setDisplaySelectedFlight(true);
  };

  // Collect selected Airport data.
  const getAirportData = async (icao) => {
    let airportData = await getAirport(icao);
    const taf: ITAF = await getTAF(airportData.icao);
    const metar: IMetar = await getMETAR(airportData.icao);

    // Get the Departures for the Selected Airport from the Departures data.
    const departures = flightData?.filter(
      (departure) => departure.departure === airportData.icao
    );

    // Get the Arrivals for the Selected Airport from the Active Flight data.
    const arrivals = flightData
      ?.filter((arrival) => arrival.arrival === airportData.icao)
      .map((arrival) => {
        arrival.dtg = handleDTG([
          [arrival.latitude, arrival.longitude],
          [airportData.latitude, airportData.longitude],
        ]);

        return arrival;
      });

    // Get the Controllers for the Seleccted Airport.
    const controllersICAO = controllers?.filter((controller) => {
      return (
        controller.callsign
          .toLowerCase()
          .indexOf(airportData.icao.substring(1).toLowerCase()) !== -1
      );
    });

    return (airportData = {
      ...airportData,
      arrivals,
      departures,
      controllers: controllersICAO,
      weather: {
        ...taf,
        ...metar["M"]["decoded"],
        metar_raw: metar["M"]["report"],
      },
    });
  };

  // Go through the process of Selecting an Airport.
  const selectAirportFunc = async (icao) => {
    deselectFlightFunc();
    deselectAirportFunc();
    setToggleNavigationMenu(false);
    setLoading(true);

    const airportData = await getAirportData(icao);

    await navigateToAirport(airportData);

    setLoading(false);
    setSelectedAirport(airportData);
    setDisplaySelectedAirport(true);
  };

  // Initially handle the data calls to display Flights, FIR data, and Weather.
  const handleDataCalls = async () => {
    await handleGetFlightData();
    await handleGetFIRsData();
    await getUpdatedWeather(true);
    setLoading(false);
  };

  // Continue to retrieve Flight and Weather data every 15 seconds.
  useInterval(() => {
    handleGetFlightData();
    handleGetFIRsData();
    getUpdatedWeather();
    getUpdatedSelectedFlight();

    if (setLoading) {
      setLoading(false);
    }
  }, 15000);

  // Get the total number of connections.
  const getTotalConnections = () => {
    const controllerConnections = controllers?.length ?? 0;
    const flightConnections = flightData?.length ?? 0;

    return controllerConnections + flightConnections;
  };

  // If an Airport is selected, continue to update it with its latest information.
  useEffect(() => {
    if (selectedAirport) {
      const updateSelectedAirportData = async () => {
        const airportData = await getAirportData(selectedAirport.icao);

        setSelectedAirport(airportData);
      };

      updateSelectedAirportData();
    }
  }, [flightData]);

  useEffect(() => {
    if (!checkStillActive()) {
      deselectFlightFunc();
    }
  }, [checkStillActive, clusterData, drawPlannedRoute, deselectFlightFunc]);

  // When the app renders, get the data and continue to get the data every 15 seconds.
  useEffect(() => {
    handleDataCalls();
  }, []);

  // Control the Keyboard Inputs.
  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        if (toggleNavigationMenu) {
          setToggleNavigationMenu(false);
        } else {
          deselectFlightFunc();
          deselectAirportFunc();
        }
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [toggleNavigationMenu]);

  const displayPopupDataView = () => {
    if (displayPopup) {
      let popup;

      if (displayPopup.properties.isController) {
        const {
          combined,
          frequency,
          latitude,
          longitude,
          time_logon,
        } = displayPopup.properties;

        popup = (
          <Popup
            anchor="right"
            closeButton={false}
            longitude={longitude}
            latitude={latitude}
            offsetLeft={-10}
          >
            <h3>{combined}</h3>
            <h4>{frequency}</h4>
            <h4>{format(new Date(time_logon), "MMM. dd, yyyy H.mm")}</h4>
          </Popup>
        );
      } else {
        const {
          aircraft_short,
          arrival,
          callsign,
          current_altitude,
          current_latitude,
          current_longitude,
          current_ground_speed,
          departure,
          real_name,
          transponder,
        } = displayPopup.properties;

        popup = (
          <Popup
            anchor="right"
            closeButton={false}
            longitude={current_longitude}
            latitude={current_latitude}
            offsetLeft={-10}
          >
            <h3>{callsign}</h3>
            <h4>{real_name}</h4>
            <div className="mapboxgl-popup-route">
              <span>{departure}</span>
              <span className="mapboxgl-popup-route-arrow">&#10132;</span>
              <span>{arrival}</span>
            </div>
            <div>{getTypeOfAircraft(aircraft_short)}</div>
            <div>{current_altitude} ft.</div>
            <div>{current_ground_speed} kts.</div>
            <div>{transponder}</div>
          </Popup>
        );
      }

      return popup;
    }

    return null;
  };

  // Control the FIR Popup.
  const firPopup = () => {
    if (showPopup) {
      const {
        lngLat: [longitude, latitude],
        firResp,
      } = showPopup;

      const parseMemberData = JSON.parse(firResp.properties.members);
      const memberData: any = Object.values(parseMemberData);

      // Get the Frequency of the FIR Controller.
      const getFrequency = (callsign) => {
        const foundController = controllers?.find(
          (controller) => controller.callsign === callsign
        );

        return foundController ? foundController.frequency : "N/A";
      };

      return (
        <Popup
          latitude={latitude}
          longitude={longitude}
          closeButton={true}
          closeOnClick={false}
          onClose={() => setShowPopup(null)}
        >
          <div className="mapboxgl-popup-content-interior">
            {memberData.map((member, i) => (
              <div key={i}>
                <span>{member.name}</span>
                <span>{member.callsign}</span>
                <span>{getFrequency(member.callsign)}</span>
              </div>
            ))}
          </div>
        </Popup>
      );
    }
  };

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
      doubleClickZoom={
        displaySelectedAirport || toggleNavigationMenu ? false : true
      }
      scrollZoom={displaySelectedAirport || toggleNavigationMenu ? false : true}
      dragRotate={false}
      touchRotate={false}
      keyboard={toggleNavigationMenu ? false : true}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/incarnate/ckc5i9a5s02w21ipgctm9js0w"
      onViewportChange={(viewportObj: IViewport) => {
        setViewport({ ...viewportObj, height: "100vh", width: "100%" });
      }}
      onClick={(e) => {
        const firResp = e.features?.find(
          (fir) => fir.layer.id.includes("FIR-") && fir.layer.type === "fill"
        );

        // Render FIR Popup if an FIR has been found and the click event happens on "overlays".
        if (firResp && e.target.className === "overlays") {
          setShowPopup({ lngLat: e.lngLat, firResp });
        }
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
              offsetLeft={-10}
              offsetTop={-10}
            >
              <img
                onClick={(e) => {
                  e.preventDefault();

                  if (!clusterObj.properties.isController) {
                    selectFlightFunc(clusterObj.properties.callsign, false, {
                      latitude,
                      longitude,
                    });

                    setDisplaySelectedFlight(false);
                  }
                }}
                onMouseOver={(e) => {
                  e.currentTarget.src = handleIcon(clusterObj, true);

                  setDisplayPopup(clusterObj);
                }}
                onMouseOut={(e) => {
                  e.currentTarget.src = handleIcon(clusterObj);

                  setDisplayPopup(null);
                }}
                className={
                  viewport.zoom < 12
                    ? `marker-image`
                    : `marker-image marker-image-zoom`
                }
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
          src="icons/menu-icon.png"
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
        setIcaoData={setIcaoData}
        selectAirportFunc={selectAirportFunc}
        icaoData={icaoData}
        totalConnections={getTotalConnections()}
      />

      {selectedFlight && (
        <FlightData
          selectedFlight={selectedFlight}
          checkStillActive={checkStillActive}
          displaySelectedFlight={displaySelectedFlight}
          deselectFlightFunc={deselectFlightFunc}
          selectAirportFunc={selectAirportFunc}
        />
      )}

      {selectedAirport && (
        <AirportData
          deselectAirportFunc={deselectAirportFunc}
          selectedAirport={selectedAirport}
          displaySelectedAirport={displaySelectedAirport}
          selectFlightFunc={selectFlightFunc}
        />
      )}

      {displayPopupDataView()}

      {showPopup && firPopup()}
    </ReactMapGL>
  );
}

export default App;
