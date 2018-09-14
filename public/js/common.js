$(document).ready(function () {
	$("body").on("click", ".floating", function () {
		$("body").addClass("floated");
	});
	$("body").on("click", function (e) {
		if ($(e.target).hasClass("floated")) {
			$("body").removeClass("floated");
		}
	});
	$("body").on("click", ".footer .nav a", function (e) {
		e.preventDefault();
		$(".footer .nav a").removeClass("selected");
		$(this).addClass("selected");
		$(".floating-div").removeClass("selected");
		$("#f-" + $(this).attr("value")).addClass("selected");
		$("body").addClass("floated");
	});
});