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
  altitude: number;
  atis_message: string;
  callsign: string;
  cid: string;
  clienttype: string;
  combined: string;
  facilitytype: number;
  frequency: string;
  groundspeed: number;
  heading: number;
  latitude: number;
  longitude: number;
  planned_actdeptime: any;
  planned_aircraft: any;
  planned_altairport: any;
  planned_altitude: any;
  planned_depairport: any;
  planned_depairport_lat: number;
  planned_depairport_lon: number;
  planned_deptime: any;
  planned_destairport: any;
  planned_destairport_lat: number;
  planned_destairport_lon: number;
  planned_flighttype: any;
  planned_hrsenroute: any;
  planned_hrsfuel: any;
  planned_minenroute: any;
  planned_minfuel: any;
  planned_remarks: any;
  planned_revision: any;
  planned_route: any;
  planned_tascruise: any;
  protrevision: number;
  qnh_i_hg: number;
  qnh_mb: number;
  rating: number;
  realname: string;
  server: string;
  time_last_atis_received: string;
  time_logon: string;
  transponder: number;
  visualrange: number;
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

export interface IFlightVatStats extends IVatsimFlight {
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
  planned_depairport: string;
  planned_destairport: string;
  realname: string;
  clienttype: string;
  frequency: string;
  flight_rules: string;
  aircraft: string;
  aircraft_faa: string;
  aircraft_short: string;
  departure: string;
  arrival: string;
  alternate: string;
  cruise_tas: string;
  altitude: string;
  deptime: string;
  enroute_time: string;
  fuel_time: string;
  remarks: string;
  route: string;
  revision_id: string;
}

export interface IFirs {
  boundaries: string;
  icao: string;
  id: number;
  name: string;
  oceanic: number;
}

export interface IATC {
  ATIS: [ATCSection];
  APP: [ATCSection];
  TWR: [ATCSection];
  GND: [ATCSection];
  loc: {
    callsign: string;
    city: string;
    country: string;
    created_at: string;
    fir: string;
    iata: string;
    icao: string;
    id: number;
    lat: string;
    lon: string;
    name: string;
    state: string;
    timezone: string;
    updated_at: string;
  };
  name: string;
}

interface ATCSection {
  atis: string;
  callsign: string;
  cid: number;
  created_at: string;
  def: string;
  flag: number;
  id: number;
  name: string;
  time_online: string;
  type: string;
  updated_at: string;
}

export interface IFlightVatStatsDetails {
  id?: number;
  detail?: string;
  data_points?: [
    {
      id?: number;
      latitude?: number;
      longitude?: number;
      altitude?: number;
      heading?: number;
      ground_speed?: number;
      ground_elevation?: number;
      distance_from_departure?: number;
      distance_from_destination?: number;
      created_at?: string;
      flight?: number;
    }
  ];
  callsign?: string;
  real_name?: string;
  client_type?: string;
  planned_aircraft?: string;
  planned_tas_cruise?: number;
  planned_altitude?: string;
  planned_flight_type?: string;
  planned_route?: string;
  planned_remarks?: string;
  status?: number;
  starting_time?: string;
  takeoff_time?: string;
  landing_time?: any;
  ending_time?: any;
  last_updated?: string;
  current_latitude?: number;
  current_longitude?: number;
  current_altitude?: number;
  current_heading?: number;
  current_ground_speed?: number;
  is_gdpr?: boolean;
  is_hide_display_name?: boolean;
  is_hidden_profile?: boolean;
  is_exclude_from_search?: boolean;
  is_legacy_vatstats?: boolean;
  legacy_vatstats_flight_id?: string;
  has_elevation_data?: boolean;
  elevation_data_counter?: number;
  duration?: string;
  is_copied_to_mysql?: boolean;
  airline?: {
    id?: number;
    icao?: string;
    iata?: string;
    name?: string;
    callsign?: string;
    country?: string;
    total_flights?: number;
    is_exclude_from_search?: boolean;
  };
  cid?: {
    id?: number;
    cid?: number;
    real_name?: string;
    total_flying_time?: string;
    nautical_miles?: string;
    statute_miles?: string;
    kilometers?: string;
    most_common_route?: string;
    total_controlling_time?: string;
    is_controller?: boolean;
    is_pilot?: boolean;
    is_gdpr?: boolean;
    is_hidden_real_name?: boolean;
    is_hidden_profile?: boolean;
    is_exclude_from_search?: boolean;
  };
  aircraft?: any;
  planned_dep_airport?: {
    id?: number;
    name?: string;
    municipality?: string;
    region?: string;
    country?: string;
    country_short?: string;
    icao?: string;
    latitude?: number;
    longitude?: number;
    elevation?: number;
    departure_count?: number;
    arrival_count?: number;
    most_common_aircraft?: [
      {
        planned_aircraft?: string;
        dcount?: number;
      }
    ];
    most_common_airline?: [
      {
        airline__name?: string;
        dcount?: number;
      }
    ];
  };
  planned_dest_airport?: {
    id?: number;
    name?: string;
    municipality?: string;
    region?: string;
    country?: string;
    country_short?: string;
    icao?: string;
    latitude?: number;
    longitude?: number;
    elevation?: number;
    departure_count?: number;
    arrival_count?: number;
    most_common_aircraft?: [
      {
        planned_aircraft?: string;
        dcount?: number;
      }
    ];
    most_common_airline?: [
      {
        airline__name?: string;
        dcount?: number;
      }
    ];
  };
  planned_alt_airport?: {
    id?: number;
    name?: string;
    municipality?: string;
    region?: string;
    country?: string;
    country_short?: string;
    icao?: string;
    latitude?: number;
    longitude?: number;
    elevation?: number;
    departure_count?: number;
    arrival_count?: number;
    most_common_aircraft?: [
      {
        planned_aircraft?: string;
        dcount?: number;
      }
    ];
    most_common_airline?: [
      {
        airline__name?: string;
        dcount?: number;
      }
    ];
  };
  callsign_fk?: {
    id?: number;
    callsign?: string;
    total?: number;
    created_at?: string;
  };
}

export interface IFirPopup {
  lngLat: number[];
  firResp: {
    properties: {
      members: string;
      name: string;
    };
  };
}

// export interface IAppPopup {
//   lngLat: number[];
//   firResp: {
//     properties: {
//       members: string;
//       name: string;
//     };
//   };
// }

export interface ICluster {
  geometry: {
    coordinates: number[];
    type: string;
  };
  properties: IClusterProperties;
  type: string;
}

export interface IClusterDetails extends IFlightVatStatsDetails {}

export interface IVatsimFlight {
  callsign: string;
  cid: string;
  realname: string;
  clienttype: string;
  frequency: null;
  latitude: number;
  longitude: number;
  altitude: number;
  dtg: number;
  groundspeed: number;
  planned_aircraft: string;
  planned_tascruise: string;
  planned_depairport: string;
  planned_altitude: string;
  planned_destairport: string;
  server: string;
  protrevision: number;
  rating: number;
  transponder: number;
  facilitytype: number;
  visualrange: number;
  planned_revision: string;
  planned_flighttype: string;
  planned_deptime: string;
  planned_actdeptime: string;
  planned_hrsenroute: string;
  planned_minenroute: string;
  planned_hrsfuel: string;
  planned_minfuel: string;
  planned_altairport: string;
  planned_remarks: string;
  planned_route: string;
  planned_depairport_lat: number;
  planned_depairport_lon: number;
  planned_destairport_lat: number;
  planned_destairport_lon: number;
  atis_message: string;
  time_last_atis_received: string;
  time_logon: string;
  heading: number;
  qnh_i_hg: number;
  qnh_mb: number;
}

export interface IClusterProperties
  extends IFlightVatStats,
    IFlightVatStatsDetails,
    IControllers {
  cluster: boolean;
  cluster_id: number;
  isCluster: boolean;
  isController: boolean;
  pointCount?: number;
  point_count: number;
}

export interface ITAF {
  meta: {
    timestamp: string;
    stations_updated: string;
  };
  raw: string;
  station: string;
  time: {
    repr: string;
    dt: string;
  };
  remarks: string;
  forecast: [
    {
      altimeter: string;
      clouds: [
        {
          repr: string;
          type: string;
          altitude: number;
          modifier: string;
          direction: string;
        },
        {
          repr: string;
          type: string;
          altitude: number;
          modifier: string;
          direction: string;
        }
      ];
      flight_rules: string;
      other: object;
      sanitized: string;
      visibility: {
        repr: string;
        value: number;
        spoken: string;
      };
      wind_direction: {
        repr: string;
        value: number;
        spoken: string;
      };
      wind_gust: string;
      wind_speed: {
        repr: string;
        value: number;
        spoken: string;
      };
      wx_codes: [
        {
          repr: string;
          value: string;
        }
      ];
      end_time: {
        repr: string;
        dt: string;
      };
      icing: object;
      probability: string;
      raw: string;
      start_time: {
        repr: string;
        dt: string;
      };
      transition_start: string;
      turbulence: object;
      type: string;
      wind_shear: string;
    }
  ];
  start_time: {
    repr: string;
    dt: string;
  };
  end_time: {
    repr: string;
    dt: string;
  };
  max_temp: string;
  min_temp: string;
  alts: string;
  temps: string;
  units: {
    altimeter: string;
    altitude: string;
    temperature: string;
    visibility: string;
    wind_speed: string;
  };
}

export interface IMetar {
  issued: string;
  report: string;
  available: true;
  decoded: {
    main: [
      {
        Identifier: [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        "Time Issued": [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        Wind: [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        Visibility: [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        "Prevailing Visibility": [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        Clouds: [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        Temperature: [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
        Pressure: [
          {
            decodeResult: string;
            description: string;
            originalChunk: string;
            stringOffset: {
              start: number;
              end: number;
            };
          }
        ];
      }
    ];
  };
}

export interface IAirport extends ITAF, IMetar {
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
