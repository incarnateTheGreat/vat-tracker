import React from "react";

export const AirportData = ({
  deselectFlightFunc,
  selectedAirport,
  displaySelectedAirport,
}) => {
  if (selectedAirport && displaySelectedAirport) {
    const {
      icao,
      name,
      observed,
      wind,
      flight_category,
      visibility,
      clouds,
      dewpoint,
      barometer,
      raw_text,
    } = selectedAirport;

    const handleClouds = () => {
      console.log(clouds);

      return <div>Clouds...</div>;
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
                deselectFlightFunc();
              }}
            >
              X
            </div>
          </div>
          <div className="grid-container grid-container-airport">
            <div className="grid-container-airport-item">
              <div>
                <div className="grid-container-airport-item-title">
                  Observed
                </div>
                <div className="grid-container-airport-item-data">
                  {observed}
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">
                  Flight Rules
                </div>
                <div className="grid-container-airport-item-data">
                  {flight_category}
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">Wind</div>
                <div className="grid-container-airport-item-data">
                  {wind.degrees}&deg; at {wind.speed_kts} KTS
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">
                  Visibility
                </div>
                <div className="grid-container-airport-item-data">
                  {visibility.miles} miles
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
                  Dewpoint
                </div>
                <div className="grid-container-airport-item-data">
                  {dewpoint.celsius} &deg;C / {dewpoint.fahrenheit} &deg;F
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">
                  Altimeter
                </div>
                <div className="grid-container-airport-item-data">
                  {barometer.hg} Hg
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">
                  Pressure
                </div>
                <div className="grid-container-airport-item-data">
                  {barometer.hpa} hPa
                </div>
              </div>
              <div>
                <div className="grid-container-airport-item-title">METAR</div>
                <div className="grid-container-airport-item-data">
                  {raw_text}
                </div>
              </div>
            </div>

            <div className="grid-container-airport-weather">weather</div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="info-window"></div>;
};
