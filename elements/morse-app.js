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
    },
    detached: function() {
        console.log('morse-app detached');
    },
    attributeChanged: function(attrName, oldVal, newVal) {
        console.log(attrName, 'old: ' + oldVal, 'new:', newVal);
    },
    core_select : function(e) {
	// console.log("core_select: ", e, this.$.core_menu.selected, this.$.core_menu.selectedIndex);
	this.$.core_pages.selected = this.$.core_menu.selected;
    },

});

