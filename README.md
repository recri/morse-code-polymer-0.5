# morse-code-polymer-0.5
Morse code functions implemented in javascript and Web Audio
painstakingly wrapped in a web component user interface.  This is
the second version implemented using polymer-0.5.

To use this, you will need to install bower, a package manager.  This
is conveniently done by "sudo npm install -g bower" once you have
installed nodejs and npm by other means.

Then run "bower install" in the root of this project to download
all of the polymer code and components.  All of the components are
not necessary, but my bower.json file asks for them all.  They will
all be placed in bower_components which is ignored by git.

Then you run a localhost http server in the root of the project so
it can fulfill all the link requests that loading the index.html page
will generate.

I run "python -m SimpleHTTPServer > http.log 2>&1&" to make a simple
http server in this directory and save the log.

In the end, the whole application will boil down to an html file and
a javascript source using vulcanize and, but not at the moment.
