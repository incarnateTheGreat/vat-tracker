import { IFlightVatStats } from "../declaration/app";

// Select and Assign the correct (or approximate) Aircraft Type for the Marker.
export const getTypeOfAircraft = (aircraft) => {
  if (aircraft.includes("B74")) {
    return "/images/airplane-747-icon.png";
  } else if (
    aircraft.includes("B73") ||
    aircraft.includes("B77") ||
    aircraft.includes("B78") ||
    aircraft.includes("78") ||
    aircraft.includes("A31") ||
    aircraft.includes("A32") ||
    aircraft.includes("A33")
  ) {
    // return 'Boeing or Airbus'
    return "/images/airplane-737-777-icon.png";
  } else if (aircraft.includes("DH")) {
    // return 'Dash'
    return "/images/airplane-prop-icon.png";
  } else if (aircraft.includes("C130")) {
    // return 'Hercules'
    return "/images/airplane-icon.png";
  } else if (aircraft.includes("C172")) {
    // return 'Cessena'
    return "/images/airplane-icon.png";
  } else if (aircraft === "controller") {
    // return 'Controller'
    return "/images/controller-icon.png";
  } else {
    // return 'Default'
    return "/images/airplane-icon.png";
  }
};

export const getTypeOfAircraftSelected = (aircraft) => {
  if (aircraft.includes("B74")) {
    return "/images/airplane-747-icon-selected.png";
  } else if (
    aircraft.includes("B73") ||
    aircraft.includes("B77") ||
    aircraft.includes("B78") ||
    aircraft.includes("78") ||
    aircraft.includes("A31") ||
    aircraft.includes("A32") ||
    aircraft.includes("A33")
  ) {
    // return 'Boeing or Airbus'
    return "/images/airplane-737-777-icon-selected.png";
  } else if (aircraft.includes("DH")) {
    // return 'Dash'
    return "/images/airplane-prop-icon-selected.png";
  } else if (aircraft.includes("C130")) {
    // return 'Hercules'
    return "/images/airplane-icon-selected.png";
  } else if (aircraft.includes("C172")) {
    // return 'Cessena'
    return "/images/airplane-icon-selected.png";
  } else {
    // return 'Default'
    return "/images/airplane-icon-selected.png";
  }
};

// In order to display the Flights with Clustering, objects need to be created to assist with using Supercluster.
export const assembleClusterData = (data) => {
  return data.map((flight: IFlightVatStats) => {
    return {
      type: "Feature",
      properties: {
        cluster: false,
        ...flight,
      },
      geometry: {
        type: "Point",
        coordinates: [flight.current_longitude, flight.current_latitude],
      },
    };
  });
};

export const drawWeatherLayer = (map, timestamp) => {
  return map.addLayer({
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
};

export const metarAbbreviations = {
  B: "Began",
  BC: "Patches",
  BL: "Blowing",
  BR: "Mist",
  DR: "Low Drifting",
  DS: "Dust storm",
  DU: "Dust",
  DZ: "Drizzle",
  E: "Ended",
  FC: "Funnel Cloud",
  FG: "Fog",
  FU: "Smoke",
  FZ: "Freezing",
  GR: "Hail",
  GS: "Small Hail / Snow Pellets",
  HZ: "Haze",
  IC: "Ice Crystals",
  MI: "Shallow",
  PL: "Ice Pellets",
  PO: "Well-Developed Dust/Sand Whirls",
  PR: "Partial",
  PY: "Spray",
  RA: "Rain",
  SA: "Sand",
  SG: "Snow Grains",
  SH: "Showers",
  SN: "Snow",
  SQ: "Squalls Moderate",
  SS: "Sandstorm",
  TS: "Thunderstorm",
  UP: "Unknown Precipitation",
  VA: "Volcanic Ash",
  VC: "In the Vicinity",
};
