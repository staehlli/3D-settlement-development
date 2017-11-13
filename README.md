# 3D-settlement-development

![ArcGIS API for JavaScript](http://osgl.ethz.ch/showcases/settlement-development-of-zurich-arcgis-api/thumbnail.png)
![Cesium](http://osgl.ethz.ch/showcases/settlement-development-of-zurich-cesium/thumbnail.png)

- [Live Sample ArcGIS API for JavaScript](http://osgl.ethz.ch/showcases/settlement-development-of-zurich-arcgis-api/)
- [Live Sample Cesium](http://osgl.ethz.ch/showcases/settlement-development-of-zurich-cesium/)

## About

This project has been developed in the course of the [Cartography Lab](http://www.vvz.ethz.ch/lerneinheitPre.do?semkez=2016S&lerneinheitId=103817&lang=de) at ETH Zurich with the aim to compare two well-known 3D Mapping APIs with each other. This was done by implementing the same application with both APIs in the most similar way possible. The applications show the settlement development of the city of Zurich from 1850-2030 implemented in two different Virtual Globes for comparison purposes:
- [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) (V 4.5) 
- [Cesium.js](https://cesiumjs.org/index.html) (V 1.37)

The 3D Web Apps feature 3D building blocks and an animated timeline that will trigger to show and hide buildings based on the selected year. The Cesium application additionally has a height-dependent animation of the buildings of the selected year (growing out of the ground).

For the ArcGIS API for JavaScript application, the 3D data layers have been published as Scene Layer Packages (.slpk) to ArcGIS Online according to the [i3s](https://developers.arcgis.com/3d/indexed-3d-scene-layers/) OGC Standard.

The Cesium application uses [3D-Tiles](https://cesium.com/blog/2015/08/10/introducing-3d-tiles/) to display the 3D data which is an open specification for streaming massive heterogeneous 3D geospatial datasets.

## Install

The following code for both API samples can be used to build your own 3D settlement development animation. Please follow the steps below to build an application with your own dataset:

### ArcGIS API for JavaScript

1. Fork and clone (or download) this repo.
2. Create the node_modules folder by prompting in folder "arcgis":
```
$ npm install
```
3. Publish your own dataset with 3D buildings and a year attribute to ArcGIS Online.
4. Retrieve the Service URL of your published data set.
5. In the repo, move to folder "arcgis" and adjust the code in js/app.js on all TODOs:
- add your Service URL
- add the name of the year attribute
- change the view.goTo property so your application zooms to your city/dataset
6. Done!

### Cesium

1. Fork and clone (or download) this repo.
2. Create the node_modules folder by prompting in folder "cesium":
```
$ npm install
```
3. Convert your own dataset with 3D buildings and a year attribute as 3D Tiles (e.g. with FME).
4. Move your dataset to folder cesium/3d-tiles.
5. In the repo, move to folder cesium/js and adjust the code in app.js on all TODOs:
- add the name of your 3d-tiles
- change the name of the year attribute
- change the camera.flyTo property so your application zooms to your city/dataset
6. Done!

## Copyright ETH Zurich

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
