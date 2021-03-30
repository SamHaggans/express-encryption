CREATE TABLE users (id int auto_increment primary key, username varchar(200), email varchar(200), passwordHash varchar(200), encryptedKey varchar(200));

CREATE TABLE logins (id int auto_increment primary key, userid varchar(200), title varchar(200), username varchar(200), password varchar(200));

CREATE TABLE notes (id int auto_increment primary key, userid varchar(200), title varchar(200), content varchar(200000));
