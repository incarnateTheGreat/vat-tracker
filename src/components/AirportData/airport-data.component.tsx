import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { getTypeOfAircraft } from "../../helpers/utils";
import { Tabs } from "../Tabs/tabs.component";

export const AirportData = ({
  deselectAirportFunc,
  selectedAirport,
  displaySelectedAirport,
  selectFlightFunc,
}) => {
  const [tabData, setTabData] = useState<object[]>([]);

  // Sort the Departures and Arrivals data.
  const sortAirportData = (airportObj) => {
    return airportObj.sort((a, b) => {
      if (a.callsign < b.callsign) {
        return -1;
      }

      if (a.callsign > b.callsign) {
        return 1;
      }

      return 0;
    });
  };

  useEffect(() => {
    setTabData([
      {
        label: "Departures",
        component: (
          <>
            <section>
              <div className="grid-container-airport-flights">
                <div className="grid-container-airport-flights-departures">
                  <div className="grid-container-airport-flights-departures-departure">
                    Flight
                  </div>
                  <div className="grid-container-airport-flights-departures-departure">
                    To
                  </div>
                  <div className="grid-container-airport-flights-departures-departure">
                    Aircraft
                  </div>
                </div>
                {selectedAirport.departures.length > 0 ? (
                  sortAirportData(selectedAirport.departures).map(
                    (departure, key) => (
                      <div
                        className="grid-container-airport-flights-departures"
                        key={key}
                        onClick={() => selectFlightFunc(departure.id, true)}
                      >
                        <div className="grid-container-airport-flights-departures-departure">
                          <span>{departure.callsign}</span>
                        </div>
                        <div className="grid-container-airport-flights-departures-departure">
                          {departure.planned_dest_airport__icao}
                        </div>
                        <div className="grid-container-airport-flights-departures-departure">
                          {getTypeOfAircraft(departure.planned_aircraft)}
                        </div>
                      </div>
                    )
                  )
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
                <div className="grid-container-airport-flights-departures">
                  <div className="grid-container-airport-flights-departures-departure">
                    Flight
                  </div>
                  <div className="grid-container-airport-flights-departures-departure">
                    From
                  </div>
                  <div className="grid-container-airport-flights-departures-departure">
                    Aircraft
                  </div>
                </div>
                {selectedAirport.arrivals.length > 0 ? (
                  sortAirportData(selectedAirport.arrivals).map(
                    (arrival, key) => (
                      <div
                        className="grid-container-airport-flights-arrivals"
                        key={key}
                        onClick={() => selectFlightFunc(arrival.id, true)}
                      >
                        <div className="grid-container-airport-flights-arrivals-arrival">
                          <span>{arrival.callsign}</span>
                        </div>
                        <div className="grid-container-airport-flights-arrivals-arrival">
                          {arrival.planned_dep_airport__icao}
                        </div>
                        <div className="grid-container-airport-flights-arrivals-arrival">
                          {getTypeOfAircraft(arrival.planned_aircraft)}
                        </div>
                      </div>
                    )
                  )
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
  }, [selectedAirport]);

  if (selectedAirport && displaySelectedAirport) {
    const iconPath = "./images/weather-icons";
    const { icao, name, weather } = selectedAirport;
    const { main, metar_raw, start_time } = weather;
    const { Clouds, Pressure = "N/A", Temperature, Visibility, Wind } = main[0];

    const handleClouds = () => {
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

    const handleVisibility = () => {
      let vis = "";

      if (Visibility) {
        vis = Visibility[0].decodeResult;
      } else if (main[0]["Prevailing Visibility"]) {
        vis = main[0]["Prevailing Visibility"][0].decodeResult;
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
          return `${iconPath}/wi-rain.svg`;
        case "TS":
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
                  selectedAirport.weather.main?.[0].Weather?.[0]
                    .originalChunk || ""
                )}
              >
                &nbsp;
              </object>
            </div>
            <div className="grid-container-airport-item --airport-item">
              <div>
                <div className="grid-container-airport-item-title --airport-item-title">
                  Observed
                </div>
                <div className="grid-container-airport-item-data --airport-item-data">
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
                  Visibility
                </div>
                <div className="grid-container-airport-item-data">
                  {handleVisibility()}
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">Clouds</div>
                <div className="grid-container-airport-item-data">
                  {handleClouds()}
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">
                  Altimeter
                </div>
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

            <Tabs
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
