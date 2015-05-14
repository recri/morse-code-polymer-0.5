/* -*- mode: js; tab-width: 8 -*- */
Polymer('morse-app', {
    created: function() {
        console.log('morse-app created');
    },
    ready : function() {
        console.log('morse-app ready');
    },
    attached: function () {
        console.log('morse-app attached');
    },
    domReady: function() {
        console.log('morse-app domReady');
        var pages = this.$['core-pages'];
	var map = [0, 1, 2, 3, 4, 4, 4, 5];
        for (var i = 0; i < 8; i += 1) {
	    var j = map[i];
            this.$['item'+i].addEventListener('click', (function(pages, selected) {
                return (function() { pages.selected = selected; });
            })(pages, j));
        }
    },
    detached: function() {
        console.log('morse-app detached');
    },
    attributeChanged: function(attrName, oldVal, newVal) {
        console.log(attrName, 'old: ' + oldVal, 'new:', newVal);
    },
});

