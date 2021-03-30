$("document").ready(function() {
	$("#submit").click(function(){
		let title = $('input[name=title]').val();
		let username = $('input[name=username]').val();
    let password = $('input[name=password]').val();
    if (title.length < 1 || username.length < 1|| password.length < 1) {
      $(".alertSpace").html(`<div class = "badAlert">Sorry, your inputs need at least 1 character</div>`);
      return;
    }
		$.post('/newlogin', { title: title, username: username, password: password})  
			.always(function(response) {
				if (response.ok) {
          $(".alertSpace").html(`<div class = "okAlert">New login entry created successfully</div>`);
          $(".main").html("");
          $.get('/header').always(function(response) {
            $(".header").html(response);
          });
				}
				else {
					$(".alertSpace").html(`<div class = "badAlert">Something went wrong</div>`);
					$.get('/header').always(function(response) {
						$(".header").html(response);
					});
				}
			});
	});
});

function setPageTitle() {
  document.title = "New Login";
};
