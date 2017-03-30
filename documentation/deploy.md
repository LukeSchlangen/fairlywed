MongoDB and PostGRES DB Hosting Walkthroughs


Is this Add-On Free?
Create a Heroku App using the Toolbelt CLI
Migrate a Local Mongo Database to mLab (formerly MongoLab)
Step One: Setup mLab Add-On with Heroku
Step Two: Export your local database to mLab
Step Three: Create a database user on mLab
Step Four: Upload your dumped database files to mLab
Errors? Restoring Multiple Collections
Step Five: Point your app at the mLab remote database
Step Five Alt: Using Heroku config variables to connect to mLab with localhost fallback
Add a Remote mLab Database to Robomongo
Migrate a local PostGRES Database to Heroku Add-On
Using Heroku Toolbelt Postgres tools
Add a Remote Host to Postico
Point your app at the remote Heroku Postgres database
Add a Remote Host to pgAdmin


Is this Add-On Free?
Using Add-Ons through Heroku requires you have a credit card on file with Heroku. Most Add-Ons have a free tier, and these database server providers are no different. You should not see a charge using the service tiers outlined below. If you go over the provided size or other quota for the free tier, you will be charged.

Create a Heroku App using the Toolbelt CLI
If you are unfamiliar with Heroku Toolbelt, please refer to their online documentation regarding how to install and use it. This walkthrough assumes you have it installed already.

You will need to have a Heroku app tied to your application. 
From the Terminal prompt at your project root, run: heroku create
You will see output with the name of the Heroku application and a URL you can use to access it. Eg: infinite-everglades-13320 and infinite-everglades-13320.herokuapp.com

Migrate a Local Mongo Database to mLab (formerly MongoLab)
Next we need to set up the mLab Add-On with our new Heroku app, dump the data from our local database, and restore it to our remote mLab database. We assume you already have created a Heroku app through the Toolbelt CLI.
Step One: Setup mLab Add-On with Heroku
Run heroku addons:create mongolab in Terminal at your project root.
It will tell you you need to add your credit card to your heroku account and give you a url to do that. Do that.

Step Two: Export your local database to mLab
“Dump” your database to files on your computer. This will create a new folder within your project folder: mongodump -d <DB> -o dump/
Replace <DB> with your particular database name (with no brackets). -d is for database and -o is for output
 The disk-icons in Robomongo are the Databases and their names. Note that dumping will dump all the documents for every collection in your database.
‘dump/’ is just a location on your computer. This will put the backup files in the /dump directory and create that directory if it doesn’t exist already.

Step Three: Create a database user on mLab
Your mLab database needs a user associated with it so you can access it remotely. The user you use to login into mLabs does not count. This is a separate user just to access this specific database.

You will need your remote database credentials. To find them:
In the Heroku website, click into your app. 
Select the Resources tab. 
Click the mLab listing to sign into mLab’s site
To create this Database User click on the Users tab
Then click on the Add Database User button. Give it a username and password. Make note of these as you will need them later.


Step Four: Upload your dumped database files to mLab
At this Database management page you will see two addresses (these are mine, yours will be different!)

To connect using the shell:
mongo ds133348.mlab.com:33348/heroku_xj3w3vkg -u <dbuser> -p <dbpassword>

To connect using a driver via the standard URI:
mongodb://<dbuser>:<dbpassword>@ds133348.mlab.com:33348/heroku_xj3w3vkg

Using Mongorestore
https://docs.mongodb.com/manual/reference/program/mongorestore/

We will use the first address to upload your database files to mLab using Terminal. Copy just the <dsxxxxxx>.mlab.com:33348 part and paste it into the mongorestore command below. 

Also fill the <dbuser> and <dbpassword> with the database user you just created (without brackets, of course):

mongorestore -h <dsxxxxxx>.mlab.com:33348 -d <dbNameOnMLab> -u <dbuser> -p <dbpassword>


Errors? Restoring Multiple Collections
Mongorestore know what to do with a subfolder inside your dump folder. If you dumped multiple collections, it may have created a subfolder and put your database files into it. Move those files into the dump/ folder directly and run mongorestore again. It should restore each collection separately and give some status output in your Terminal.
	
Step Five: Point your app at the mLab remote database
The second address on the management page is what you will put in your app.js instead of mongodb://localhost:27017/<dbname> (where <dbname> is your local db’s name.) Replace <dbuser> and <dbpassword> with the database user you just created in Step Three.

mongodb://<dbuser>:<dbpassword>@ds015334.mlab.com:15334/heroku_cpv005sw

NOTE: It is more secure to use the Heroku config/environment variable created by mLab while running the app on Heroku instead of placing your user/pass in the source code.

Step Five Alt: Using Heroku config variables to connect to mLab with localhost fallback
mLab automatically created a Config Variable in your Heroku app. On your Heroku dashboard, go to the Settings tab and click on the “Reveal Config Vars” button. You will see something like this:

While running on Heroku, your Node.js app has access to global variables named process.env.<ConfigVarName>. In this case, process.env.MONGODB_URI. You will use this global Javascript variable to connect to mLab while running the app on Heroku. But we also want a localhost fallback if we are running locally.

Set up some logic in your node app to determine which environment the app is running on. Based on that, set the mongoose connection appropriately.

Something like this:

var databaseURI = '';
// process.env.MONGODB_URI will only be defined if you 
// are running on Heroku
if(process.env.MONGODB_URI != undefined) {
    // use the string value of the environment variable
    databaseURI = process.env.MONGODB_URI;
} else {
    // use the local database server
    databaseURI = 'mongodb://localhost:27017/<dbname>';
}

mongoose.connect(databaseURI);

Heroku Config Vars are an awesome way to handle sensitive variables such as usernames, passwords, API keys, etc. in a secure manner. Most Add-Ons will store connection or user data using this method.

But you can create Config Vars yourself for anything you want. You create them right on the Heroku app dashboard and edit them anytime you like. Consider using them!

Add a Remote mLab Database to Robomongo
Once you have created a remote Postgres database, you can now connect your GUI client of choice to it, so you can manage your remote database visually. You need to create a new connection on Robomongo and fill in the fields in the Connection and Authentication tabs.







Migrate a local PostGRES Database to Heroku Add-On
We assume you already have created a Heroku app through the Toolbelt CLI.

Using Heroku Toolbelt Postgres tools
The Heroku Toolbelt (when used with the Postgres Add-On) has a robust wrapper for common postgres administration tasks, including dumping/restoring data from your local machine to the remote server (and vice versa). Their documentation covers all you need to know: https://devcenter.heroku.com/articles/heroku-postgresql

TL;DR  -- Just do this stuff.
Provision the Add-On:
$ heroku addons:create heroku-postgresql:hobby-dev

Use pg:push to move your local database to your new remote one:
$ heroku pg:push myLocalDBName DATABASE_URL --app myHerokuAppName

DATABASE_URL is a heroku config variable created by the Add On. Do not replace it with something else, just type: DATABASE_URL

Add a Remote Host to Postico
Once you have created a remote Postgres database, you can now connect your GUI client of choice to it, so you can manage your remote database visually.
You will need your remote database credentials. To find them:
In the Heroku website, click into your app. 
Select the Resources tab. 
Click on the Heroku Postgres :: Database resource.
You will be brought to the Heroku Postgres admin screen:

Click on a database name to see the connection details and statistics.

In Postico, click the New Favorite button from the start dialog box.
Fill in information from your Postgress Add-On Dashboard.
Don’t forget the Database field, you need to fill that in based on your remote database name, which is something made-up like dfoqlom2okihn2.
Click Connect
You may see a warning about a secure certificate. If you click Connect on that dialog box, you will connect as expected.


Point your app at the remote Heroku Postgres database
Once you set up the Heroku Postgres Add-On, your Heroku app now has a Config Variable for your remote url, but it expects you to use SSL. In your Node/Express app, you need to update your pg connection string to add the SSL parameter to the URL.
See this section for more on Config Variables
// If we are running on Heroku, use the remote database (with SSL)
if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL + "?ssl=true";
} else {
    // running locally, use our local database instead
    connectionString = 'postgres://localhost:5432/local_db_name';
}


Add a Remote Host to pgAdmin
Once you have created a remote Postgres database, you can now connect your GUI client of choice to it, so you can manage your remote database visually.

You will need your remote database credentials. To find them:
In the Heroku website, click into your app. 
Select the Resources tab. 
Click on the Heroku Postgres :: Database resource.
You will be brought to the Heroku Postgres admin screen:

Click on a database name to see the connection details and statistics.


Connect to the Heroku Postgres server with PgAdmin

Add your username as provided in Step 7 along with the other info it generated, including password.
By default PgAdmin will show you *every* Heroku database using this add-on (lame!). To fix this, go to the Advanced tab:
disconnect from the server ('heroku') by right-clicking on it and selecting disconnect (you may have to close some pgAdmin windows).
To get to the advanced tab, right clicking on the server , go down to properties, and then go over to the advanced tab.  If you're disconnected everything should work fine.  
In 'DB restriction', type in the name of your database(s) enclosed in single quotes and separated by spaces.
Example: 'd3tlig1vr7a0ha'
reconnect the server (right-click -> connect) 
Connect to the server! You can now use PgAdmin to manage this server: run queries, import data, etc.



