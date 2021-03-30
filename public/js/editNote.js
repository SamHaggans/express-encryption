$("document").ready(function() {
  let noteID = String(window.location).split("/").slice(-2)[0];
  $.post('/editnotepage', { id: noteID })  
    .always(function(response) {
      if (response.ok) {
        $(".main").html(response.html);
        $("#submit").click(function(){

          let title = $('input[name=title]').val();
          let content = $('#content').val();
          if (content.length < 1 || title.length < 1) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, your inputs need at least 1 character</div>`);
            return;
          }
          
          $.post('/editnote', { id: noteID, title: title, content: content })  
            .always(function(response) {
              if (response.ok) {
                  $(".alertSpace").html(`<div class = "okAlert">Note edited successfully</div>`);
                  $(".main").html("");
              }
              else {
                $(".alertSpace").html(`<div class = "badAlert">Something went wrong</div>`);
              }
            });
        });
      }
      else {
        $(".alertSpace").html(`<div class = "badAlert">Something went wrong</div>`);
      }
    });
});

function setPageTitle() {
  document.title = "Edit Note";
};

