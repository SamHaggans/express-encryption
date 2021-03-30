$("document").ready(function() {
	$.get('/header').always(function(response) {
        $(".header").html(response);
        setPageTitle();
	});
});