import React from "react";
import { getAirports } from "../../api/api";
import { ICluster } from "../../declaration/app";
import { Autocomplete } from "../Autocomplete/autocomplete.component";

export const NavigationMenu = ({
  clusterData,
  toggleNavigationMenu,
  setToggleNavigationMenu,
  selectFlightFunc,
  setDisplaySelectedFlight,
  selectAirportFunc,
  setIcaoInput,
  setIcaoData,
  icaoData,
}) => {
  if (toggleNavigationMenu) {
    return (
      <div
        className={`navigation-menu ${
          toggleNavigationMenu ? "navigation-menu-enabled" : ""
        }`}
      >
        <div className="navigation-menu-top">
          <h2>Vat-Tracker</h2>
          <div
            className="navigation-menu-close"
            onClick={() => setToggleNavigationMenu(false)}
          >
            X
          </div>
        </div>

        <nav className="navigation-menu-links">
          <Autocomplete
            onSelect={(callsign) => {
              const foundFlight = clusterData.find(
                (flight: ICluster) => flight.properties.callsign === callsign
              );

              if (foundFlight) {
                selectFlightFunc(foundFlight.properties.id, true);
                setDisplaySelectedFlight(false);
                setToggleNavigationMenu(false);
              }
            }}
            placeholder="Search for Callsign"
            searchCompareValue="properties.callsign"
            selectionData={clusterData}
          />

          <Autocomplete
            callback={async (value) => {
              setIcaoInput(value);

              const icaoRes = await getAirports(value);

              setIcaoData(icaoRes.results ?? []);

              return icaoRes.results ?? [];
            }}
            onSelect={async (callsign) => {
              const icaoRes =
                icaoData.find((icaoObj) => icaoObj["icao"] === callsign) || {};

              if (icaoRes) {
                selectAirportFunc(icaoRes.id);
              }
            }}
            placeholder="Search for ICAO"
            searchCompareValue="icao"
            selectionData={icaoData}
            usesService={true}
          />
        </nav>
      </div>
    );
  }

  return <div className="navigation-menu"></div>;
};
