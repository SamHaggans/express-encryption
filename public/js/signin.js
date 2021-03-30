$("document").ready(function() {
	$("#signin").click(function(){
		let pass = $('input[name=password]').val();
		let email = $('input[name=email]').val();
		$.post('/signin', { email: email, password: pass })  
			.always(function(response) {
				if (response.ok) {
           $(".alertSpace").html(`<div class = "okAlert">Signed in as ${response.username}</div>`);
           $(".main").html("");
				   $.get('/header').always(function(response) {
					$(".header").html(response);
					});
				}
				else {
					$(".alertSpace").html(`<div class = "badAlert">Incorrect Email/Password combination</div>`);
					$.get('/header').always(function(response) {
						$(".header").html(response);
					});
				}
			});
	});
});

function setPageTitle() {
  document.title = "Sign In";
};
