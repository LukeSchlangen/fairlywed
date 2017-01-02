# fairlywed with SQL Authorization
AngularFire with token authentication on Node backend server. This branch uses the pg node module with a postgres database to show an authorization example.

## Get Started with fairlywed
1. Run these commands to add the project locally:
  ```shell
  $ git clone https://github.com/LukeSchlangen/fairlywed
  $ cd fairlywed
  $ npm install
  ```

2. Create a free Firebase account at https://firebase.google.com

3. Create a project from your Firebase account console

4. Add a connection to firebase on your front end
  1. Click the “Add Firebase to your web app” icon
  2. Copy the contents WITHOUT SCRIPT TAGS or the CDN from the resulting popup into `public/scripts/config.js`. It should look like this:

    ```javascript
      // Initialize Firebase
      var config = {
        apiKey: "XXXXXXXXXXXXXXXXXXXXXX",
        authDomain: "XXXXXXXXXXXX.firebaseapp.com",
        databaseURL: "https://XXXXXXXXXXXX.firebaseio.com",
        storageBucket: "XXXXXXXXXXXX.appspot.com",
        messagingSenderId: "XXXXXXXXXX"
      };
      firebase.initializeApp(config);
    ```

5. Add a firebase service account to you node project
  1. Navigate to the [Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) tab in your project's settings page.
  2. Select your Firebase project.
  3. Copy your `databaseURL` from the `Admin SDK configuration snippet`. The line you need will look like this: `databaseURL: "https://XXXXXXXXX.firebaseio.com"`.
  4. Navigate to the `server/modules/decoder.js` file in the node project and replace the databaseURL. Only replace that line. It is inside of the `admin.initializeApp`:

    ```javascript
    admin.initializeApp({
      credential: admin.credential.cert("./server/firebase-service-account.json"),
      databaseURL: "https://XXXXXXXXX.firebaseio.com" // replace this line with your URL
    });
    ```
  5. Return to firebase [Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk). Navigate to your project again if you have left it.
  6. Click the Generate New Private Key button at the bottom of the Firebase Admin SDK section of the Service Accounts tab.
  7. Rename the new JSON file to `firebase-service-account.json` and save it in the `server` folder of your application.

6. Return to Firebase console. Configure Google as an authentication provider for your Firebase project.
  1. In the Firebase console for your project (you may already be there from the previous step), click "Authentication" in left panel
  2. Click "Set Up Sign-In Method" button
  3. Select "Google"
  4. Click the "edit" icon
  5. Toggle Google to `on`

7. Connect the application to your database
  1. Install postgres by running `brew install postgres`
  2. Install postgis by running `brew install postgis --build-from-source`
  3. Start your postgres server by running `brew services start postgresql`
  4. Create a new postgres database `createdb fairlywed` or select one you already use. In `server/modules/database-config.js`, change the connection string, currently `var connectionString = 'postgres://localhost:5432/fairlywed';`, to match the location of your database.
  5. Copy the queries from the `database.sql` file and run them in postico to create the necessary tables for this project. On the insert query, be sure to add your own name and give yourself a clearance_level from 1 to 5. This will determine what data you can see:

8. Run `npm start` to run your application on `localhost:5000`. Because you have set up google OAuth, you will need to log in with a google account (an email with `@gmail.com` will work great). If you have a second google account, that will make it easy to see the differences for people with differing access levels. Most features should be available even without login. Vendor features or client featurea (such as creating a photographer account or purchasing a photographer package) require sign in.
9. Deploying the certificate to heroku requires moving it to environment variables.
10. For security on your firebase-queue database, be sure to deploy or copy and paste the rules to firebase (stops people from adding any content they choose. (This repo should be reformatted with environment variables to make this process simpler).
11. Updates will need to be made to the referrers before this API key is sent to production: https://console.developers.google.com/apis/credentials?project=farilywed

## License

1. The software is UNLICENSED and is for the sole use of fairlywed. All other use is strictly prohibited.
