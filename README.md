# Global Fish Tracking System

A Destination Earth Platform use case.

This repository is the repository for the webapp of the Gloabl Fish Tracking Service (GFTS), a Destination Earth Platform Use Case procured by ESA.

## The GFTS in a nutshell

The lack of accurate modelling of fish movement, migration strategies, and site fidelity is a major challenge for policy-makers when they need to formulate effective conservation policies.
By relying on the Pangeo infrastructure on the DestinatE Platform, the Use Case aims to predict the sea bass behavior and develop a Decision Support Tool (DST) for “what-if” scenario planning.
As a result, the Use Case will help to obtain accurate insights into fish populations by introducing the Global Fish Tracking System (GFTS) and a Decision Support Tool into the DestinE Platform.

## Documentation

Documentation can be viewed at [https://destination-earth.github.io/DestinE_ESA_GFTS](https://destination-earth.github.io/DestinE_ESA_GFTS).

<a href="https://w3id.org/ro-id/2edcfa66-0f59-42f4-aa29-1c5681466424"> <img alt="RoHub" src="https://img.shields.io/badge/RoHub-FAIR_Executable_Research_Object-2ea44f?logo=Open+Access&logoColor=blue"></a>

## Data processing

This webapp uses the data processed during the project and published in [it's own repository](https://github.com/destination-earth/DestinE_ESA_GFTS).

## Deployment

The webapp is deployed on the DestinatE Platform via kubernetes and the here included [helm chart](./deploy/helm/README.md).

## Installation and Usage

The steps below will walk you through setting up your own instance of the webapp.

### Install Project Dependencies
To set up the development environment for this website, you'll need to install the following on your system:

- [Node](http://nodejs.org/) v24 (To manage multiple node versions we recommend [nvm](https://github.com/creationix/nvm))
- [Yarn](https://yarnpkg.com/) Package manager

### Install Application Dependencies

If you use [`nvm`](https://github.com/creationix/nvm), activate the desired Node version:

```
nvm install
```

Install Node modules:

```
yarn install
```

### Initialize the Submodules
The destine data repo is at: https://github.com/developmentseed/gfts-detine-data
If you cloned the repository with `git clone --recursive`, you can skip this step. Otherwise, run:

```
git submodule update --init --recursive
```

#### How the submodules are used
The submodule is a private repository that is used to include the Destine data which cannot be publicly shared.

When the app is built, the submodule is copied to the `destine` folder in the `dist` directory. The server will then handle requests to the `destine` folder and block the however is not authenticated.
**Therefore, even though the data looks like it is freely available, it is actually protected by the server.**

## Usage

### Config files
Configuration is done using [dot.env](https://parceljs.org/features/node-emulation/#.env-files) files.

These files are used to simplify the configuration of the app and should not contain sensitive information.

Run the project locally by copying the `.env` to `.env.local` and setting the following environment variables:


| VAR            | Description              |
| -------------- | ------------------------ |
| `MAPBOX_TOKEN` | Mapbox token for the map |

### Starting the app

```
yarn serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:9000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

## Map style
The map style being used is in the Devseed account. Update it through mapbox studio and publish to change it.
