// Select and Assign the correct (or approximate) Aircraft Type for the Marker.
export const getTypeOfAircraftIcon = (aircraft = "") => {
  if (aircraft.includes("B74")) {
    return "images/airplane-747-icon.png";
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
    return "images/airplane-737-777-icon.png";
  } else if (aircraft.includes("DH")) {
    // return 'Dash'
    return "images/airplane-prop-icon.png";
  } else if (aircraft.includes("C130")) {
    // return 'Hercules'
    return "images/airplane-icon.png";
  } else if (aircraft.includes("C172")) {
    // return 'Cessena'
    return "images/airplane-icon.png";
  } else if (aircraft === "controller") {
    // return 'Controller'
    return "images/controller-icon.png";
  } else {
    // return 'Default'
    return "images/airplane-icon.png";
  }
};

export const getTypeOfAircraft = (aircraft) => {
  if (aircraft.includes("B74")) {
    return "B747";
  } else if (aircraft.includes("B737")) {
    return "B737";
  } else if (aircraft.includes("B38")) {
    return "B737 MAX";
  } else if (aircraft.includes("B738")) {
    return "B737-800";
  } else if (aircraft.includes("B739")) {
    return "B737-900";
  } else if (aircraft.includes("B75")) {
    return "B757";
  } else if (aircraft.includes("B76")) {
    return "B767";
  } else if (aircraft.includes("B77")) {
    return "B777";
  } else if (aircraft.includes("B78")) {
    return "B787";
  } else if (aircraft.includes("A21")) {
    return "A321 NEO";
  } else if (aircraft.includes("A31")) {
    return "A310";
  } else if (aircraft.includes("A32")) {
    return "A320";
  } else if (aircraft.includes("A33")) {
    return "A330";
  } else if (aircraft.includes("A34")) {
    return "A340";
  } else if (aircraft.includes("A30")) {
    return "A300";
  } else if (aircraft.includes("A3ST")) {
    return "A-3ST Beluga";
  } else if (aircraft.includes("A3")) {
    return "A3XX";
  } else if (aircraft.includes("B74")) {
    return "B747";
  } else if (aircraft.includes("C75")) {
    return "Citation X";
  } else if (aircraft.includes("DH")) {
    return "DASH-8";
  } else if (aircraft.includes("C13")) {
    return "C-130";
  } else if (aircraft.includes("C172")) {
    return "CESSNA-172";
  } else if (aircraft.includes("MD11")) {
    return "MD-11";
  } else if (aircraft.includes("CRJ")) {
    return "CRJ 700";
  } else if (aircraft.includes("CONC")) {
    return "Concorde";
  } else {
    return aircraft;
  }
};

export const getTypeOfAircraftSelected = (aircraft) => {
  if (aircraft.includes("B74")) {
    return "images/airplane-747-icon-selected.png";
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
    return "images/airplane-737-777-icon-selected.png";
  } else if (aircraft.includes("DH")) {
    // return 'Dash'
    return "images/airplane-prop-icon-selected.png";
  } else if (aircraft.includes("C130")) {
    // return 'Hercules'
    return "images/airplane-icon-selected.png";
  } else if (aircraft.includes("C172")) {
    // return 'Cessena'
    return "images/airplane-icon-selected.png";
  } else {
    // return 'Default'
    return "images/airplane-icon-selected.png";
  }
};

// In order to display the Flights with Clustering, objects need to be created to assist with using Supercluster.
export const assembleClusterData = (data) => {
  return data.map((flight) => {
    const name = flight.real_name ? flight.real_name : flight.realname;
    const current_longitude = flight.current_longitude
      ? flight.current_longitude
      : flight.longitude;
    const current_latitude = flight.current_latitude
      ? flight.current_latitude
      : flight.latitude;

    return {
      type: "Feature",
      properties: {
        cluster: false,
        combined: `${flight.callsign} (${name})`,
        ...flight,
      },
      geometry: {
        type: "Point",
        coordinates: [current_longitude, current_latitude],
      },
    };
  });
};

export const assembleClusterDataTest = (data) => {
  return data.map((flight) => {
    const name = flight.realname;
    const current_longitude = flight.longitude;
    const current_latitude = flight.latitude;

    return {
      type: "Feature",
      properties: {
        ...flight,
        current_altitude: flight.altitude,
        current_heading: flight.heading,
        current_latitude: flight.latitude,
        current_longitude: flight.longitude,
        current_ground_speed: flight.groundspeed,
        real_name: flight.realname,
        planned_aircraft: flight.planned_aircraft ?? "N/A",
        planned_dep_airport__icao: flight.planned_depairport,
        planned_dest_airport__icao: flight.planned_destairport,
        cluster: false,
        combined: `${flight.callsign} (${name})`,
      },
      geometry: {
        type: "Point",
        coordinates: [current_longitude, current_latitude],
      },
    };
  });
};

export const assembleAiportData = (data) => {
  return data.map((airport) => {
    return {
      ...airport,
      combined: `${airport.icao} ${
        airport.municipality && `(${airport.municipality})`
      }`,
    };
  });
};

const getDeg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const getNauticalMilesFromKM = (km) => {
  return Math.round(km * 0.5399568);
};

export const getDistanceToDestination = (latlngs) => {
  const R = 6371; // Radius of the earth in km

  try {
    const flight_coords_lat = latlngs[0][0];
    const flight_coords_lng = latlngs[0][1];
    const airport_coords_lat = parseFloat(latlngs[1][0]);
    const airport_coords_lng = parseFloat(latlngs[1][1]);

    const dLat = getDeg2rad(airport_coords_lat - flight_coords_lat);
    const dLon = getDeg2rad(airport_coords_lng - flight_coords_lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(getDeg2rad(flight_coords_lat)) *
        Math.cos(getDeg2rad(airport_coords_lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    return Math.round(d);
  } catch (err) {
    return null;
  }
};

// Calculate the Distange to Go (DTG) for Flights to Airports.
export const handleDTG = (distanceLatLngs) => {
  const distanceKM = getDistanceToDestination(distanceLatLngs) ?? "N/A";
  const distanceNMI = getNauticalMilesFromKM(distanceKM) ?? "N/A";

  return distanceNMI;
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
      opacity: 0.001,
      zIndex: timestamp,
    },
    minZoom: 0,
    maxZoom: 12,
    layout: {},
    paint: {
      "raster-opacity": 0.5,
    },
  });
};

export const metarConditionAbbr = {
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

export const metarCloudAbbr = {
  SKC: "Clear", // used worldwide but in North America is used to indicate a human generated report[14][15]
  CLR: "No Clouds", // below 12,000 ft (3,700 m) (U.S.) or 25,000 ft (7,600 m) (Canada) used mainly within North America and indicates a station that is at least partly automated[14][15]
  FEW: "Few", // 1–2 oktas
  SCT: "Scattered", // = 3–4 oktas
  BKN: "Broken", // 5–7 oktas
  OVC: "Overcast", // 8 oktas, i.e., full cloud coverage
};
