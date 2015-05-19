/* -*- mode: javascript; indent-tabs-mode: nil; -*- */
Polymer({
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
        input_midi : "none",
        input_swapped : false,
        input_type : 'iambic',
        selected_input_midi_item : null,
        selected_input_type_item : null,
    },
    ready : function() { },

    input_type_select : function(e) {
        if (this.selected_input_type_item) {
            this.input_type = this.selected_input_type_item.id;
        }
    },
    input_swap_paddles : function() { this.input_swapped = this.$.swapped.checked; },
    input_midi_select : function(e) {
        if (this.selected_input_midi_item) {
            if (this.selected_input_midi_item.id == 'none')
                this.input_midi = 'none';
            else
                this.input_midi = this.selected_input_midi_item.innerText;
        }
    },
    input_midi_refresh : function() { station.input_midi_refresh(); },

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
    input_swappedChanged : function(oldv, newv) {
        if (this.$.swapped.checked != newv) this.$.swapped = newv;
        this.attrChanged('input_swapped', oldv, newv);
    },
    input_typeChanged : function(oldv, newv) { this.attrChanged('input_type', oldv, newv); },

    attrChanged : function(attr, oldv, newv) { console.log("input:"+attr, "oldv="+oldv, "newv="+newv); },
});
