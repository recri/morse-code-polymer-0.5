/* -*- mode: js; tab-width: 8 -*- */
(function() {
    // these variables are shared by all instances of app-globals
    var station = window.morse.station();

    Polymer('morse-station', {

        publish : {
            input_pitch : 600,
            input_gain_dB : -26,
            input_wpm : 15,
            input_rise_ms : 4,
            input_fall_ms : 4,
            input_dah : 3,
            input_ies : 1,
            input_ils : 3,
            input_iws : 7,
            input_midi : 'none',
            input_swapped : false,
            input_type : 'iambic',

            output_pitch : 550,
            output_gain_dB : -26,
            output_wpm : 15,
            output_rise_ms : 4,
            output_fall_ms : 4,
            output_dah : 3,
            output_ies : 1,
            output_ils : 3,
            output_iws : 7,
            output_midi : 'none',
        },

        ready: function() { console.log("morse-station: ready"); },

        domReady: function() {
            this.input_pitch = station.input_pitch;
            this.input_gain_dB = station.input_gain_dB;
            this.input_wpm = station.input_wpm;
            this.input_rise_ms = station.input_rise_ms;
            this.input_fall_ms = station.input_fall_ms;
            this.input_dah = station.input_dah;
            this.input_ies = station.input_ies;
            this.input_ils = station.input_ils;
            this.input_iws = station.input_iws;
            this.input_midi = station.input_midi;
            this.input_swapped = station.input_swapped;
            this.input_type = station.input_type;

            this.output_pitch = station.output_pitch;
            this.output_gain_dB = station.output_gain_dB;
            this.output_wpm = station.output_wpm;
            this.output_rise_ms = station.output_rise_ms;
            this.output_fall_ms = station.output_fall_ms;
            this.output_dah = station.output_dah;
            this.output_ies = station.output_ies;
            this.output_ils = station.output_ils;
            this.output_iws = station.output_iws;
            this.output_midi = station.output_midi;
        },

        input_pitchChanged : function(oldv, newv) { this.attrChanged('input_pitch', oldv, newv); },
        input_gain_dBChanged : function(oldv, newv) { this.attrChanged('input_gain_dB', oldv, newv); },
        input_wpmChanged : function(oldv, newv) { this.attrChanged('input_wpm', oldv, newv); },
        input_rise_msChanged : function(oldv, newv) { this.attrChanged('input_rise_ms', oldv, newv); },
        input_fall_msChanged : function(oldv, newv) { this.attrChanged('input_fall_ms', oldv, newv); },
        input_dahChanged : function(oldv, newv) { this.attrChanged('input_dah', oldv, newv); },
        input_iesChanged : function(oldv, newv) { this.attrChanged('input_ies', oldv, newv); },
        input_ilsChanged : function(oldv, newv) { this.attrChanged('input_ils', oldv, newv); },
        input_iwsChanged : function(oldv, newv) { this.attrChanged('input_iws', oldv, newv); },
        input_midiChanged : function(oldv, newv) { this.attrChanged('input_midi', oldv, newv); },
        input_swappedChanged : function(oldv, newv) { this.attrChanged('input_swapped', oldv, newv); },
        input_typeChanged : function(oldv, newv) { this.attrChanged('input_type', oldv, newv); },

        output_pitchChanged : function(oldv, newv) { this.attrChanged('output_pitch', oldv, newv); },
        output_gain_dBChanged : function(oldv, newv) { this.attrChanged('output_gain_dB', oldv, newv); },
        output_wpmChanged : function(oldv, newv) { this.attrChanged('output_wpm', oldv, newv); },
        output_rise_msChanged : function(oldv, newv) { this.attrChanged('output_rise_ms', oldv, newv); },
        output_fall_msChanged : function(oldv, newv) { this.attrChanged('output_fall_ms', oldv, newv); },
        output_dahChanged : function(oldv, newv) { this.attrChanged('output_dah', oldv, newv); },
        output_iesChanged : function(oldv, newv) { this.attrChanged('output_ies', oldv, newv); },
        output_ilsChanged : function(oldv, newv) { this.attrChanged('output_ils', oldv, newv); },
        output_iwsChanged : function(oldv, newv) { this.attrChanged('output_iws', oldv, newv); },
        output_midiChanged : function(oldv, newv) { this.attrChanged('output_midi', oldv, newv); },

        attrChanged : function(attr, oldv, newv) {
	    console.log("station:"+attr, "oldv="+oldv, "newv="+newv);
	},
    });
})();
