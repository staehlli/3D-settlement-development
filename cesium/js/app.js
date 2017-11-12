// Sample Application with Cesium.js
// Settlement development of the city of Zurich in 3D dynamically animated over time
// Author: Lisa Staehli
// Project: Cartography Lab 2017
// Date: June-September 2017
// Cartography Lab - ETH Zurich

// setup a new Cesium viewer
var viewer = new Cesium.Viewer('cesiumContainer', {
	timeline: false, // no timeline (constructed manually)
	animation: false, // no animation
	baseLayerPicker: false, // Hide the base layer picker
	orderIndependentTranslucency: true,
	selectionIndicator: false, // no picking
	infoBox: false // no popup window
});

// short cuts
var scene = viewer.scene;
var camera = scene.camera;

// change scene visualization (make brighter)
scene.skyAtmosphere.brightnessShift = 0.2;
scene.globe.enableLighting = true;

// scene has no terrain due to the fact that 3D tiles do not have z-values
// however, to make animation so that buildings are first below ground not visible
// the depth test needs to be added
scene.globe.depthTestAgainstTerrain = true;

// fly to a predefined position
// TODO: change properties to zoom into your own dataset
camera.flyTo({
	destination: Cesium.Cartesian3.fromDegrees(8.544445, 47.349756, 800),
	orientation: {
		heading: 0.1098761258455383,
		pitch: -0.3341518649803201,
		roll: 0.0003890833756337031
	}
});

// load 3D tiles for existing buildings
// TODO: change tilename with the name of your tileset, copy your tileset in folder 3d-tiles
var tileset = new Cesium.Cesium3DTileset({
	url: './3d-tiles/tilename'
});
// add tileset to scene
scene.primitives.add(tileset);

// define initiale styling for tileset
tileset.readyPromise.then(function (tileset) {
	var boundingSphere = tileset.boundingSphere;
	var range = Math.max(100.0 - boundingSphere.radius, 0.0);
	viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, range));
	viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

	var properties = tileset.properties;

	// adjust initiale height off all buildings
	changeAllHeight(tileset, -48);

	// set initiale color and show properties
	// TODO: replace BAUJAHR everywhere with the respective year attribute in your dataset
	if (Cesium.defined(properties) && Cesium.defined(properties.BAUJAHR)) {
		tileset.style = new Cesium.Cesium3DTileStyle({
			color:
			{
				conditions: [
					["${BAUJAHR} === null", "rgba(255,255,255, 0.5)"], // grey
					["true", "rgb(253,166,6)"] // orange
				]
			},
			show: {
				conditions: [
					["${BAUJAHR} === null", 'true'],
					['${BAUJAHR} > 1850', 'false'],
					['true', 'true']
				]
			}
		});
	}

	// trigger timelineAnimation for current year at start up
	timelineAnimation(1850);

}).otherwise(function (error) {
	throw (error);
});

// add 3D tiles for animated buildings
var tilesetAnimation = new Cesium.Cesium3DTileset({
	url: './3d-tiles/buildings_footprints'
});
// add tileset to scene
scene.primitives.add(tilesetAnimation);

// define initiale styling for tileset
tilesetAnimation.readyPromise.then(function (tilesetAnimation) {
	var boundingSphere = tilesetAnimation.boundingSphere;
	var range = Math.max(100.0 - boundingSphere.radius, 0.0);
	viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, range));
	viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

	var properties = tilesetAnimation.properties;

	// adjust initiale height off all buildings
	changeAllHeight(tilesetAnimation, -48);

	// set initiale color and show property
	// TODO: replace BAUJAHR everywhere with the respective year attribute in your dataset
	if (Cesium.defined(properties) && Cesium.defined(properties.BAUJAHR)) {
		tilesetAnimation.style = new Cesium.Cesium3DTileStyle({
			color: "rgb(3,78,123)",
			show: {
				conditions: [
					["${BAUJAHR} === null", 'false'],
					['${BAUJAHR} >= 1850', 'false']
				]
			}
		});
	}

}).otherwise(function (error) {
	throw (error);
});

// global variable height interval
var heightInterval;

// function to adjust height of all buildings (see: https://cesiumjs.org/Cesium/Apps/Sandcastle/gallery/3D%20Tiles%20Adjust%20Height.html)
function changeAllHeight(currenttileset, height) {
	height = Number(height);
	if (isNaN(height)) {
		return;
	}

	var cartographic = Cesium.Cartographic.fromCartesian(currenttileset.boundingSphere.center); // find cartographic coordinates of tileset (center)
	var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0); // find surface (on height = 0)
	var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height); // find offset to surface (delta h)
	var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3()); // compute translatation from surface to new height
	currenttileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation); // perform translation on the whole tileset
}

// add timeline slider (noUISlider: https://refreshless.com/nouislider/)
var softSlider = document.getElementById('soft');

noUiSlider.create(softSlider, {
	start: 1850,
	connect: "lower",
	range: {
		min: 1850,
		max: 2030
	},
	pips: {
		mode: 'values',
		values: [1850, 1900, 1920, 1940, 1960, 1980, 1990, 2000, 2005, 2010, 2015, 2030],
		density: 50
	},
	format: wNumb({
		decimals: 0
	})
});

// start timeline animation when user interacts with slider
softSlider.noUiSlider.on('change', function (values, handle) {
	timelineAnimation(values[0]);
});

/* add WMS layer with Cesiums default proxy (only works when node js server is running, start with "npm run start")
var wmsLayer = new Cesium.WebMapServiceImageryProvider({
	url: 'http://www.gis.stadt-zuerich.ch/maps/services/wms/WMS-ZH-STZH-OGD/MapServer/WMSServer',
	parameters: {
		transparent: 'false',
		format: 'image/png'
	},
	layers: 'Uebersichtsplan_2016',
	proxy: new Cesium.DefaultProxy('/proxy/')
});
// add wms layer to viewer
viewer.imageryLayers.addImageryProvider(wmsLayer);*/

// timeline animation
var buttonPlay = document.getElementById("button-play");
var buttonStop = document.getElementById("button-stop");

// start animation
buttonPlay.addEventListener("click", function () {
	// change UI of button
	buttonPlay.style.display = "none";
	buttonStop.style.display = "inline-block";

	var year = this.currentYear + 1;

	this.timelineInterval = setInterval(function () {
		// cancel Interval
		softSlider.noUiSlider.set(year);
		timelineAnimation(year); // trigger timeline animation
		year += 1; // increase year
		if (year === 2031) { year = 1850; } // make loop
	}.bind(this), 2000);

}.bind(this));

// stop animation
buttonStop.addEventListener("click", function () {
	// change UI of button
	buttonPlay.style.display = "inline-block";
	buttonStop.style.display = "none";

	clearInterval(this.timelineInterval);

}.bind(this));

function timelineAnimation(year) {
	// animate buildings (show, color) based on current year on timeline and animate height of buildings
	this.currentYear = parseInt(year); // convert to int incase it's a string

	// adjust the height of animate buildings so they are below ground to start animation
	changeAllHeight(tilesetAnimation, -175);

	// change displayed year in the UI
	document.getElementById("timeline-count").innerHTML = year;

		// built condition for buildings that have not been built yet
		// TODO: replace BAUJAHR everywhere with the respective year attribute in your dataset
		var condition = "${BAUJAHR} >= " + this.currentYear + "";

		if (Cesium.defined(tileset.properties) && Cesium.defined(tileset.properties.BAUJAHR)) {
			tileset.style = new Cesium.Cesium3DTileStyle({
				color:
				{
					conditions: [
						["${BAUJAHR} === null", "rgba(255,255,255, 0.5)"], // grey
						["true", "rgb(253,166,6)"] // orange
					]
				},
				show: {
					conditions: [
						["${BAUJAHR} === null", 'true'],
						[condition, 'false'], // do not show buildings that have not been built yet
						['true', 'true']
					]
				}
			});
		}

		// show the buildings from the current year and animate their height (growing out of the ground)
		if (tilesetAnimation !== undefined) {

			var conditionExact = "${BAUJAHR} === " + this.currentYear + ""; // animate
			var conditionMin = "${BAUJAHR} < " + this.currentYear + ""; // do not show in this tileset for animation
			var conditionMax = "${BAUJAHR} > " + this.currentYear + ""; // do not show in this tileset for animation

			if (Cesium.defined(tilesetAnimation.properties) && Cesium.defined(tilesetAnimation.properties.BAUJAHR)) {
				tilesetAnimation.style = new Cesium.Cesium3DTileStyle({
					color: "rgb(3,78,123)", // blue
					show: {
						conditions: [
							["${BAUJAHR} === null", 'false'],
							[conditionExact, 'true'],
							[conditionMin, 'false'],
							[conditionMax, 'false'],
						]
					}
				});
			}
			// trigger height animation
			animateHeight();
			
		}

	
}

function animateHeight() {
	if (heightInterval !== undefined){
		clearInterval(heightInterval);
	}

	// animate buildings to grow out of the ground
	var height = -100; // starting point at an average height of 52m

	// start interval
	heightInterval = setInterval(function () {
		// trigger change height function
		changeAllHeight(tilesetAnimation, height);
		if (height >= -48) { // building reaches ground
			clearInterval(heightInterval);
			return
		} else {
			height += 1; // increase height by 1m
		}
	}.bind(this), 20);

	return heightInterval;

}