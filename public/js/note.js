$("document").ready(function() {
  let noteID = String(window.location).split("/").slice(-1)[0];
  $.post('/getnote', {id: noteID})  
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
  document.title = "View Note";
};

