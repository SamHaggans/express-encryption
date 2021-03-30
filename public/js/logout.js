$("document").ready(function() {
  $(".logout").html("<div class = 'okAlert'>Logging Out ...</div>");
  $.post('/logout')  
    .always(function(response) {
      if (response.ok) {
        $(".logout").html("<div class = 'okAlert'>Logged Out Successfully</div>");
        $.get('/header').always(function(response) {
          $(".header").html(response);
        });
      }
      else {
        $(".logout").html("<div class = 'badAlert'>Something Went Wrong. Were you signed in?</div>"); 
        $.get('/header').always(function(response) {
          $(".header").html(response);
        });
      }
    });
});

function setPageTitle() {
  document.title = "Logout";
};
