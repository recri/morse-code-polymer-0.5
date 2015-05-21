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
    core_select : function(e, d) {
	if (d.isSelected)
	    this.$.core_pages.selected = this.$.core_menu.selected;
	var item = this.$.core_pages.items[this.$.core_pages.selected];
	if (d.isSelected) {
	    if (item.onfocus) item.onfocus();
	} else {
	    if (item.onblur) item.onblur();
	}
    },

});

