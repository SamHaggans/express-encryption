$("document").ready(function() {
	$("#submit").click(function(){
		let title = $('input[name=title]').val();
		let content = $('#content').val();
    if (content.length < 1 || title.length < 1) {
      $(".alertSpace").html(`<div class = "badAlert">Sorry, your inputs need at least 1 character</div>`);
      return;
    }
		$.post('/newnote', { title: title, content: content })  
			.always(function(response) {
				if (response.ok) {
           $(".alertSpace").html(`<div class = "okAlert">New note created successfully</div>`);
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
  document.title = "New Note";
};
