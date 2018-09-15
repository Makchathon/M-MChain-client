
// http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=37.53943995986522,126.81031553337652&wp.1=37.5926423814134,126.92773191521246&optmz=distance&rpo=Points&key=AryAZRhS0-T1-ixk07xwcfx_WlwE98m1WIb_gHZad4Ht63L4EEyF2fAVujvQUoxw

var mapLoaded = false;
var current_location = {};
var map = {};
var initMap = function () {
	// resourceSets.resources.routePath.line.coordinates

	var search_pin = new google.maps.places.Autocomplete($("#search-pin")[0]);
	var search_route1 = new google.maps.places.Autocomplete($("#search-route1")[0]);
	var search_route2 = new google.maps.places.Autocomplete($("#search-route2")[0]);
	map = new google.maps.Map(document.getElementById("map"));


	$("body").on("click", "#current-location", function (e) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				p = position;
				map.setCenter(new google.maps.LatLng(p.coords.latitude, p.coords.longitude));
			});
		}
	});

	current_location = new google.maps.Marker({
		map: map,
		position: new google.maps.LatLng(100, 100),
		icon: "https://s3-ap-northeast-1.amazonaws.com/langchain/location.png"
	});
	setTimeout(function () {
		current_location.setMap(map);
	}, 1000)

	search_route2.addListener("place_changed", function () {


		var place1 = search_route1.getPlace();
		if (!place1.geometry) {
			// User entered the name of a Place that was not suggested and
			// pressed the Enter key, or the Place Details request failed.
			// swal("No details available for input: '" + place.name + "'");
			return;
		}

		// // If the place has a geometry, then present it on a map.
		if (place1.geometry.viewport) {
			map.fitBounds(place1.geometry.viewport);
		} else {
			map.setCenter(place1.geometry.location);
			map.setZoom(17);  // Why 17? Because it looks good.
		}

		var place2 = search_route2.getPlace();
		if (!place2.geometry) {
			// User entered the name of a Place that was not suggested and
			// pressed the Enter key, or the Place Details request failed.
			// swal("No details available for input: '" + place.name + "'");
			return;
		}

		// // If the place has a geometry, then present it on a map.
		// if (place2.geometry.viewport) {
		// 	map.fitBounds(place2.geometry.viewport);
		// } else {
		// 	map.setCenter(place2.geometry.location);
		// 	map.setZoom(17);  // Why 17? Because it looks good.
		// }



		$.ajax({
			url: 'https://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=' + place1.geometry.location.lat() + ',' + place1.geometry.location.lng() + '&wp.1=' + place2.geometry.location.lat() + ',' + place2.geometry.location.lng() + '&optmz=distance&rpo=Points&key=AryAZRhS0-T1-ixk07xwcfx_WlwE98m1WIb_gHZad4Ht63L4EEyF2fAVujvQUoxw',
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

			carPath = new google.maps.Polyline({
				path: path,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});

			carPath.setMap(map);


		}).fail(function (err) {
			console.log(err);
		}).always(function () {
		});
	})











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

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			p = position;
			var mapProp = {
				center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
				zoom: 17,
				disableDefaultUI: true
			};
			map = new google.maps.Map(document.getElementById("map"), mapProp);
		});
	}

	mapLoaded = true;

}

$(document).ready(function () {
	var socket = io.connect(location.protocol + "//" + location.host);

	var camera = $("#camera")[0];
	var localMediaStream = null;


	var snapshot = function () {
		if (localMediaStream) {
			var canvas = document.createElement("canvas");
			canvas.width = camera.videoWidth;
			canvas.height = camera.videoHeight;
			canvas.getContext('2d')
				.drawImage(camera, 0, 0, canvas.width, canvas.height);
			$("#preview").attr("src", canvas.toDataURL('image/png'));


			$(".floating-div").removeClass("selected");
			$("#f-contribute-2").addClass("selected");
		}
	}

	$("body").on("click", "#capture", function () {
		snapshot();
		$(".tags").empty();
		$("#insert_tag").val("");
	})

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
				localMediaStream = stream;

				// console.log(camera);
				// var percent = camera.videoHeight / camera.videoWidth * 100;
				// alert(percent);
				// $("#cameraDiv").css("padding-bottom", percent + "%");
			});
		});
	}

	$("body").on("keydown", "#insert_tag", function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			$(".tags").append("<div class='tag'>" + $(this).val() + "</div>");
			$(this).val("");
		}
	});

	$("body").on("click", ".tags .tag", function () {
		$(this).remove();
	});

	$("body").on("submit", "#frmContribute", function (e) {
		e.preventDefault();
		// user: hycon wallet address
		// longitude: 경도
		// latitude: 위도
		// tags: 태그, list
		// img: 사진, file
		// memo
		var formData = new FormData($(this)[0]);
		var i = 0;
		var tags = [];
		for (i = 0; i < $(".tags .tag").length; i++) {
			tags.push($($(".tags .tag")[i]).text());
		}
		formData.append("tags", tags.join(","));



		$.ajax({
			url: 'https://fabius.ciceron.xyz:5000/post',
			processData: false,
			contentType: false,
			dataType: "json",
			cache: false,
			data: formData,
			type: 'POST',
		}).done(function (data) {

			swal({
				title: "Congratulations!",
				text: "Successfully contributed to map data. You have received 5 MT.",
				button: "OK",
				icon: "success"
			}).then(function (value) {
				location.reload();

			});
		}).fail(function (err) {

			swal({
				title: "Congratulations!",
				text: "Successfully contributed to map data. You have received 5 MT.",
				button: "OK",
				icon: "success"
			}).then(function (value) {
				location.reload();

			});
		}).always(function () {
		});
	})

	setInterval(function () {
		if (mapLoaded && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				p = position;
				// map.setCenter(new google.maps.LatLng(p.coords.latitude, p.coords.longitude));
				// current_location.setMap(null);
				// current_location = new google.maps.Marker({
				// 	position: new google.maps.LatLng(p.coords.latitude, p.coords.longitude),
				// 	map: map
				// });
				current_location.setPosition(new google.maps.LatLng(p.coords.latitude, p.coords.longitude));
				$("[name=latitude]").val(p.coords.latitude);
				$("[name=longitude]").val(p.coords.longitude);

				socket.emit("requestPlaces", {
					latitude: p.coords.latitude,
					longitude: p.coords.longitude,
					range: 0.0005
				});

				// map.panTo(new google.maps.LatLng(p.coords.latitude, p.coords.longitude));
			});
		}
	}, 3000)




	var placeDataList = [];


	// {
	// 	place: {},
	// 	infoWindow: {}
	// }
	socket.on("places", function (data) {
		try {
			data = JSON.parse(data);
			console.log(data);

			var i = 0;
			var j = 0;
			var newPlaceDataList = [];
			for (j = 0; j < data.places.length; j++) {
				for (i = 0; i < placeDataList.length; i++) {
					if (placeDataList[i].place.id == data.places[j].id) {
						newPlaceDataList.push(placeDataList[i]);
						break;
					}
				}

				if (i >= placeDataList.length) {
					var infoWindow = new google.maps.InfoWindow({
						content: "<img src='http://fabius.ciceron.xyz:5000/img/" + data.places[j].id + "' style='width: 100%;'><br>" + data.places[j].tags,
						maxWidth: 50,
						position: new google.maps.LatLng(data.places[j].latitude, data.places[j].longitude)
					});
					infoWindow.open(map);


					newPlaceDataList.push({
						place: data.places[j],
						infoWindow: infoWindow
					})
				}
			}

			for (j = 0; j < newPlaceDataList.length; j++) {
				for (i = 0; i < placeDataList.length; i++) {
					if (placeDataList[i].place.id == newPlaceDataList[j].place.id) {
						placeDataList.splice(i, 1);
						break;
					}
				}
			}

			for (i = 0; i < placeDataList.length; i++) {
				placeDataList.infoWindow.close(map);
			}
			placeDataList = newPlaceDataList;

		}
		catch (e) {

		}
	});



	// user_address = request.values.get('user', None)  # 토큰받을 사용자의 address
	// longitude = request.values.get('longitude', None)  # 경도
	// latitude = request.values.get('latitude', None)  # 위도
	// memo = request.values.get('memo', None)

	// taglist = request.values.getlist('tags', None)
	// tags = ','.join(taglist)

	// img = request.files.get('img', None)
	// img_name = img.filename
	// img_mimetype = img.content_type



})