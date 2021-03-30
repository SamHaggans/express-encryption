$("document").ready(function() {
  let loginID = String(window.location).split("/").slice(-1)[0];
  $.post('/getlogin', {id: loginID})  
    .always(function(response) {
      if (response.ok) {
        $(".main").html(response.html);
        $("#edit").click(function() {
          window.location.href = window.location + "/edit";
        });
      } else {
        $(".alertSpace").html("<div class = 'badAlert'>You are not authorized to view this page</div>");
      }
    });
});

function setPageTitle() {
  document.title = "View Login";
};

