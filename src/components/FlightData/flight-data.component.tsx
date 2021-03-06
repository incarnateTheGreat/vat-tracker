import React from "react";
import { getTypeOfAircraft, handleDTG } from "../../helpers/utils";

export const FlightData = ({
  selectedFlight,
  checkStillActive,
  displaySelectedFlight,
  deselectFlightFunc,
  selectAirportFunc,
}) => {
  if (selectedFlight && displaySelectedFlight && checkStillActive()) {
    const {
      aircraft_short,
      callsign,
      real_name,
      current_altitude,
      current_latitude,
      current_longitude,
      current_ground_speed,
      current_heading,
      planned_aircraft,
      planned_dep_airport: { icao: dep_airport_icao, name: dep_airport_name },
      planned_dest_airport: {
        icao: dest_airport_icao,
        name: dest_airport_name,
      },
    } = selectedFlight;

    const getDistanceInKM = (setPoint, destPoint) => {
      const { lat1, lon1 } = setPoint;
      const { lat2, lon2 } = destPoint;

      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1); // deg2rad below
      const dLon = deg2rad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in km
    };

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    // Get remaining distance.
    const totalDistance = getDistanceInKM(
      { lat1: current_latitude, lon1: current_longitude },
      {
        lat2: selectedFlight.planned_dest_airport.latitude,
        lon2: selectedFlight.planned_dest_airport.longitude,
      }
    );

    // Get total distance.
    const remainingDistance = getDistanceInKM(
      {
        lat1: selectedFlight.planned_dep_airport.latitude,
        lon1: selectedFlight.planned_dep_airport.longitude,
      },
      {
        lat2: selectedFlight.planned_dest_airport.latitude,
        lon2: selectedFlight.planned_dest_airport.longitude,
      }
    );

    // Assemble the Percentage Completed value.
    const percentageCompleted = `${
      100 - Math.round((totalDistance / remainingDistance) * 100)
    }%`;

    return (
      <div className="info-window info-window-enabled">
        <div className="info-window-details">
          <div className="info-window-details-name">
            <div>
              <h1>{callsign}</h1>{" "}
              <span className="info-window-details-divider">/</span>{" "}
              <h4>{real_name}</h4>
            </div>

            <div
              className="info-window-close"
              onClick={() => {
                deselectFlightFunc();
              }}
            >
              X
            </div>
          </div>
          <div className="grid-container">
            <div className="grid-container-item grid-container-item-icao">
              <div onClick={() => selectAirportFunc(dep_airport_icao)}>
                {dep_airport_icao}
              </div>
              <div>{dep_airport_name}</div>
            </div>
            <div className="grid-container-item grid-container-item-icao">
              <div onClick={() => selectAirportFunc(dest_airport_icao)}>
                {dest_airport_icao}
              </div>
              <img
                className="grid-container-item-icao-plane-to"
                src="images/airplane-icon.png"
                alt="To"
              />
              <div>{dest_airport_name}</div>
            </div>
            <div className="grid-container-item grid-container-item-lower-level">
              <div className="grid-container-item grid-container-item-lower-level-element grid-container-item-aircraft-type">
                <div>Equipment</div>
                <div>{aircraft_short}</div>
              </div>
              <div className="grid-container-item grid-container-item-lower-level-element grid-container-item-altitude">
                <div>Altitude</div>
                <div>{current_altitude} ft.</div>
              </div>
              <div className="grid-container-item grid-container-item-lower-level-element grid-container-item-heading">
                <div>Heading</div>
                <div className="grid-container-item-heading-container">
                  <div
                    className="grid-container-item-heading-container-arrow"
                    style={{
                      transform: `rotate(${current_heading}deg)`,
                    }}
                  >
                    &#x2B06;
                  </div>
                  {current_heading}&deg;
                </div>
              </div>
              <div className="grid-container-item grid-container-item-lower-level-element grid-container-item-airspeed">
                <div>Ground Speed</div>
                <div>{current_ground_speed} kts.</div>
              </div>
              <div className="grid-container-item grid-container-item-lower-level-element grid-container-item-airspeed">
                <div>Distance to Go</div>
                <div>
                  {handleDTG([
                    [
                      selectedFlight.current_latitude,
                      selectedFlight.current_longitude,
                    ],
                    [
                      selectedFlight.planned_dest_airport.latitude,
                      selectedFlight.planned_dest_airport.longitude,
                    ],
                  ])}{" "}
                  NMI
                </div>
              </div>
            </div>
          </div>
          <div className="info-window-details-flight-status">
            <span className="info-window-details-flight-status-line">
              <span
                className="info-window-details-flight-status-line-progress"
                style={{ width: percentageCompleted }}
              >
                <img src="images/airplane-icon.png" alt={callsign} />
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <div className="info-window"></div>;
};
