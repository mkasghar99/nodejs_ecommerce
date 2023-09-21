initialize project using
<br>
npm init -y
<br>
install dependencies
<br>
npm install express sqlite3 ejs
<br>
then create database.db file <br>
then create and insert products in database as as mentioned in database.js file and execute this file with node database.js <br>
the create app.js <br>
then create ejs template <br>

CRUD<br>
create routes for edit, delete and insert in app.js
<br>
then create edit, delete and insert templates ejs
<br>
<br>
<br>
3 user auth
<br>
create user table using db_users.js code<br>
create registeration.ejs and login.ejs form which sends data to relevant route <br>
create two get routes to display above forms<br>
create register route, which insert data into users table <br>
create login route, which will compare credentials with database and upon success set cookies <br>
create isAuthenticated middleware to check if user logged in cookie set, and place this middleware to private/admin routes<br>
Note: for above i need to install cookie-parser package and require in app.js and use it <br>
place all admin views in admin folder and change routes addresses accordingly <br>
create one public route and template to view products to public <br>
create logout button on admin home page template, which forwards to logout route and this route clear cookie<br>
<br>
<br>
<br>
inserted pagination code in public products route, which takes get parameter in req, fetch products from db then slice them as per req page no., and it send products and other related info for pagination (total pages, current page) to the products templates, which display it accordingly
<br>