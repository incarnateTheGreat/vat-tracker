export interface IViewport {
  latitude: number;
  longitude: number;
  maxZoom: number;
  transitionInterpolator?: any;
  transitionDuration?: any;
  transitionEasing?: any;
  width: string | number;
  height: string | number;
  zoom: number;
}

export interface IControllers {
  controllers: object[];
}

export interface IFlights {
  flights: IFlight;
}

export interface IFlight {
  altitude: string;
  callsign: string;
  coordinates?: any[];
  frequency: string;
  groundspeed: string;
  heading: string;
  isController: boolean;
  location: {
    latitude: string;
    longitude: string;
  };
  name: string;
  planned_aircraft: string;
  planned_depairport: string;
  planned_destairport: string;
  planned_route: string;
  transponder: string;
}

export interface IFlightVatStats {
  id: number;
  callsign: string;
  real_name: string;
  planned_aircraft: string;
  planned_dep_airport__name: string;
  planned_dep_airport__icao: string;
  planned_dest_airport__icao: string;
  planned_dest_airport__name: string;
  current_heading: number;
  current_latitude: number;
  current_longitude: number;
  lat: number;
  lng: number;
  current_altitude: number;
  current_ground_speed: number;
  cid: {
    cid: number;
  };
  planned_dep_airport: {
    municipality: string;
    icao: string;
  };
  planned_dest_airport: {
    municipality: string;
    icao: string;
  };
}

export interface IFlightVatStatsDetails {
  id: number;
  data_points: [
    {
      id: number;
      latitude: number;
      longitude: number;
      altitude: number;
      heading: number;
      ground_speed: number;
      ground_elevation: number;
      distance_from_departure: number;
      distance_from_destination: number;
      created_at: string;
      flight: number;
    }
  ];
  callsign: string;
  real_name: string;
  client_type: string;
  planned_aircraft: string;
  planned_tas_cruise: number;
  planned_altitude: string;
  planned_flight_type: string;
  planned_route: string;
  planned_remarks: string;
  status: number;
  starting_time: string;
  takeoff_time: string;
  landing_time: any;
  ending_time: any;
  last_updated: string;
  current_latitude: number;
  current_longitude: number;
  current_altitude: number;
  current_heading: number;
  current_ground_speed: number;
  is_gdpr: boolean;
  is_hide_display_name: boolean;
  is_hidden_profile: boolean;
  is_exclude_from_search: boolean;
  is_legacy_vatstats: boolean;
  legacy_vatstats_flight_id: string;
  has_elevation_data: boolean;
  elevation_data_counter: number;
  duration: string;
  is_copied_to_mysql: boolean;
  airline: {
    id: number;
    icao: string;
    iata: string;
    name: string;
    callsign: string;
    country: string;
    total_flights: number;
    is_exclude_from_search: boolean;
  };
  cid: {
    id: number;
    cid: number;
    real_name: string;
    total_flying_time: string;
    nautical_miles: string;
    statute_miles: string;
    kilometers: string;
    most_common_route: string;
    total_controlling_time: string;
    is_controller: boolean;
    is_pilot: boolean;
    is_gdpr: boolean;
    is_hidden_real_name: boolean;
    is_hidden_profile: boolean;
    is_exclude_from_search: boolean;
  };
  aircraft: any;
  planned_dep_airport: {
    id: number;
    name: string;
    municipality: string;
    region: string;
    country: string;
    country_short: string;
    icao: string;
    latitude: number;
    longitude: number;
    elevation: number;
    departure_count: number;
    arrival_count: number;
    most_common_aircraft: [
      {
        planned_aircraft: string;
        dcount: number;
      }
    ];
    most_common_airline: [
      {
        airline__name: string;
        dcount: number;
      }
    ];
  };
  planned_dest_airport: {
    id: number;
    name: string;
    municipality: string;
    region: string;
    country: string;
    country_short: string;
    icao: string;
    latitude: number;
    longitude: number;
    elevation: number;
    departure_count: number;
    arrival_count: number;
    most_common_aircraft: [
      {
        planned_aircraft: string;
        dcount: number;
      }
    ];
    most_common_airline: [
      {
        airline__name: string;
        dcount: number;
      }
    ];
  };
  planned_alt_airport: {
    id: number;
    name: string;
    municipality: string;
    region: string;
    country: string;
    country_short: string;
    icao: string;
    latitude: number;
    longitude: number;
    elevation: number;
    departure_count: number;
    arrival_count: number;
    most_common_aircraft: [
      {
        planned_aircraft: string;
        dcount: number;
      }
    ];
    most_common_airline: [
      {
        airline__name: string;
        dcount: number;
      }
    ];
  };
  callsign_fk: {
    id: number;
    callsign: string;
    total: number;
    created_at: string;
  };
}

export interface ICluster {
  geometry: {
    coordinates: any[];
    type: string;
  };
  properties: IClusterProperties;
  type: string;
}

export interface IClusterDetails extends IFlightVatStatsDetails {}

export interface IClusterProperties
  extends IFlightVatStats,
    IFlightVatStatsDetails {
  cluster: boolean;
  cluster_id: number;
  isCluster: boolean;
  pointCount?: number;
  point_count: number;
}

export interface IAirport {
  arrival_count: number;
  atis: string;
  country: string;
  country_short: string;
  departure_count: number;
  elevation: number;
  icao: string;
  id: number;
  last_50_arrivals: [
    {
      callsign: string;
      id: number;
      planned_aircraft: string;
      planned_dep_airport: number;
      planned_dep_airport__icao: string;
      planned_dep_airport__name: string;
      planned_dest_airport: number;
      planned_dest_airport__icao: string;
      planned_dest_airport__name: string;
      real_name: string;
    }
  ];
  last_50_departures: [
    {
      callsign: string;
      id: number;
      planned_aircraft: string;
      planned_dep_airport: number;
      planned_dep_airport__icao: string;
      planned_dep_airport__name: string;
      planned_dest_airport: number;
      planned_dest_airport__icao: string;
      planned_dest_airport__name: string;
      real_name: string;
    }
  ];
  last_day_arrival_count: number;
  last_day_departure_count: number;
  last_hour_arrival_count: number;
  last_hour_departure_count: number;
  latitude: number;
  longitude: number;
  most_common_aircraft: [{ planned_aircraft: string; dcount: number }];
  most_common_airline: [{ airline__name: string; dcount: number }];
  municipality: string;
  name: string;
  region: string;
}

interface IIcaos {
  icaos: object[];
}
