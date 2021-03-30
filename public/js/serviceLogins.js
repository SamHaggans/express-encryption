$("document").ready(function() {
	$.post('/getlogins')  
			.always(function(response) {
				if (response.ok) {
					 $(".logins").html(response.html);
					 $(".listItem").click(function() {
						window.location.href = "/login/"+$(this).attr('id');
					});
          $("#new").click(function() {
						window.location.href = "/logins/new";
					});
				}
			});
  
  $("#search").click(function() {
    let searchContent = $('input[name=searchContent]').val();
    $.post('/searchlogins', { search: searchContent})   
			.always(function(response) {
				if (response.ok) {
					 $(".logins").html(response.html);
					 $(".listItem").click(function() {
						window.location.href = "/login/"+$(this).attr('id');
					});
          $("#new").click(function() {
						window.location.href = "/logins/new";
					});
				}
			});
  });

  $("#clear").click(function() {
    $.post('/getlogins')  
			.always(function(response) {
				if (response.ok) {
					 $(".logins").html(response.html);
					 $(".listItem").click(function() {
						window.location.href = "/login/"+$(this).attr('id');
					});
          $("#new").click(function() {
						window.location.href = "/logins/new";
					});
				}
			});
  });
			
});

function setPageTitle() {
  document.title = "Logins";
};
