import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getTypeOfAircraft } from "../../helpers/utils";
import { Tabs } from "../Tabs/tabs.component";
import { IFlightVatStats } from "../../declaration/app";

export const AirportData = ({
  deselectAirportFunc,
  selectedAirport,
  displaySelectedAirport,
  selectFlightFunc,
}) => {
  const [tabData, setTabData] = useState<object[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [departuresSortDirection, setDeparturesSortDirection] = useState<
    string
  >("ASC");
  const [arrivalsSortDirection, setArrivalsSortDirection] = useState<string>(
    "ASC"
  );
  const [departuresSortKey, setDeparturesSortKey] = useState<string>(
    "callsign"
  );
  const [arrivalsSortKey, setArrivalsSortKey] = useState<string>("callsign");
  const iconPath = "./images/weather-icons";

  // Parse the Airport Data, specifically for the Aircraft Type.
  const handleAirportData = (flightData) => {
    return flightData.map((flight) => {
      flight["planned_aircraft"] = getTypeOfAircraft(flight.planned_aircraft);

      return flight;
    });
  };

  const [departures, setDepartures] = useState<IFlightVatStats[]>(
    handleAirportData(selectedAirport.departures) || []
  );
  const [arrivals, setArrivals] = useState<IFlightVatStats[]>(
    handleAirportData(selectedAirport.arrivals) || []
  );

  // Sort the Departures data.
  const sortDepartureData = (sortDirection = "ASC", sortKey = "callsign") => {
    const dep = departures.sort((a, b) => {
      if (sortDirection === "ASC") {
        return a[sortKey].localeCompare(b[sortKey]);
      }

      return b[sortKey].localeCompare(a[sortKey]);
    });

    setDepartures(dep);
    setDeparturesSortDirection(sortDirection);
    setDeparturesSortKey(sortKey);
  };

  // Sort the Arrivals data.
  const sortArrivalsData = (sortDirection = "ASC", sortKey = "callsign") => {
    const arr = arrivals.sort((a, b) => {
      if (sortDirection === "ASC") {
        return a[sortKey].localeCompare(b[sortKey]);
      }

      return b[sortKey].localeCompare(a[sortKey]);
    });

    setArrivals(arr);
    setArrivalsSortDirection(sortDirection);
    setArrivalsSortKey(sortKey);
  };

  // Handle the Sort Direction based on criteria.
  const handleSortDirection = (sortDirection) => {
    return sortDirection === "ASC" ? "DESC" : "ASC";
  };

  // Sort the Departures and Arrivals data on render.
  useEffect(() => {
    sortDepartureData(departuresSortDirection, departuresSortKey);
    sortArrivalsData(arrivalsSortDirection, arrivalsSortKey);
  }, [arrivals, departures]);

  useEffect(() => {
    setTabData([
      {
        label: "Departures",
        component: (
          <>
            <section>
              <div className="grid-container-airport-flights">
                <div className="grid-container-airport-flights-departures grid-container-airport-flights-departures-headers">
                  <div
                    className="grid-container-airport-flights-departures-departure"
                    onClick={() =>
                      sortDepartureData(
                        handleSortDirection(departuresSortDirection),
                        "callsign"
                      )
                    }
                  >
                    Callsign
                  </div>
                  <div
                    className="grid-container-airport-flights-departures-departure"
                    onClick={() =>
                      sortDepartureData(
                        handleSortDirection(departuresSortDirection),
                        "real_name"
                      )
                    }
                  >
                    User ID
                  </div>
                  <div
                    className="grid-container-airport-flights-departures-departure"
                    onClick={() => {
                      sortDepartureData(
                        handleSortDirection(departuresSortDirection),
                        "planned_dest_airport__icao"
                      );
                    }}
                  >
                    To
                  </div>
                  <div
                    className="grid-container-airport-flights-departures-departure"
                    onClick={() => {
                      sortDepartureData(
                        handleSortDirection(departuresSortDirection),
                        "planned_aircraft"
                      );
                    }}
                  >
                    Aircraft
                  </div>
                </div>
                {departures.length > 0 ? (
                  departures.map((departure, key) => (
                    <div
                      className="grid-container-airport-flights-departures"
                      key={key}
                      onClick={() => selectFlightFunc(departure.id, true)}
                    >
                      <div className="grid-container-airport-flights-departures-departure">
                        <span>{departure.callsign}</span>
                      </div>
                      <div className="grid-container-airport-flights-departures-departure">
                        <span>{departure.real_name}</span>
                      </div>
                      <div className="grid-container-airport-flights-departures-departure">
                        {departure.planned_dest_airport__icao}
                      </div>
                      <div className="grid-container-airport-flights-departures-departure">
                        {departure.planned_aircraft}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid-container-airport-flights-arrivals grid-container-airport-flights-arrivals-no-data">
                    None
                  </div>
                )}
              </div>
            </section>
          </>
        ),
      },
      {
        label: "Arrivals",
        component: (
          <>
            <section>
              <div className="grid-container-airport-flights">
                <div className="grid-container-airport-flights-arrivals grid-container-airport-flights-arrivals-headers">
                  <div
                    className="grid-container-airport-flights-arrivals-arrival"
                    onClick={() => {
                      sortArrivalsData(
                        handleSortDirection(arrivalsSortDirection),
                        "callsign"
                      );
                    }}
                  >
                    Callsign
                  </div>
                  <div
                    className="grid-container-airport-flights-arrivals-arrival"
                    onClick={() => {
                      sortArrivalsData(
                        handleSortDirection(arrivalsSortDirection),
                        "real_name"
                      );
                    }}
                  >
                    User ID
                  </div>
                  <div
                    className="grid-container-airport-flights-arrivals-arrival"
                    onClick={() => {
                      sortArrivalsData(
                        handleSortDirection(arrivalsSortDirection),
                        "planned_dep_airport__icao"
                      );
                    }}
                  >
                    From
                  </div>
                  <div
                    className="grid-container-airport-flights-arrivals-arrival"
                    onClick={() => {
                      sortArrivalsData(
                        handleSortDirection(arrivalsSortDirection),
                        "planned_aircraft"
                      );
                    }}
                  >
                    Aircraft
                  </div>
                </div>
                {arrivals.length > 0 ? (
                  arrivals.map((arrival, key) => (
                    <div
                      className="grid-container-airport-flights-arrivals"
                      key={key}
                      onClick={() => selectFlightFunc(arrival.id, true)}
                    >
                      <div className="grid-container-airport-flights-arrivals-arrival">
                        {arrival.callsign}
                      </div>
                      <div className="grid-container-airport-flights-arrivals-arrival">
                        {arrival.real_name}
                      </div>
                      <div className="grid-container-airport-flights-arrivals-arrival">
                        {arrival.planned_dep_airport__icao}
                      </div>
                      <div className="grid-container-airport-flights-arrivals-arrival">
                        {arrival.planned_aircraft}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid-container-airport-flights-departures grid-container-airport-flights-departures-no-data">
                    None
                  </div>
                )}
              </div>
            </section>
          </>
        ),
      },
    ]);
  }, [
    arrivals,
    departures,
    selectFlightFunc,
    arrivalsSortDirection,
    departuresSortDirection,
  ]);

  const handleClouds = (Clouds) => {
    return Clouds && Clouds.length > 0 ? (
      <ul className="grid-container-airport-item-data-clouds">
        {Clouds.map((cloud, key) => {
          let { decodeResult } = cloud;

          decodeResult = decodeResult.replace("meter", "metres");

          return (
            <li
              className="grid-container-airport-item-data-clouds-cloud"
              key={key}
            >
              {decodeResult}
            </li>
          );
        })}
      </ul>
    ) : (
      <div>None (CAVOK)</div>
    );
  };

  const handleVisibility = (Visibility, prevailingVis) => {
    console.log(Visibility);

    let vis = "";

    if (Visibility) {
      vis = Visibility[0].decodeResult;
    } else if (prevailingVis) {
      vis = prevailingVis[0].decodeResult;
    } else {
      vis = "N/A";
    }

    return vis;
  };

  const getWeatherIcon = (code = "") => {
    // If there's no specific Weather data indicated, decypher it via the Clouds data.
    if (code === "") {
      const cloudStat =
        selectedAirport.weather.main?.[0].Clouds?.[0].originalChunk || "N/A";

      if (cloudStat.includes("FEW") || cloudStat.includes("SCT")) {
        code = "FEW";
      }
    }

    switch (code) {
      case "RA":
      case "RERA":
      case "-RA":
      case "DZ":
      case "DZRA":
      case "-SHRA":
        return `${iconPath}/wi-rain.svg`;
      case "TS":
      case "-TSRA":
        return `${iconPath}/wi-thunderstorm.svg`;
      case "HZ":
        return `${iconPath}/wi-day-haze.svg`;
      case "FEW":
        return `${iconPath}/wi-cloudy.svg`;
      // case "fog":
      // case "mist":
      //   return "wi-fog";
      // case "wind":
      //   return "wi-windy";
      // case "snow":
      //   return "wi-snow";
      // case "clear-day":
      //   return "wi-sunny";
      // case "partly-cloudy-night":
      //   return "wi-night-partly-cloudy";
      default:
        return `${iconPath}/wi-na.svg`;
    }
  };

  if (selectedAirport && displaySelectedAirport) {
    const { country, municipality, icao, name, weather } = selectedAirport;
    const { metar_raw, start_time } = weather;

    let weatherOutput;

    if (
      Object.prototype.hasOwnProperty.call(weather, "main") &&
      weather.main.length > 0
    ) {
      const {
        Clouds,
        Pressure = "N/A",
        Temperature,
        Visibility,
        Wind,
      } = weather.main[0];

      weatherOutput = (
        <>
          <div className="grid-container-airport-weather">
            <object
              className="grid-container-airport-weather-icon"
              type="image/svg+xml"
              onLoad={(e) => {
                const svg = e.currentTarget
                  .getSVGDocument()
                  ?.querySelector("svg");
                svg?.setAttribute("fill", "#FFF");
              }}
              data={getWeatherIcon(
                selectedAirport.weather.main?.[0].Weather?.[0].originalChunk ||
                  ""
              )}
            >
              &nbsp;
            </object>
          </div>
          <div className="grid-container-airport-item --airport-item">
            <div>
              <div className="grid-container-airport-item-title">Location</div>
              <div className="grid-container-airport-item-data">
                {`${municipality}, ${country}`}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">Observed</div>
              <div className="grid-container-airport-item-data">
                {start_time
                  ? format(new Date(start_time.dt), "MMM. dd, yyyy H.mm")
                  : "N/A"}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">Wind</div>
              <div className="grid-container-airport-item-data">
                {Wind[0].decodeResult}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">
                Temperature
              </div>
              <div className="grid-container-airport-item-data">
                {Temperature[0].decodeResult}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">
                Visibility
              </div>
              <div className="grid-container-airport-item-data">
                {handleVisibility(
                  Visibility,
                  weather.main[0]["Prevailing Visibility"]
                )}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">Clouds</div>
              <div className="grid-container-airport-item-data">
                {handleClouds(Clouds)}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">Altimeter</div>
              <div className="grid-container-airport-item-data">
                {Pressure[0].decodeResult}
              </div>
            </div>
            <div>
              <div className="grid-container-airport-item-title">METAR</div>
              <div className="grid-container-airport-item-data --metar">
                {metar_raw}
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="info-window airport-data info-window-enabled">
        <div className="info-window-details">
          <div className="info-window-details-name">
            <div>
              <h1>{icao}</h1>{" "}
              <span className="info-window-details-divider">/</span>{" "}
              <h4>{name}</h4>
            </div>
            <div
              className="info-window-close"
              onClick={() => {
                deselectAirportFunc();
              }}
            >
              X
            </div>
          </div>
          <div className="grid-container grid-container-airport --airport">
            {weatherOutput ? (
              weatherOutput
            ) : (
              <div className="grid-container-airport-no-data">
                No weather data is available at this time.
              </div>
            )}

            <Tabs
              callback={(activeTabCallback) => {
                setActiveTab(activeTabCallback);
              }}
              activeTab={activeTab}
              className="grid-container-airport-flights-container"
              tabData={tabData}
            />
          </div>
        </div>
      </div>
    );
  }

  return <div className="info-window"></div>;
};
