# MUNSN 4770 - TEAM PROJECT

## Contents

<!-- TOC -->

- [MUNSN 4770 - TEAM PROJECT](#munsn-4770---team-project)
    - [Contents](#contents)
    - [1. Contributors](#1-contributors)
    - [2. Starting The Server](#2-starting-the-server)
        - [2.1 Locally](#21-locally)
        - [2.2 Production (Live)](#22-production-live)
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

### 2.1 Locally

1. **The Quick-Easy Method (Windows Only):**  
  To start the server, navigate to the directory, and start `start.bat`. This will start the mongo process, and the a few seconds later start the Node server. If this doesn't work then resort to The Slower-Harder Method.

2. **The Slower-Harder Method:**   
  First we must start the MongoDB process. In a command shell (opened in the project directory) type:  

   `mongod --port 27017 --nojournal --smallfiles  --dbpath="./data" -storageEngine="mmapv1"`  

   This shall initialize and connect to the MongoDB database. Next we must start the Node server istelf using the following command (in a new command shell):  

   `npm test`   

   This will start Node on the correct port. To connect to the server, open a browser and navigate to <http://localhost:3000>

### 2.2 Production (Live)

  First we must start the MongoDB process. In a command shell (opened in the project directory) type:  

  `mongod --nojournal --smallfiles  --dbpath="./data" -storageEngine="mmapv1" --port 27272`  

  This shall initialize and connect to the MongoDB database. Next we must start the Node server istelf using the following command (in a new command shell):  

  `npm start`   

  This will start Node on the correct port. To connect to the server, open a browser and navigate to <http://sc-6.cs.mun.ca/>

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
 **Description:** Get a singular post by PostID|
 **Params:** <br>- pid: The post id|
**Returns:** JSON mongo result|

_findPostByPid_ |
:---------|
 **URL:**  %server%/api/post/:pid|
 **Description:** Gets group from a group id|
 **Params:** <br>- gid: The group id|
**Returns:** JSON group object|

_findPostByUid_ |
:---------|
 **URL:**  %server%/api/post/user/:uid|
 **Description:** Get ALL posts by UserID|
 **Params:** <br>- uid: The user id|
**Returns:** JSON mongo result|

_findCourseById_ |
:---------|
 **URL:**  %server%/api/course/find/:uid|
 **Description:** Get a course by id|
 **Params:** <br>- uid: The course id|
**Returns:** JSON course object|

_findCourse_ |
:---------|
 **URL:**  %server%/api/course/find|
 **Description:** Get a course based on query|
 **Params:** <br>- (_string_) _id: The course unique object id <br>- (_string_) label: Shorthand name, ex. "COMP 4770" <br>- (_string_) name: Full name, ex. "Team Project"<br>- (_string_) description: Description <br>- (_string_) semester: Semester, ex. "winter" <br>- (_string_) department: Department that the course belongs to, ex. "cs" <br>- (_string_) location: Room number, ex. "EN 1051" <br>- (_string_) year: Current year the course is offered <br>- (_array[string]_) days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]<br>- (_string_) cid: Creator id<br>- (_date_) timeStart: The course start date, ex. "Jan. 1" <br>- (_date_) The course end date, ex. "Apr. 12"|
**Returns:** JSON course object array|

_findLostById_ |
:---------|
 **URL:**  %server%/api/lost/find/:uid|
 **Description:** Get a lost by id|
 **Params:** <br>- uid: The lost id|
**Returns:** JSON lost object|

_findLost_ |
:---------|
 **URL:**  %server%/api/lost/find|
 **Description:** Get a lost based on query|
 **Params:** <br>- (_string_) _id: The lost unique object id <br>- (_string_) imagePath: The path to an image if supplied <br>- (_string_) description: Description <br>- (_string_) long: Longitude <br>- (_string_) lat: Latitude|
**Returns:** JSON lost object array|

_findGroupAdmins_ |
:---------|
 **URL:**  %server%/api/group/admins/:gid|
 **Description:** Gets all admins in a group|
 **Params:** <br>- gid: The group id to get admins from|
**Returns:** JSON array containing user objects|

_findCommentsById_ |
:---------|
 **URL:**  %server%/api/comment/find/:uid|
 **Description:** Gets comments by user id|
 **Params:** <br>- uid: the user id|
**Returns:** JSON array containing comment objects|
___ 

### 3.2 POST

_updateUser_ |
:---------|
 **URL:**  %server%/api/user/update/:uid|
 **Description:** Updates an user's fields|
 **Params:** <br>- uid: The user id <br>- email: The email address <br>- pass: The password <br>- address: The address <br>- visibility: The visibility of the user's timeline|
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

_loginUser_ |
:---------|
 **URL:**  %server%/api/user/login|
 **Description:** Logs into the site|
 **Params:** <br>- uid: User's id <br>- pass: User's password|
**Returns:** JSON user|

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

_delPost_ |
:---------|
 **URL:**  %server%/api/post/remove/user|
 **Description:** Delete a post|
 **Params:** <br>- pid: The post id<br>- uid: The user id to be deleted|
**Returns:** JSON mongo result|

_updatePost_ |
:---------|
 **URL:**  %server%/api/post/update/user|
 **Description:** Update a post|
 **Params:** <br>- data: Actual data<br>- uid: The user id to be deleted|
**Returns:** JSON mongo result|

_addCourse_ |
:---------|
 **URL:**  %server%/api/course/add|
 **Description:** Add a course|
 **Params:** <br>- (_string_) label: Shorthand name, ex. "COMP 4770" <br>- (_string_) name: Full name, ex. "Team Project"<br>- (_string_) description: Description <br>- (_string_) semester: Semester, ex. "winter" <br>- (_string_) department: Department that the course belongs to, ex. "cs" <br>- (_string_) location: Room number, ex. "EN 1051" <br>- (_string_) year: Current year the course is offered <br>- (_array[string]_) days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]<br>- (_string_) cid: Creator id<br>- (_date_) timeStart: The course start date, ex. "Jan. 1" <br>- (_date_) The course end date, ex. "Apr. 12"|
**Returns:** JSON mongo result|

_updateCourse_ |
:---------|
 **URL:**  %server%/api/course/update|
 **Description:** Update a course|
 **Params:** <br>- (_string_) _id: The course unique object id<br>- (_string_) label: Shorthand name, ex. "COMP 4770" <br>- (_string_) name: Full name, ex. "Team Project"<br>- (_string_) description: Description <br>- (_string_) semester: Semester, ex. "winter" <br>- (_string_) department: Department that the course belongs to, ex. "cs" <br>- (_string_) location: Room number, ex. "EN 1051" <br>- (_string_) year: Current year the course is offered <br>- (_array[string]_) days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]<br>- (_string_) cid: Creator id<br>- (_date_) timeStart: The course start date, ex. "Jan. 1" <br>- (_date_) The course end date, ex. "Apr. 12"|
**Returns:** JSON mongo result|

_removeCourse_ |
:---------|
 **URL:**  %server%/api/course/remove|
 **Description:** Remove a course|
 **Params:** <br>- (_string_) _id: The course unique object id|
**Returns:** JSON mongo result|

_addLost_ |
:---------|
 **URL:**  %server%/api/lost/add|
 **Description:** Add a lost|
 **Params:** <br>- (_string_) _id: The lost unique object id <br>- (_string_) imagePath: The path to an image if supplied <br>- (_string_) description: Description <br>- (_string_) long: Longitude <br>- (_string_) lat: Latitude|
**Returns:** JSON mongo result|

_updateLost_ |
:---------|
 **URL:**  %server%/api/lost/update|
 **Description:** Update a lost|
 **Params:** <br>- (_string_) _id: The lost unique object id <br>- (_string_) imagePath: The path to an image if supplied <br>- (_string_) description: Description <br>- (_string_) long: Longitude <br>- (_string_) lat: Latitude|
**Returns:** JSON mongo result|

_removeLost_ |
:---------|
 **URL:**  %server%/api/lost/remove|
 **Description:** Remove a lost|
 **Params:** <br>- (_string_) _id: The lost unique object id|
**Returns:** JSON mongo result|

_addGroupAdmin_ |
:---------|
 **URL:**  %server%/api/group/add/admin|
 **Description:** Add an admin to a group|
 **Params:** <br>- gid: The group id<br>- uid: The admin id to be added|
**Returns:** JSON group users object after creation|

_delGroupAdmin_ |
:---------|
 **URL:**  %server%/api/group/remove/admin|
 **Description:** Delete anadmin from a group|
 **Params:** <br>- gid: The group id<br>- uid: The user id to be deleted|
**Returns:** JSON group users object after deletion|

_addComment_ |
:---------|
 **URL:**  %server%/api/comment/add|
 **Description:** Add a comment|
 **Params:** <br>- (_string_) pid: The post id to which the comment belongs to<br>- (_string_) authorid: The author's id<br>- (_string_) data: The comment data|
**Returns:** JSON mongo result|

_updateComment_ |
:---------|
 **URL:**  %server%/api/comment/update|
 **Description:** Update a comment|
 **Params:** <br>- (_string_) data: The comment data/text<br>- (_string_) commentid: The comment id|
**Returns:** JSON mongo result|

_removeComment_ |
:---------|
 **URL:**  %server%/api/comment/remove|
 **Description:** Remove a comment|
 **Params:** <br>- (_string_) pid: The post id to which the comment belongs to<br>- (_string_) commentid: The comment id|
**Returns:** JSON mongo result|

## 4. JSON Objects

_User_ |
:---------|
 **Description:** The user object that every user has|
 **Fields:** <br>- (_string_) _id: The unique id generated from the email<br>- (_bool_) auth: Is the user authenticated yet<br>- (_string_) fName: First name<br>- (_string_) lName: Last name<br>- (_string_) gender: Gender<br>- (_date_) dob: Birthdate<br>- (_string_) email: Email address from @mun.ca<br>- (_string_) pass: Password<br>- (_string_) address: Address <br>- (_string_) visibility: Visibility of the user's timeline:<br> <ul><li> public: Everyone can post <li> private: Only the user can post <li> friends: Only friends can post|

_Post_ |
:---------|
 **Description:** The post object|
 **Fields:** <br>- (_string_) authorid: The author's id<br>- (_string_) origin: The origin of the post<br> <ul><li> User: <li> Group</ul>- (_date_) created: The creation date of the post<br>- (_date_) modified: The last modified date of the post<br>- (_string_) dataType: <ul><li>text: Plain text<li>image: Image</ul>- (_string_) data: The actual data<br>- (_string_) visibility: Who can view the post: <ul><li> public: Everyone can view the post<li>private: Only the user can view the post<li>friends: Only friends can view the post<li>list: Only a list of friends can view the post</ul>- (_array[string]_) list: The list of friends who can view the post|

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

 _Course_ |
:---------|
 **Description:** The course object|
 **Params:** <br>- (_string_) _id: The course unique object id<br>- (_string_) label: Shorthand name, ex. "COMP 4770" <br>- (_string_) name: Full name, ex. "Team Project"<br>- (_string_) description: Description <br>- (_string_) semester: Semester, ex. "winter" <br>- (_string_) department: Department that the course belongs to, ex. "cs" <br>- (_string_) location: Room number, ex. "EN 1051" <br>- (_string_) year: Current year the course is offered <br>- (_array[string]_) days: Array of strings of days the course is every week, ex. days["monday", "wednesday", "friday"]<br>- (_string_) cid: Creator id<br>- (_date_) timeStart: The course start date, ex. "Jan. 1" <br>- (_date_) The course end date, ex. "Apr. 12"|

 _Lost_ |
:---------|
 **Description:** The lost and found object|
 **Params:** <br>- (_string_) _id: The lost unique object id <br>- (_string_) imagePath: The path to an image if supplied <br>- (_string_) description: Description <br>- (_string_) long: Longitude <br>- (_string_) lat: Latitude|

  _Comment_ |
:---------|
 **Description:** The comment object|
 **Params:** <br>- (_string_) pid: The post id the comment belongs to <br>- (_array[objects]_) comments: An array of objects with the following fields<ul><li>data: The data/text of the comment<li>date: The date object created when the data is written|
