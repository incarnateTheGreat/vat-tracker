import React from "react";
import { getAirports } from "../../api/api";
import { assembleAiportData } from "../../helpers/utils";
import { ICluster } from "../../declaration/app";
import { Autocomplete } from "../Autocomplete/autocomplete.component";

export const NavigationMenu = ({
  clusterData,
  toggleNavigationMenu,
  setToggleNavigationMenu,
  selectFlightFunc,
  setDisplaySelectedFlight,
  selectAirportFunc,
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
                selectFlightFunc(foundFlight.properties.callsign, true);
                setDisplaySelectedFlight(false);
                setToggleNavigationMenu(false);
              }
            }}
            placeholder="Search for Callsign"
            searchCompareValue="properties.combined"
            searchReturnValue="properties.callsign"
            selectionData={clusterData}
          />

          <Autocomplete
            callback={async (value) => {
              const icaoRes = await getAirports(value);

              const icaos = assembleAiportData(icaoRes.results ?? []);

              setIcaoData(icaos);

              return icaos;
            }}
            onSelect={async (callsign) => {
              const icaoRes =
                icaoData.find((icaoObj) => icaoObj["icao"] === callsign) || {};

              if (icaoRes) {
                selectAirportFunc(icaoRes.id);
              }
            }}
            placeholder="Search for ICAO"
            searchCompareValue="combined"
            searchReturnValue="icao"
            selectionData={icaoData}
            usesService={true}
          />
        </nav>
      </div>
    );
  }

  return <div className="navigation-menu"></div>;
};
