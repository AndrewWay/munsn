# MUNSN 4770 - TEAM PROJECT

## Contents

1. Contributors
2. Starting The Server
3. Notes


## 1. Contributors

Andrew Way
Devin Marsh
Kyle Hall
John Hollett
Karl Chiasson


## 2. Starting The Server

1. Start the mongod process:
  - Worth putting the following into a script -> "C:\Program Files\MongoDB\Server\3.4\bin\mongod" --storageEngine="mmapv1" --dbpath="C:\Coding\4770_server\app\data". Start the mongod process with that storage engine and point it towards where ever the database is (should be app/data).
  
2. Start the node server
  - Two ways to start the server (doesn't matter which one, and also worth putting into scripts):
    1. "npm start": Starts the server from the bin/.www file
    2. "node app.js": Starts the server from the app.js file

## 3. Notes
