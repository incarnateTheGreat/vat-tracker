import React from "react";
import { format } from "date-fns";

export const AirportData = ({
  deselectAirportFunc,
  selectedAirport,
  displaySelectedAirport,
}) => {
  if (selectedAirport && displaySelectedAirport) {
    const { icao, name, weather } = selectedAirport;

    console.log(selectedAirport);

    const { main, metar_raw, start_time } = weather;

    const { Clouds, Pressure, Temperature, Visibility, Wind } = main[0];

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

    const getWeatherIcon = (icon) => {
      switch (icon) {
        case "RA":
          return "wi-rain";
        // case "clear-night":
        //   return "wi-night-clear";
        // case "few":
        //   return "wi-cloudy";
        // case "scattered":
        // case "broken":
        //   return "wi-sunny-overcast";
        // case "cloudy":
        // case "overcast":
        //   return "wi-cloudy";
        // case "fog":
        // case "mist":
        //   return "wi-fog";
        // case "rain":
        // case "drizzle":
        //   return "wi-rain";
        // case "wind":
        //   return "wi-windy";
        // case "snow":
        //   return "wi-snow";
        // case "clear-day":
        //   return "wi-sunny";
        // case "partly-cloudy-night":
        //   return "wi-night-partly-cloudy";
        // default:
        //   return "wi-na";
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
              <embed
                className="grid-container-airport-weather-icon"
                type="image/svg+xml"
                src="./images/weather-icons/wi-cloud.svg"
              />
            </div>
            <div className="grid-container-airport-item --airport-item">
              <div>
                <div className="grid-container-airport-item-title --airport-item-title">
                  Observed
                </div>
                <div className="grid-container-airport-item-data --airport-item-data">
                  {format(new Date(start_time.dt), "yyyy-MM-dd H:mm:ss")}
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
          </div>
        </div>
      </div>
    );
  }

  return <div className="info-window"></div>;
};
