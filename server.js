const express = require("express");
const mysql = require('mysql');
const fs = require("fs");
const bodyParser = require('body-parser');
const pbkdf2 = require('pbkdf2');

const config = JSON.parse(fs.readFileSync("./config/config.json", "utf-8"));
const client_dir = "./public/";
const partials_dir = "./partials/";

const dirname = __dirname;
const routes = require("./routing/routes.js")(dirname);
const posts = require("./routing/posts.js")(dirname);

const app = express();
const port = process.env.PORT || 3678;

let session = require('express-session');
let MySQLStore = require('express-mysql-session')(session);

let sessionStoreOptions = {
    host: config.dbHost,
	user: config.dbUser,
	password: config.dbPw,
	database: config.dbName
};

let sessionStore = new MySQLStore(sessionStoreOptions);

app.use(session({
    secret: config.sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

global.con = mysql.createConnection({
	host: config.dbHost,
	user: config.dbUser,
	password: config.dbPw,
	database: config.dbName
});

con.connect(function (err) {
	if (err) throw err;
	console.log("Connected to database");
});

app.set('trust proxy', 1);

app.use("/", routes);
app.use("/", posts);

app.use(function(req, res) {
    res.status(400);
    res.sendFile(client_dir + "html/404.html", {root: dirname});
});

let server = app.listen(port, function () {
    let port = server.address().port;
    console.log("Server started on port: localhost:%s", port);
});