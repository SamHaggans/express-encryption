const express = require("express");
const fs = require("fs");
const pbkdf2 = require('pbkdf2');

let router = express.Router();
const masterKey = "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*\'\"(){}[]:;<>,./?|-=_+`~";

module.exports = function (dirname) {
  router.post('/signup', async function(req, res) {
    let user = await getUser(req.body.email);
    if (user == null) {//No such user exists, thus one can be created with the specified email
      let randomKey = shuffleString(masterKey);
      let userKey = encryptKey(randomKey, req.body.pass);
      await createUser(req.body.email, req.body.name, req.body.pass, userKey);
      res.json({ ok: true });
    } else {
      res.json({ok: false, error: "userExistsError"});
    }
  });

  router.post('/signin', async function(req, res) {
    let user = await getUser(req.body.email);
    if (user == null) {
      res.json({ok: false, error: "userNotFoundError"});
    }
    else {
      let hashedPasswordInput = hashString(req.body.email, req.body.password);
      if (hashedPasswordInput == user.passwordHash) {//If input hash matches stored hash
        req.session.username = user.username;//Log in the user
        req.session.userid = user.id;
        req.session.key = decryptKey(user.encryptedKey, req.body.password);
        res.json({ok: true, username: user.username, id: user.id});
      } else {
        res.json({ok: false, error: "wrongPasswordError"});
      }
    }
  });

  router.post('/logout', async function(req, res) {
    if (req.session.username){
      req.session.username = null;
      req.session.userid = null;
      req.session.key = null;
      await sleep(2000);//Wait to make sure the changes take effect 
      res.json({ ok: true }); 
    } 
    else {
      res.json({ok: false});//User is already logged out and therefore can't log out again
    }
  });

  router.post('/getnotes', async function(req, res) {
    if (req.session.userid){
      let notes = await getNotes(req.session.userid); 
      let html = "";
      let key = req.session.key;
      
      notes.forEach((note) => {
        let decryptedTitle = decryptText(note.title, key);
        html += `
          <div class = "listItem" id = "${note.id}">${decryptedTitle}</div>
        `;
      });
      res.json({ ok: true, html: html }); 
    } 
    else {
      res.json({ok: false});
    }
  });

  router.post('/getnote', async function(req, res) {
    let note = await getNote(req.body.id);
    
    if (note && req.session.userid && req.session.userid == note.userid){
      let key = req.session.key;
      let decryptedTitle = decryptText(note.title, key);
      let decryptedContent = decryptText(note.content, key);
      html = `
        <h2>${decryptedTitle}<div class="greenButton" id = "edit">Edit</div></h2>
        <p class = "content">${decryptedContent}</p>
      `;
      res.json({ok: true, html: html});
    } 
    else {
      res.json({ok: false});
    }
  });

  router.post('/newnote', async function(req, res) {
    let content = req.body.content.replace(/\n/g,"<br>")
    let key = req.session.key;
    let encryptedTitle = encryptText(req.body.title, key);
    let encryptedContent = encryptText(content, key);
    await createNote(req.session.userid, encryptedTitle, encryptedContent);
    res.json({ok: true});
  });

  router.post('/editnote', async function(req, res) {
    let note = await getNote(req.body.id);

    if (note && req.session.userid && req.session.userid == note.userid){
      let content = req.body.content.replace(/\n/g,"<br>")
      let key = req.session.key;
      let encryptedTitle = encryptText(req.body.title, key);
      let encryptedContent = encryptText(content, key);
      await updateNote(note.id, encryptedTitle, encryptedContent);
      res.json({ok: true});
    } else {
      res.json({ok: false});
    }
  });

  router.post('/editnotepage', async function(req, res) {
    let note = await getNote(req.body.id);

    if (note && req.session.userid && req.session.userid == note.userid){
      let key = req.session.key;
      let decryptedTitle = decryptText(note.title, key);
      let decryptedContent = decryptText(note.content, key);
      decryptedContent = decryptedContent.replace(/<br>/g, "\n");
      html = `
        <div class="form">
          <h2>Edit an Encrypted Note</h2>
          <hr>
          <h4>Note Title</h4>
          <input type="text" placeholder="Enter Title" name="title" value="${decryptedTitle}">

          <h4>Content</h4>
          <textarea id = "content" type="text" placeholder="Enter Content" name="content">${decryptedContent}</textarea>

          <div class="greenButtonExtend" id = "submit">Edit Note</div>
          
        </div>
      `;
      res.json({ok: true, html: html});
    } 
    else {
      res.json({ok: false});
    }
  });

  router.post('/getlogins', async function(req, res) {
    if (req.session.userid){
      let logins = await getLogins(req.session.userid); 
      let html = "";
      let key = req.session.key;
      
      logins.forEach((login) => {
        let decryptedTitle = decryptText(login.title, key);
        html += `
          <div class = "listItem" id = "${login.id}">${decryptedTitle}</div>
        `;
      });
      res.json({ ok: true, html: html }); 
    } 
    else {
      res.json({ok: false});
    }
  });

  router.post('/searchlogins', async function(req, res) {
    if (req.session.userid){
      let logins = await getLogins(req.session.userid); 
      let html = "";
      let key = req.session.key;
      
      logins.forEach((login) => {
        let decryptedTitle = decryptText(login.title, key);
        if (fuzzyMatch(decryptedTitle, req.body.search)) {
        html += `
          <div class = "listItem" id = "${login.id}">${decryptedTitle}</div>
        `;
        }
      });
      res.json({ ok: true, html: html }); 
    } 
    else {
      res.json({ok: false});
    }
  });

  router.post('/getlogin', async function(req, res) {
    let login = await getLogin(req.body.id);
    
    if (login && req.session.userid && req.session.userid == login.userid){
      let key = req.session.key;
      let decryptedTitle = decryptText(login.title, key);
      let decryptedUsername = decryptText(login.username, key);
      let decryptedPassword = decryptText(login.password, key);
      html = `
        <h2>${decryptedTitle}<div class="greenButton" id = "edit">Edit</div></h2>
        <h2>Username: ${decryptedUsername}</h2>
        <h2>Password: ${decryptedPassword}</h2>
      `;
      res.json({ok: true, html: html});
    } 
    else {
      res.json({ok: false});
    }
  });

  router.post('/newlogin', async function(req, res) {
    let key = req.session.key;
    let encryptedTitle = encryptText(req.body.title, key);
    let encryptedUsername = encryptText(req.body.username, key);
    let encryptedPassword = encryptText(req.body.password, key);
    await createLogin(req.session.userid, encryptedTitle, encryptedUsername, encryptedPassword);
    res.json({ok: true});
  });

  router.post('/editlogin', async function(req, res) {
    let login = await getLogin(req.body.id);

    if (login && req.session.userid && req.session.userid == login.userid){
      let key = req.session.key;
      let encryptedTitle = encryptText(req.body.title, key);
      let encryptedUsername = encryptText(req.body.username, key);
      let encryptedPassword = encryptText(req.body.password, key);
      await updateLogin(login.id, encryptedTitle, encryptedUsername, encryptedPassword);
      res.json({ok: true});
    } else {
      res.json({ok: false});
    }
  });

  router.post('/editloginpage', async function(req, res) {
    let login = await getLogin(req.body.id);

    if (login && req.session.userid && req.session.userid == login.userid){
      let key = req.session.key;
      let decryptedTitle = decryptText(login.title, key);
      let decryptedUsername = decryptText(login.username, key);
      let decryptedPassword = decryptText(login.password, key);
      html = `
        <div class="form">
          <h2>Edit a Service Login</h2>
          <hr>
          <h4>Login Title</h4>
          <input type="text" placeholder="Enter Title" name="title" value="${decryptedTitle}">

          <h4>Username</h4>
          <input type="text" placeholder="Enter Username" name="username" value="${decryptedUsername}">

          <h4>Password</h4>
          <input type="text" placeholder="Enter Password" name="password" value="${decryptedPassword}">

          <div class="greenButtonExtend" id = "submit">Edit Login</div>
          
        </div>
      `;
      res.json({ok: true, html: html});
    } 
    else {
      res.json({ok: false});
    }
  });

  return router;
};

function createNote(userid, title, content) {
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO notes (userid, title, content) VALUES (?, ?, ?)";
    con.query(sql, [userid, title, content], function (err, result) {
      if (err) throw err;
      resolve();
    });
  });
}

function updateNote(id, title, content) {
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE notes SET title = ?, content = ? WHERE id = ?";
    con.query(sql, [title, content, id], function (err, result) {
      if (err) throw err;
      resolve();
    });
  });
}

function getNotes(userid) {
  return new Promise(function (resolve, reject) {
    let sql = "SELECT * FROM notes WHERE userid = ?";
    con.query(sql, [userid], function(err, result) {
      if (err) throw err;
      resolve(result);
    });
  })
}

function getNote(id) {
  return new Promise(function (resolve, reject) {
    let sql = "SELECT * FROM notes WHERE id = ?";
    con.query(sql, [id], function(err, result) {
      if (err) throw err;
      resolve(result[0]);
    });
  })
}

function createLogin(userid, title, username, password) {
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO logins (userid, title, username, password) VALUES (?, ?, ?, ?)";
    con.query(sql, [userid, title, username, password], function (err, result) {
      if (err) throw err;
      resolve();
    });
  });
}

function updateLogin(id, title, username, password) {
  return new Promise(function(resolve, reject) {
    let sql = "UPDATE logins SET title = ?, username = ?, password = ? WHERE id = ?";
    con.query(sql, [title, username, password, id], function (err, result) {
      if (err) throw err;
      resolve();
    });
  });
}

function getLogins(userid) {
  return new Promise(function (resolve, reject) {
    let sql = "SELECT * FROM logins WHERE userid = ?";
    con.query(sql, [userid], function(err, result) {
      if (err) throw err;
      resolve(result);
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

function fuzzyMatch(text, match) {
  let differences = 0;
  for (let i = 0; i < Math.min(text.length, match.length); i++) {//Loop through while there are characters in both input strings
    if (text[i] != match[i]) {//If characters at a specific index do not match
      differences++;//Record a difference
    }
  }

  let differencesNoSpaces = 0;
  let stripText = text.replace(/ /g, "");//Remove spaces from both strings
  let stripMatch = match.replace(/ /g, "");

  for (let i = 0; i < Math.min(stripText.length, stripMatch.length); i++) {//Loop through while there are characters in both stripped input strings
    if (stripText[i] != stripMatch[i]) {//Record differences
      differencesNoSpaces++;
    }
  }

  //Returns true (matched) if the number of differences or differences with no spaces is less than 30% of the string length,
  //meaning that generally ~ 70% of the string matched
  return Math.min(differences, differencesNoSpaces) < Math.min(text.length, match.length) * 0.3;
}

function getUser(email) {
  return new Promise(function(resolve, reject) {
    let sql = "SELECT * FROM users WHERE email = ?";
    con.query(sql, [email], function(err, result) {
      if (err) reject(err);
      else {
        if (result.length == 0) {
          resolve(null);//No such user exists
        }
        else {
          resolve(result[0]);
        }
      }
    })
  });
}

function hashString(saltSeed, string) {
  /* The following three lines pick a line from the potential salt values from the salt.txt file, selecting based on the 
  first two characters of the saltSeed
  This salt value enhances the hashing algorithm to prevent against large-scale analysis attacks to find the hashed user passwords */
  let saltIndex = masterKey.indexOf(saltSeed[0]) * masterKey.indexOf(saltSeed[1]);
  let saltLines = fs.readFileSync("./config/salt.txt", "utf-8").split(/\n/g);
  let salt = saltLines[saltIndex]; 
  let hash = pbkdf2.pbkdf2Sync(string, salt, 1000000, 64, 'sha512').toString('hex');//Perform the hashing of the string
  return hash;
}

function createUser(email, username, password, key) {
  let hashedPassword = hashString(email, password);
  return new Promise(function(resolve, reject) {
    let sql = "INSERT INTO users (email, username, passwordHash, encryptedKey) VALUES (?, ?, ?, ?)";
    con.query(sql, [email, username, hashedPassword, key], function (err, result) {
      if (err) throw err;
      resolve();
    });
  });
}

function shuffleString(string) {
  let characters = string.split("");

  for(let i = characters.length; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = characters[i];
    characters[i] = characters[j];
    characters[j] = temp;
  }
  return characters.join("");
}

function sleep(ms) { //Sleep function for pauses between frames
  return new Promise(resolve => setTimeout(resolve, ms));
}

function encryptText(string, key) {
  let encryptedText = "";
  let charCount = 0;
  for (let i = 0; i < string.length; i++) {//Loop through entire string
    //Get the index of the current character in the ordered masterKey
    let masterKeyIndex = masterKey.indexOf(string[i]);
    if (masterKeyIndex < 0) {//If the character is not found (rare unicode character)
      encryptedText += string[i];//Add the character un-encrypted
    } else {
      //Add the character at the specified index in the scrambled key
      encryptedText += key[masterKeyIndex];
    }
    charCount++;
    if (charCount == 10) {//Switch the key every 10 characters to add randomness
      key = shiftKey(key);
      charCount = 0;
    }
  }
  return encryptedText;
}

function decryptText(string, key) {
  let decryptedText = "";
  let charCount = 0;
  for (let i = 0; i < string.length; i++) {//Loop through entire string
    //Get the index of the current character in the shuffled key
    let keyIndex = key.indexOf(string[i]);
    if (keyIndex < 0) {//If the character is not found (rare unicode character)
      decryptedText += string[i];//Add the character un-decrypted (as it was never encrypted)
    } else {
      //Add the character at the specified index in the ordered master key
      decryptedText += masterKey[keyIndex];
    }
    charCount++;
    if (charCount == 10) {//Switch the key every 10 characters to add randomness
      key = shiftKey(key);
      charCount = 0;
    }
  }
  return decryptedText;
}

function encryptKey(key, pass) {
  let finalKey = "";
  let password = pass;
  //Added the password onto itself repeatedly until it is long enough to cover the entire key
  while (password.length < 100) {
    password += password;
  }

  for (let i = 0; i < key.length; i++) {//Loop through the entire key
    let keyIndex = masterKey.indexOf(key[i]);
    let passIndex = masterKey.indexOf(password[i]);
    //Add the index of the key value and the password value together to get a new character index
    let newKeyIndex = keyIndex + passIndex;
    if (newKeyIndex > 93) {
      newKeyIndex -= 94;//Ensure no out of bounds values
    }
    //Note that duplicates do not matter here, as the key is encrypted and is never used in this format
    finalKey += masterKey[newKeyIndex];
  }
  return finalKey;
}

function decryptKey(key, pass) {
  let finalKey = "";
  let password = pass;
  while (password.length < 100) {
    password += password;
  }
  for (let i = 0; i < key.length; i++) {
    let keyIndex = masterKey.indexOf(key[i]);
    let passIndex = masterKey.indexOf(password[i]);
    //Subtract the index of the key value and the password value together to get the original key character index
    let newKeyIndex = keyIndex - passIndex;
    if (newKeyIndex < 0) {
      newKeyIndex += 94;
    }
    finalKey += masterKey[newKeyIndex];
  }
  return finalKey;
}

function shiftKey(key) {
  let finalKey = "";
  //Determine which of the 94^2 salt lines to use based on the first two characters of the original key
  let saltIndex = masterKey.indexOf(key[0]) * masterKey.indexOf(key[1]);
  let saltLines = fs.readFileSync("./config/salt.txt", "utf-8").split(/\n/g);
  //Read from the salt file and find the line to be used, which is distinct for each key with differing first 2 characters
  let salt = saltLines[saltIndex]; 
  for (let i = 0; i < key.length; i++) {//Loop through the entire key
    let keyIndex = masterKey.indexOf(key[i]);
    let saltIndex = masterKey.indexOf(salt[i]);
    //Add the index of the key value and the salt value together to get a new character index
    let newKeyIndex = keyIndex + saltIndex;
    if (newKeyIndex > 93) {//If the number goes above 93, loop back down to 0 to ensure valid character coverage
      newKeyIndex -= 94;
    }
    //Add the new key character, ensuring it is not a duplicate
    finalKey += makeNonDuplicate(masterKey[newKeyIndex], finalKey);
  }
  return finalKey;
}

function makeNonDuplicate(val, string) {
  let index = masterKey.indexOf(val);//Find the starting index of the character
  while (string.indexOf(masterKey[index]) >= 0) {//While the string includes that character already
    if (index < 93) {//Add one to the character index if below 94, otherwise loop back to 0
      index++;
    } else {
      index = 0;
    }
  }
  //Return a new character which is as close to the starting character as possible while being unique
  return masterKey[index];
}


