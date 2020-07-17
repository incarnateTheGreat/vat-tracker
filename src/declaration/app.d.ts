export interface IViewport {
  latitude: number;
  longitude: number;
  maxZoom: number;
  transitionInterpolator?: any;
  transitionDuration?: any;
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

export interface ICluster {
  geometry: {
    coordinates: any[];
    type: string;
  };
  properties: IClusterProperties;
  type: string;
}

export interface IClusterProperties extends IFlight {
  cluster: boolean;
  cluster_id: number;
  isCluster: boolean;
  pointCount?: number;
  point_count: number;
}

interface IIcaos {
  icaos: object[];
}
