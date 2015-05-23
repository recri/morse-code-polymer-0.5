# morse-code-polymer-0.5
Morse code functions implemented in javascript and Web Audio,
painstakingly wrapped in a Polymer-0.5 web component user interface,
and packaged up as a Chrome Application.

To use these sources, or any other Polymer project in source form, you
will need to install bower ("sudo npm install -g bower"), a javascript
package manager.  This requires you to figure out how to install npm,
another javascript package manager, and its dependencies by other means.

Once bower is available, then run "bower install" in the root of this
project to download the polymer-0.5 code and components specified by the
bower.json configuration file.   At present it downloads everything so my
development is not interrupted by missing components.  Bower will put
everything it downloads into bower_components which is ignored by git.

To run the application using the unbundled sources, you need to run an
http server in the root of the project so it can fulfill all the link
requests that loading the index.html page and its dependents will generate.
I run "python -m SimpleHTTPServer > http.log 2>&1&" to start the server
in this directory and save the log.  That works for me because of how my
chromebook is set up, your mileage may vary.

Far and away, the easiest way to run this application is to grab the chrome
application from the chrome store, but it isn't there yet.

The files in this directory as of writing, Sat May 23 09:44:11 MDT 2015.

* Makefile      - automation scripts
* README.md     - this helpful 
* assets/       - the results of 24 hours of icon design
* background.js - the chrome extension launch
* bower.json    - the bower package configuration
* bower_components/ - where bower stores its packages
* components/   - where this package stores itself
* index.html    - the root of this application
* manifest.json - the chrome extension manifest
* todo.org      - my notes
* vulcanized.html - all of the html documents in one file
* vulcanized.js - almost all of the javascript source in one file

