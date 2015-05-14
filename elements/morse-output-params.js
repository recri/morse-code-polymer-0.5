/* -*- mode: javascript; indent-tabs-mode: nil; -*- */
Polymer({
    publish : {
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
        selected_output_midi_item : null
    },

    ready : function() { },

    output_midi_select : function(e) {
        if (this.selected_output_midi_item) {
            if (this.selected_output_midi_item.id == 'none')
                this.output_midi = 'none';
            else
                this.output_midi = this.selected_output_midi_item.innerText;
        }
    },
    output_midi_refresh : function() { station.output_midi_refresh(); },
    output_midi_names : function() { station.output_midi_names(); },

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

    attrChanged : function(attr, oldv, newv) { console.log("output:"+attr, "oldv="+oldv, "newv="+newv); },
});

  
