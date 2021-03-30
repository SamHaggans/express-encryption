$("document").ready(function() {
	$.post('/getnotes')  
			.always(function(response) {
				if (response.ok) {
					 $(".notes").html(response.html);
					 $(".listItem").click(function() {
						window.location.href = "/note/"+$(this).attr('id');
					});
          $("#new").click(function() {
						window.location.href = "/notes/new";
					});
				}
			});
			
});

function setPageTitle() {
  document.title = "Notes";
};
