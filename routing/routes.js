const express = require('express')
let router = express.Router()
const partials_dir = "./partials/";
const client_dir = "./public/";

module.exports = function(dirname) {
    router.get("/", function(req, res) {
		  res.sendFile(client_dir + "html/index.html", {root: dirname});
    });

    router.get("/signin", function(req, res) {
		  res.sendFile(client_dir + "html/signin.html", {root: dirname});
    });

    router.get("/logout", function(req, res) {
		  res.sendFile(client_dir + "html/logout.html", {root: dirname});
    });

    router.get("/signup", function(req, res) {
		  res.sendFile(client_dir + "html/signup.html", {root: dirname});
    });

    router.get("/notes", function(req, res) {
		  res.sendFile(client_dir + "html/notes.html", {root: dirname});
    });

    router.get("/notes/new", function(req, res) {
		  res.sendFile(client_dir + "html/newNote.html", {root: dirname});
    });

    router.get("/logins", function(req, res) {
		  res.sendFile(client_dir + "html/serviceLogins.html", {root: dirname});
    });

    router.get("/logins/new", function(req, res) {
		  res.sendFile(client_dir + "html/newServiceLogin.html", {root: dirname});
    });

    router.get("/style.css", function(req, res) {
      res.sendFile(client_dir + "css/style.css", {root: dirname});
    });
      
    router.get("/main.js", function(req, res) {
      res.sendFile(client_dir + "js/main.js", {root: dirname});
    });
  
    router.get("/index.js", function(req, res) {
      res.sendFile(client_dir + "js/index.js", {root: dirname});
    });

    router.get("/signin.js", function(req, res) {
      res.sendFile(client_dir + "js/signin.js", {root: dirname});
    });

    router.get("/logout.js", function(req, res) {
      res.sendFile(client_dir + "js/logout.js", {root: dirname});
    });

    router.get("/signup.js", function(req, res) {
      res.sendFile(client_dir + "js/signup.js", {root: dirname});
    });

    router.get("/notes.js", function(req, res) {
      res.sendFile(client_dir + "js/notes.js", {root: dirname});
    });

    router.get("/newNote.js", function(req, res) {
      res.sendFile(client_dir + "js/newNote.js", {root: dirname});
    });

    router.get("/editNote.js", function(req, res) {
      res.sendFile(client_dir + "js/editNote.js", {root: dirname});
    });

    router.get("/note.js", function(req, res) {
      res.sendFile(client_dir + "js/note.js", {root: dirname});
    });

    router.get("/serviceLogins.js", function(req, res) {
      res.sendFile(client_dir + "js/serviceLogins.js", {root: dirname});
    });

    router.get("/newServiceLogin.js", function(req, res) {
      res.sendFile(client_dir + "js/newServiceLogin.js", {root: dirname});
    });

    router.get("/editServiceLogin.js", function(req, res) {
      res.sendFile(client_dir + "js/editServiceLogin.js", {root: dirname});
    });

    router.get("/serviceLogin.js", function(req, res) {
      res.sendFile(client_dir + "js/serviceLogin.js", {root: dirname});
    });

    router.get("/404.js", function(req, res) {
      res.sendFile(client_dir + "js/404.js", {root: dirname});
    });

    router.get("/header.js", function(req, res) {
      res.sendFile(partials_dir + "header.js", {root: dirname});
    });

    router.get("/header", function(req, res) {
      if (req.session.username) {
        res.sendFile(partials_dir + "logged-in-header.html", {root: dirname});
      } else {
        res.sendFile(partials_dir + "header.html", {root: dirname});
      }
    });

    router.get("/note/:id", async function(req, res) {
      let id = req.params.id;
      let note = await getNote(id);
      if (note && req.session.userid && req.session.userid == note.userid) {
        res.sendFile(client_dir + "html/note.html", {root: dirname});
      } else {
        res.sendFile(client_dir + "html/unauthorized.html", {root: dirname});
      }
    });

    router.get("/note/:id/edit", async function(req, res) {
      let id = req.params.id;
      let note = await getNote(id);
      if (note && req.session.userid && req.session.userid == note.userid) {
        res.sendFile(client_dir + "html/editNote.html", {root: dirname});
      } else {
        res.sendFile(client_dir + "html/unauthorized.html", {root: dirname});
      }
    });

    router.get("/login/:id", async function(req, res) {
      let id = req.params.id;
      let login = await getLogin(id);
      if (login && req.session.userid && req.session.userid == login.userid) {
        res.sendFile(client_dir + "html/serviceLogin.html", {root: dirname});
      } else {
        res.sendFile(client_dir + "html/unauthorized.html", {root: dirname});
      }
    });

    router.get("/login/:id/edit", async function(req, res) {
      let id = req.params.id;
      let login = await getLogin(id);
      if (login && req.session.userid && req.session.userid == login.userid) {
        res.sendFile(client_dir + "html/editServiceLogin.html", {root: dirname});
      } else {
        res.sendFile(client_dir + "html/unauthorized.html", {root: dirname});
      }
    });

    return router;
};

function getNote(id) {
  return new Promise(function (resolve, reject) {
    let sql = "SELECT * FROM notes WHERE id = ?";
    con.query(sql, [id], function(err, result) {
      if (err) throw err;
      resolve(result[0]);
    });
  })
}

function getLogin(id) {
  return new Promise(function (resolve, reject) {
    let sql = "SELECT * FROM logins WHERE id = ?";
    con.query(sql, [id], function(err, result) {
      if (err) throw err;
      resolve(result[0]);
    });
  })
}
