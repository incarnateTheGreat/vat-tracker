# Vat-Tracker

This application utilizes Mapbox to display live **VATSIM** data.

## Requirements to Operate

In order for the application to function, three functions need to be active:

1. React Dev server

2. Express server (operates Express connection to React Dev server and GraphQL)

3. MongoDB server

## Installation

Run the following from the Command Line:

```
git clone https://github.com/incarnateTheGreat/vatsim-tracker

cd vatsim-tracker
```

Once the above steps are complete, download the latest dependencies by running:

```
npm install
```

## Development Server

1. From the Command Line, run `npm start`.

2. Navigate to `http://localhost:4321/`. (You can change the PORT to whatever you wish via the package.json file)

## Information Server

In order to gather VATSIM and Airport (TBD) data, you need to have an Express Server running in the background.

1. From the Command Line, open a new tab.

2. Go to `server`.

3. Run `node server.js`, or use **nodemon** by running `nodemon server.js`.

4. Should prompt `Express servers started!` shortly afterwards.

## MongoDB Server

TBD.

## Tech Stack

Using:

- React (to run the Dev server and operate all front-end technology)
- Mapbox (to draw Map, specifically using react-map-gl)
- Express (to run backend server)
