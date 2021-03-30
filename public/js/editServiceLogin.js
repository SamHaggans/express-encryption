$("document").ready(function() {
  let loginID = String(window.location).split("/").slice(-2)[0];
  $.post('/editloginpage', { id: loginID })  
    .always(function(response) {
      if (response.ok) {
        $(".main").html(response.html);
        $("#submit").click(function(){
          let title = $('input[name=title]').val();
		      let username = $('input[name=username]').val();
          let password = $('input[name=password]').val();

          if (title.length < 1 || username.length < 1|| password.length < 1) {
            $(".alertSpace").html(`<div class = "badAlert">Sorry, your inputs need at least 1 character</div>`);
            return;
          }

          $.post('/editlogin', { id: loginID, title: title, username: username, password: password })  
            .always(function(response) {
              if (response.ok) {
                  $(".alertSpace").html(`<div class = "okAlert">Login edited successfully</div>`);
                  $(".main").html("");
              } else {
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
  document.title = "Edit Login";
};

