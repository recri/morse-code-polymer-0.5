all: vulcanized.html assets/favicon.ico

vulcanized.html::
	../vulcanize/bin/vulcanize --csp index.html
assets/favicon.ico:assets/icon_16.png assets/icon_24.png assets/icon_48.png assets/icon_144.png assets/icon_192.png
	icotool -c -o assets/favicon.ico assets/icon_16.png assets/icon_24.png assets/icon_48.png assets/icon_144.png assets/icon_192.png

