
// http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=37.53943995986522,126.81031553337652&wp.1=37.5926423814134,126.92773191521246&optmz=distance&rpo=Points&key=AryAZRhS0-T1-ixk07xwcfx_WlwE98m1WIb_gHZad4Ht63L4EEyF2fAVujvQUoxw


var initMap = function () {
	// resourceSets.resources.routePath.line.coordinates

	var search_pin = new google.maps.places.Autocomplete($("#search-pin")[0]);
	var search_route1 = new google.maps.places.Autocomplete($("#search-route1")[0]);
	var search_route2 = new google.maps.places.Autocomplete($("#search-route2")[0]);
	var infowindow = new google.maps.InfoWindow();
	var map = new google.maps.Map(document.getElementById("map"));

	search_pin.addListener('place_changed', function () {
		// infowindow.close();
		// marker.setVisible(false);
		var place = search_pin.getPlace();
		if (!place.geometry) {
			// User entered the name of a Place that was not suggested and
			// pressed the Enter key, or the Place Details request failed.
			// swal("No details available for input: '" + place.name + "'");
			return;
		}

		// // If the place has a geometry, then present it on a map.
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(17);  // Why 17? Because it looks good.
		}
		// marker.setPosition(place.geometry.location);
		// marker.setVisible(true);

		// var address = '';
		// if (place.address_components) {
		// 	address = [
		// 		(place.address_components[0] && place.address_components[0].short_name || ''),
		// 		(place.address_components[1] && place.address_components[1].short_name || ''),
		// 		(place.address_components[2] && place.address_components[2].short_name || '')
		// 	].join(' ');
		// }

		// infowindowContent.children['place-icon'].src = place.icon;
		// infowindowContent.children['place-name'].textContent = place.name;
		// infowindowContent.children['place-address'].textContent = address;
		// infowindow.open(map, marker);
	});

	$.ajax({
		url: 'https://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=37.53943995986522,126.81031553337652&wp.1=37.5926423814134,126.92773191521246&optmz=distance&rpo=Points&key=AryAZRhS0-T1-ixk07xwcfx_WlwE98m1WIb_gHZad4Ht63L4EEyF2fAVujvQUoxw',
		processData: false,
		contentType: false,
		dataType: "json",
		cache: false,
		type: 'GET'
	}).done(function (data) {
		console.log(data);

		var coordinates = data.resourceSets[0].resources[0].routePath.line.coordinates;
		var i = 0;

		var path = [];

		for (i = 0; i < coordinates.length; i++) {
			path.push({
				lat: coordinates[i][0],
				lng: coordinates[i][1]
			});
		}


		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				p = position;
				var mapProp = {
					center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
					zoom: 17,
					disableDefaultUI: true
				};
				map = new google.maps.Map(document.getElementById("map"), mapProp);

				var flightPath = new google.maps.Polyline({
					path: path,
					geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 2
				});

				flightPath.setMap(map);
			});
		}
	}).fail(function (err) {
		console.log(err);
	}).always(function () {
	});

}

$(document).ready(function () {
	var camera = $("#camera")[0];
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		// Not adding `{ audio: true }` since we only want video now
		var cameras = [];
		navigator.mediaDevices.enumerateDevices().then(function (d) {
			var i = 0;
			for (i = 0; i < d.length; i++) {
				if (d[i].kind == "videoinput") {
					cameras.push(d[i]);
				}
			}
		}).then(function () {
			navigator.mediaDevices.getUserMedia({
				video: {
					deviceId: { exact: cameras[1].deviceId }
				}
			}).then(function (stream) {
				camera.src = window.URL.createObjectURL(stream);
				camera.play();
				// console.log(camera);
				// var percent = camera.videoHeight / camera.videoWidth * 100;
				// alert(percent);
				// $("#cameraDiv").css("padding-bottom", percent + "%");
			});
		});
	}
})