import React, { useEffect, useRef, useState } from "react";
import ReactMapGL, { FlyToInterpolator, Marker, Popup } from "react-map-gl";
import useSupercluster from "use-supercluster";
import polyline from "@mapbox/polyline";
import { getDecodedFlightRoute, getVatsimData } from "./api/api";
import { ICluster, IViewport, IFlight } from "./declaration/interface";
import { getTypeOfAircraft, getTypeOfAircraftSelected } from "./helpers/utils";

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
  const [displayPopup, setDisplayPopup] = useState<ICluster | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<ICluster | null>(null);
  const [flightSearch, setFlightSearch] = useState<string>("");
  const mapRef = useRef<any>(null);

  const handleGetData = () => {
    getVatsimData().then((data) => {
      if (Object.keys(data).length > 0) {
        setFlightData(data.flights);

        massageData(data.flights);
      }
    });
  };

  const massageData = (data) => {
    const clusterFlights = data.map((flight: IFlight) => {
      return {
        type: "Feature",
        properties: {
          cluster: false,
          ...flight,
        },
        geometry: {
          type: "Point",
          coordinates: [flight.location.longitude, flight.location.latitude],
        },
      };
    });

    setClusterData(clusterFlights);
  };

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
        speed: 1,
      }),
      transitionDuration: "auto",
    });
  };

  const displayFlightDataView = () => {
    // If a Flight goes Offline, we need to disable Flight Data View.
    const isStillSelected = flightData.find(
      (flight: IFlight) =>
        selectedFlight?.properties.callsign === flight.callsign
    );

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
      } = selectedFlight.properties;

      return (
        <div className="flight-data flight-data-enabled">
          <div>
            <h3>{callsign}</h3>
            <h5>{name}</h5>
            <div>{planned_depairport}</div>
            <div>{planned_destairport}</div>
            <div>{planned_aircraft}</div>
            <div>{altitude} FT.</div>
            <div>{heading}</div>
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

  const displayPopupDataView = () => {
    if (displayPopup) {
      const {
        callsign,
        isController,
        name,
        planned_aircraft,
        planned_depairport,
        planned_destairport,
        altitude,
        heading,
        groundspeed,
      } = displayPopup.properties;
      const [longitude, latitude] = displayPopup.geometry.coordinates;

      if (isController) {
        return (
          <Popup longitude={longitude} latitude={latitude}>
            <div>
              <h3>{callsign}</h3>
              <h5>{name}</h5>
            </div>
          </Popup>
        );
      }

      return (
        <Popup longitude={longitude} latitude={latitude}>
          <div>
            <h3>{callsign}</h3>
            <h5>{name}</h5>
            <div>{planned_depairport}</div>
            <div>{planned_destairport}</div>
            <div>{planned_aircraft}</div>
            <div>{altitude} FT.</div>
            <div>{heading}</div>
            <div>{groundspeed} kts</div>
          </div>
        </Popup>
      );
    }

    return null;
  };

  // Handle the Airplane Icon type.
  const handleIcon = (flightData: ICluster) => {
    if (flightData.properties.isController) {
      return getTypeOfAircraft("controller");
    }

    const aircraftType = getTypeOfAircraft(
      flightData.properties.planned_aircraft
    );

    // If a Flight is selected, assign the Selected Airplane Icon to it.
    if (
      selectedFlight?.properties.callsign === flightData.properties.callsign
    ) {
      return getTypeOfAircraftSelected(flightData.properties.planned_aircraft);
    }

    return aircraftType;
  };

  const bounds =
    mapRef && mapRef.current
      ? mapRef.current.getMap().getBounds().toArray().flat()
      : null;

  const { clusters, supercluster } = useSupercluster({
    points: clusterData,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 8 },
  });

  useEffect(() => {
    handleGetData();

    setInterval(() => {
      handleGetData();
    }, 15000);

    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedFlight(null);
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  useEffect(() => {
    const isStillSelected = flightData.find(
      (flight: IFlight) =>
        selectedFlight?.properties.callsign === flight.callsign
    );

    console.log(isStillSelected);
  }, [clusterData]);

  // Remove the Waypoints of the Selected Flight.
  const removeRoute = () => {
    const map = mapRef.current.getMap();

    if (map.getLayer("route")) {
      map.removeLayer("route").removeSource("route");
    }
  };

  // Draw the Waypoints of the Selected Flight.
  const drawRoute = (flightCoordinates) => {
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
          "line-color": "#888",
          "line-width": 3,
        },
      });
    }
  };

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
                className="cluster-marker"
                onClick={handleClusterClick(clusterObj, latitude, longitude)}
                onMouseOver={() => {
                  console.log(
                    supercluster.getChildren(clusterObj.properties.cluster_id)
                  );
                }}
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

                  const getRoute = async () => {
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

                  getRoute();
                }
              }}
              onMouseOver={() => {
                setDisplayPopup(clusterObj);
              }}
              onMouseLeave={() => {
                setDisplayPopup(null);
              }}
              className="marker-image"
              src={handleIcon(clusterObj)}
              alt={"callsign"}
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
      {displayFlightDataView()}
      {/* const [longitude, latitude] = clusterObj.geometry.coordinates; */}
      {displayPopupDataView()}
    </ReactMapGL>
  );
}

export default App;
