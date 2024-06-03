##  Recipe Generator ##
### CM2020 Agile Software Projects ###

#### Installation requirements ####

* NodeJS 
    - follow the install instructions at https://nodejs.org/en/
    - we recommend using the latest LTS version
* Sqlite3 
    - follow the instructions at https://www.tutorialspoint.com/sqlite/sqlite_installation.htm 
    - Note that the latest versions of the Mac OS and Linux come with SQLite pre-installed

#### Settings that should be adjusted in configuration files ####

No settings need to be adjusted. The only npm package that I have added (which is included in the json file) is body-parser.

#### Additional libraries ####

No additional libraries have been added, but I have used a Google font, which is added to each <head> section of the .ejs files.

#### Using this web application ####

To get started:

* Run ```npm install``` from the project directory to install all the node packages.

* Run ```npm run build-db``` to create the database on Mac or Linux 
or run ```npm run build-db-win``` to create the database on Windows

* Run ```npm run start``` to start serving the web app (Access via http://localhost:3000)

Here is the main route, should you require it:

* http://localhost:3000

You can also run: 
```npm run clean-db``` to delete the database on Mac or Linux before rebuilding it for a fresh start
```npm run clean-db-win``` to delete the database on Windows before rebuilding it for a fresh start



NB. there is no need to install additional packages or run additional build scripts to run this code. Thank you very much for your time.

