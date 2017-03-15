# MUNSN 4770 - TEAM PROJECT

## Contents

<!-- TOC -->

- [MUNSN 4770 - TEAM PROJECT](#munsn-4770---team-project)
    - [Contents](#contents)
    - [1. Contributors](#1-contributors)
    - [2. Starting The Server](#2-starting-the-server)
    - [3. API](#3-api)
        - [3.1 GET](#31-get)
        - [3.2 POST](#32-post)
    - [4. JSON Objects](#4-json-objects)

<!-- /TOC -->

## 1. Contributors

Andrew Way - Project Manager   
Devin Marsh - Database Designer  
Kyle Hall - Usability Lead  
John Hollett - Web Tech Lead  
Karl Chiasson - Interface Design  


## 2. Starting The Server

1. Start the mongod process:  
  - Worth putting the following into a script  
  `"C:\Program Files\MongoDB\Server\3.4\bin\mongod" --storageEngine="mmapv1" --dbpath="C:\Coding\4770_server\app\data"`  
  Start the mongod process with that storage engine and point it towards where ever the database is (should be app/data).
  
2. Start the node server
  - Two ways to start the server (doesn't matter which one, and also worth putting into scripts):
    1. "npm start": Starts the server from the bin/.www file
    2. "node app.js": Starts the server from the app.js file

## 3. API

### 3.1 GET

_findUserById_ |
:---------|
 **URL:**  %server%/api/user/info/:uid |
**Description:** Gets the user object from the database if they exist |
 **Params:** <br>-uid: The user id|
**Returns:** JSON user object|

_findFriendsById_ |
:---------|
 **URL:**  %server%/api/user/friends/:uid |
 **Description:** Gets the friends for a given uid|
 **Params:** <br>-uid: The user id|
**Returns:** JSON array containing user objects|

_findFriendSent_ |
:---------|
 **URL:**  %server%/api/user/friends/sent/:uid |
 **Description:** Gets the friend requests sent from a user|
 **Params:** <br>- uid: The user id to get requests sent from|
**Returns:** JSON array containing friend request objects|

_findFriendReceived_ |
:---------|
 **URL:**  %server%/api/user/friends/received/:uid|
 **Description:** Gets the friend requests recieved from a user|
 **Params:** <br>- uid: The user id to get requests recieved from|
**Returns:** JSON array containing friend request objects|

_findGroupsByID_ |
:---------|
 **URL:**  %server%/api/user/groups/:uid|
 **Description:** Gets all groups that the user is in|
 **Params:** <br>- uid: The user id to get groups from|
**Returns:** JSON array containing group objects|

_findGroupsUsers_ |
:---------|
 **URL:**  %server%/api/group/users/:gid|
 **Description:** Gets all users in a group|
 **Params:** <br>- gid: The group id to get users from|
**Returns:** JSON array containing user objects|

_findGroupById_ |
:---------|
 **URL:**  %server%/api/group/info/:gid|
 **Description:** Gets group from a group id|
 **Params:** <br>- gid: The group id|
**Returns:** JSON group object|

___ 

### 3.2 POST

_updateUser_ |
:---------|
 **URL:**  %server%/api/user/update/:uid|
 **Description:** Updates an user's fields|
 **Params:** <br>- uid: The user id <br>- email: The email address <br>- pass: The password|
**Returns:** JSON updated user object|

_deleteUser_ |
:---------|
 **URL:**  %server%/api/user/remove/:uid|
 **Description:** Deletes a user from the server|
 **Params:** <br>- uid: The user id|
**Returns:** JSON user object before deletion|

_registerUser_ |
:---------|
 **URL:**  %server%/api/user/register|
 **Description:** Registers a user|
 **Params:** <br>- fName: First name <br>- lName: Last name<br>- gender: gender<br>- dob: Birthdate<br>- email: Email address from @mun.ca<br>- pass: Password<br>- address: Address|
**Returns:** JSON user object after creation|

_addFriendReq_ |
:---------|
 **URL:**  %server%/api/user/add/request|
 **Description:** Send a friend request from one user to another|
 **Params:** <br>- uid: The user id to send the request from<br>- fid: The friend id to send the request to|
**Returns:** JSON friend request object|

_delFriendReq_ |
:---------|
 **URL:**  %server%/api/user/remove/request|
 **Description:** Delete a friend request from one user to another|
 **Params:** <br>- uid: The user id to delete the request from<br>- fid: The friend id to delete the request to|
**Returns:** JSON friend request object after deletion|

_delFriend_ |
:---------|
 **URL:**  %server%/api/user/remove/friend|
 **Description:** Delete a friend|
 **Params:** <br>- uid: The user id to delete the friend from<br>- fid: The friend id to delete the friendship from|
**Returns:** WIP|

_createGroup_ |
:---------|
 **URL:**  %server%/api/group/create|
 **Description:** Create a group|
 **Params:** <br>- uid: The user id that is creating the group<br>- name: The group name|
**Returns:** JSON group object after creation|

_delGroup_ |
:---------|
 **URL:**  %server%/api/group/remove/:gid|
 **Description:** Delete a group|
 **Params:** <br>- gid: The group id to be deleted|
**Returns:** JSON group object after deletion|

_updateGroup_ |
:---------|
 **URL:**  %server%/api/group/update|
 **Description:** Update a group|
 **Params:** <br>- gid: The group id to be updated<br>- name: The group name<br> - descrip: The group description|
**Returns:** JSON group object after update|

_addGroupUser_ |
:---------|
 **URL:**  %server%/api/group/add/user|
 **Description:** Add a user to a group|
 **Params:** <br>- gid: The group id<br>- uid: The user id to be added|
**Returns:** JSON group users object after creation|

_delGroupUser_ |
:---------|
 **URL:**  %server%/api/group/remove/user|
 **Description:** Delete a user from a group|
 **Params:** <br>- gid: The group id<br>- uid: The user id to be deleted|
**Returns:** JSON group users object after deletion|

## 4. JSON Objects

_User_ |
:---------|
 **Description:** The user object that every user has|
 **Fields:** <br>- (_string_) _id: The unique id generated from the email<br>- (_bool_) auth: Is the user authenticated yet<br>- (_string_) fName: First name<br>- (_string_) lName: Last name<br>- (_string_) gender: Gender<br>- (_date_) dob: Birthdate<br>- (_string_) email: Email address from @mun.ca<br>- (_string_) pass: Password<br>- (_string_) address: Address|

 _Auth_ |
:---------|
 **Description:** The authkey generated for every newly registered user|
 **Fields:** <br>- (_string_) key: The unique key generated from the user id and current date<br>- (_string_) userid: The user that the key is generated for<br>- (_date_) expiry: The expiry date of the auth key|

 _Friend Request_ |
:---------|
 **Description:** The friend request object that contains the friendship between two users|
 **Fields:** <br>- (_string_) userid: The user id of the user who sent the friend request<br>- (_string_) friendid: The user that recieved the friend request|

  _Group_ |
:---------|
 **Description:** The group object|
 **Fields:** <br>- (_string_) name: The group name<br>- (_string_) creatorid: The user that created the group<br>- (_array[string]_) courses: The courses that the group focuses on<br>- (_date_) created: The date the group was created|

  _Group Members_ |
:---------|
 **Description:** The member list for a group|
 **Fields:** <br>- (_string_) _id: The group id<br>- (_array[string]_) members: The array that contains the member's ids<br|

   _Group Admins_ |
:---------|
 **Description:** The admin list for a group|
 **Fields:** <br>- (_string_) _id: The group id<br>- (_array[string]_) admins: The array that contains the admin's ids<br|