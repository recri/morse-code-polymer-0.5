Polymer({
    toggle : function(e) {
	this.$.button.icon = (this.$.button.icon == "expand-more" ? "expand-less" : "expand-more");
	this.$.collapse.toggle();
    },
});

  
