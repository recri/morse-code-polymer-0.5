Polymer({
    ready : function() {
	console.log("min "+(this.$.slider.min = this.min));
	console.log("max "+(this.$.slider.max = this.max));
	console.log("step "+(this.$.slider.step = this.step));
	console.log("value "+(this.$.slider.value = this.value));
	// this.$.slider.addEventListener('change', this.change);
    },
    change : function() {
	console.log("slider change from "+this.value+" to "+this.$.slider.value);
	this.value = this.$.slider.value;
    }
});

  
