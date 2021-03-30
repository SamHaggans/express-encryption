# Encrypted Password Storage Website
## By Samuel Haggans


### Installation instructions
To run this application, you must first install the npm dependencies with `npm install --save-dev`. Then, you need to create an SQL Database with MySQL, make a copy of `config/config.json.sample` named `config/config.json`, and save the MySQL access information there. You then need to create the tables listed in `config/structure.sql`, and finally run `node genSalt.js` from inside the `config` directory to generate the random salt file. Then, running `npm start` will start the application on `localhost:3021`, which can either be placed behind a separate webserver for distribution or can be accessed locally in a browser.