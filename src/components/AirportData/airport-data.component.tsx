import React from "react";
import { format } from "date-fns";

export const AirportData = ({
  deselectAirportFunc,
  selectedAirport,
  displaySelectedAirport,
  selectFlightFunc,
}) => {
  // useEffect(() => {
  //   console.log(selectedAirport.weather.main[0]);
  // }, []);
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
            <div>Departures</div>
            <div>
              {selectedAirport.departures.length > 0 ? (
                selectedAirport.departures.map((departure, key) => (
                  <div
                    className="grid-container-airport-item-departures"
                    key={key}
                  >
                    <div className="grid-container-airport-item-departures-departure">
                      <span
                        onClick={() => selectFlightFunc(departure.id, true)}
                      >
                        {departure.callsign}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div>None</div>
              )}
            </div>

            <div>Arrivals</div>
            {selectedAirport.arrivals.length > 0 ? (
              selectedAirport.arrivals.map((arrival, key) => (
                <div className="grid-container-airport-item-arrivals" key={key}>
                  <div className="grid-container-airport-item-arrivals-arrival">
                    <span onClick={() => selectFlightFunc(arrival.id, true)}>
                      {arrival.callsign}
                    </span>
                  </div>
                  <div className="grid-container-airport-item-arrivals-arrival">
                    {arrival.planned_dep_airport__icao}
                  </div>
                </div>
              ))
            ) : (
              <div>None</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div className="info-window"></div>;
};
