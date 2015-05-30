/*
  Copyright (C) 2015 by Roger E Critchlow Jr, Santa Fe, NM, USA.

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 USA
*/

(function() {
  var root = this;
  var morse = {};

  // our personal extender function for inheritance
  // lucky choice, turns out that _.extend() doesn't do setters and getters
  function extend(obj, props) {
    for (var prop in props) {
      if (obj[prop]) console.log("overwrite "+prop);
      var tmp = Object.getOwnPropertyDescriptor(props, prop);
      if (tmp.get && tmp.set) {
        Object.defineProperty(obj, prop, { set : tmp.set, get : tmp.get });
      } else if (tmp.set) {
        Object.defineProperty(obj, prop, { set : tmp.set });
      } else if (tmp.get) {
        Object.defineProperty(obj, prop, { get : tmp.get });
      } else {
        obj[prop] = props[prop];
      }
    }
    return obj;
  }

  // translate text into dit/dah strings
  morse.table = function(name) {
    // object defining a morse code translation
    var self = {
      // the name of the encoding currently in use
      name: null,
      // the object dictionary table used for encoding
      code: null,
      // the object dictionary used to transliterate into roman
      trans: null,
      // the object dictionary used to decode morse back to unicode
      invert: null,
      // the object dictionary of dit lengths for each character
      dits: null,
      // encode the string into dit, dah, and space
      // dit is a period, dah is a hyphen, space is a space that represents
      // a nominal 2 dit clocks of space which is added to the 1 dit clock of space
      // that terminates each dit or dah.
      encode: function(string) {
        var result = [];
        if (string && self.code) {
          for (var i = 0; i < string.length; i += 1) {
            var c = string.charAt(i).toUpperCase();
            if (self.code[c]) {
              result.push(self.code[c]);
              result.push(' ');
            } else if (c == ' ') {
              result.push('  ');
            }
          }
        }
        return result.join('');
      },
      decode : function(string) {
        return self.invert[string];
      },
      // take a string in arabic, cyrillic, farsi, greek, hebrew, or wabun and transliterate into roman
      transliterate: function(string) {
        var result = [];
        if (self.trans) {
          for (var i = 0; i < string.length; i += 1) {
            var c = string.charAt(i).toUpperCase();
            if (self.trans[c]) {
              result += self.trans[c];
            } else if (c == ' ') {
              result.push(' ');
            }
          }
        } else {
          result.push(string);
        }
        return result.join('');
      },
      // compute the dit length of a string
      ditLength : function(string) {
        var result = 0;
        if (self.dits) {
          for (var i = 0; i < string.length; i += 1) {
            var c = string.charAt(i).toUpperCase();
            if (self.code[c]) {
              result += self.dits[c];
              result += 2;
            } else if (c == ' ') {
              result += 4;
            }
          }
        }
        return result;
      },
      // select the code to use
      setName: function(name) {
        if (self.name != name) {
          if (self.codes[name]) {
            self.name = name;
            self.code = self.codes[name];
            self.trans = self.transliterations[name];
            self.invert = {};
            self.dits = {};
            // there is a problem with multiple translations
            // because some morse codes get used for more than one character
            // ignored for now
            for (var i in self.code) {
              var code = self.code[i];
              self.invert[code] = i; // deal with multiple letters sharing codes
              self.dits[i] = 0;
              for (var j = 0; j < code.length; j += 1) {
                var c = code.charAt(j);
                if (c == '.') self.dits[i] += 2;
                else self.dits[i] += 4;
              }
            }
          }
        }
      },
      // return the list of valid name for codes
      getNames: function() {
        var names = [];
        for (var i in self.codes) names.push(i);
        return names;
      },
      // morse code translation tables
      codes : {
        'arabic' : {
          "\u0627" : '.-', "\u062f" : '-..', "\u0636" : '...-', "\u0643" : '-.-', "\ufe80" : '.', "\u0628" : '-...',
          "\u0630" : '--..', "\u0637" : '..-', "\u0644" : '.-..', "\u062a" : '-', "\u0631" : '.-.', "\u0638" : '-.--',
          "\u0645" : '--', "\u062b" : '-.-.', "\u0632" : '---.', "\u0639" : '.-.-', "\u0646" : '-.', "\u062c": '.---',
          "\u0633" : '...', "\u063a" : '--.', "\u0647" : '..-..', "\u062d" : '....', "\u0634" : '----', "\u0641" : '..-.',
          "\u0648" : '.--', "\u062e" : '---', "\u0635" : '-..-', "\u0642" : '--.-', "\u064a" : '..' },
        'cyrillic' : {
          "\u0410" : '.-', "\u041b" : '.-..', "\u0425" : '....', "\u0411" : '-...', "\u041c" : '--', "\u0426" : '-.-.',
          "\u0412" : '.--', "\u041d" : '-.', "\u0427" : '---.', "\u0413" : '--.', "\u041e" : '---', "\u0428" : '----',
          "\u0414" : '-..', "\u041f" : '.--.', "\u0429" : '--.-', "\u0415" : '.', "\u0420" : '.-.', "\u042c" : '-..-',
          "\u0416" : '...-', "\u0421" : '...', "\u042b" : '-.--', "\u0417" : '--..', "\u0422" : '-', "\u042d" : '..-..',
          "\u0418" : '..', "\u0423" : '..-', "\u042e" : '..--', "\u0419" : '.---', "\u0424" : '..-.', "\u042f" : '.-.-',
          "\u041a" : '-.-' },
        'farsi' : {
          "\u0627" : '.-', "\u062e" : '-..-', "\u0635" : '.-.-', "\u06a9" : '-.-', "\u0628" : '-...', "\u062f" : '-..',
          "\u0636" : '..-..', "\u06af" : '--.-', "\u067e" : '.--.', "\u0630" : '...-', "\u0637" : '..-', "\u0644" : '.-..',
          "\u062a" : '-', "\u0631" : '.-.', "\u0638" : '-.--', "\u0645" : '--', "\u062b" : '-.-.', "\u0632" : '--..',
          "\u0639" : '---', "\u0646" : '-.', "\u062c" : '.---', "\u0698" : '--.', "\u063a" : '..--', "\u0648" : '.--',
          "\u0686" : '---.', "\u0633" : '...', "\u0641" : '..-.', "\u0647" : '.', "\u062d" : '....', "\u0634" : '----',
          "\u0642" : '...---', "\u06cc" : '..' },
        'greek' : {
          "\u0391" : '.-', "\u0399" : '..', "\u03a1" : '.-.', "\u0392" : '-...', "\u039a" : '-.-', "\u03a3" : '...',
          "\u0393" : '--.', "\u039b" : '.-..', "\u03a4" : '-', "\u0394" : '-..', "\u039c" : '--', "\u03a5" : '-.--',
          "\u0395" : '.', "\u039d" : '-.', "\u03a6" : '..-.', "\u0396" : '--..', "\u039e" : '-..-', "\u03a7" : '----',
          "\u0397" : '....', "\u039f" : '---', "\u03a8" : '--.-', "\u0398" : '-.-.', "\u03a0" : '.--.', "\u03a9" : '.--' },
        'hebrew' : {
          "\u05d0" : '.-', "\u05dc" : '.-..', "\u05d1" : '-...', "\u05de" : '--', "\u05d2" : '--.', "\u05e0" : '-.',
          "\u05d3" : '-..', "\u05e1" : '-.-.', "\u05d4" : '---', "\u05e2" : '.---', "\u05d5" : '.', "\u05e4" : '.--.',
          "\u05d6" : '--..', "\u05e6" : '.--', "\u05d7" : '....', "\u05e7" : '--.-', "\u05d8" : '..-', "\u05e8" : '.-.',
          "\u05d9" : '..', "\u05e9" : '...', "\u05db" : '-.-', "\u05ea" : '-' },
        'itu' : {
          '!' : '-.-.--', '"' : '.-..-.', '$' : '...-..-', '&' : '.-...', "'" : '.----.', '(' : '-.--.', ')' : '-.--.-',
          '+' : '.-.-.', ',' : '--..--', '-' : '-....-', '.' : '.-.-.-', '/' : '-..-.',
          '0' : '-----', '1': '.----', '2' : '..---', '3' : '...--', '4' : '....-',
          '5' : '.....', '6' : '-....', '7' : '--...', '8' : '---..', '9' : '----.',
          ':' : '---...', ';' : '-.-.-.', '=' : '-...-', '?' : '..--..', '@' : '.--.-.',
          'A' : '.-', 'B' : '-...', 'C' : '-.-.', 'D' : '-..', 'E' : '.', 'F' : '..-.',
          'G' : '--.', 'H' : '....', 'I' : '..', 'J' : '.---', 'K' : '-.-',
          'L' : '.-..', 'M' : '--', 'N' : '-.', 'O' : '---', 'P' : '.--.', 'Q' : '--.-',
          'R' : '.-.', 'S' : '...', 'T' : '-', 'U' : '..-', 'V' : '...-',
          'W' : '.--', 'X' : '-..-', 'Y' : '-.--', 'Z' : '--..', '_' : '..--.-',
          '*' : '...-.-', //  prosigns assigned to ascii punctuation
          'À' : '.--.-', 'Ä' : '.-.-', 'Ç' : '----', 'È' : '..-..', 'Ñ' : '--.--', 'Ö' : '---.', 'Ü' : '..--', // latin extensions
        },
        // rather than get all creative, though I'm not sure where the creation came from, copy the fldigi code table
        'fldigi' : {
	  '!' : '-.-.--',	            '$' : '...-..-', '&' : '..-.-', "'" : '.----.', '(' : '-.--.', ')' : '-.--.-',
	  '+' : '.-.-.', ',' : '--..--', '-' : '-....-', '.' : '.-.-.-', '/' : '-..-.',
	  '0' : '-----', '1' : '.----', '2' : '..---', '3' : '...--', '4' : '....-',
	  '5' : '.....', '6' : '-....', '7' : '--...', '8' : '---..', '9' : '----.',
	  ':' : '---...', ';' : '-.-.-.', '=' : '-...-', '?' : '..--..', '@' : '.--.-.',
	  'A' : '.-', 'B' : '-...', 'C' : '-.-.', 'D' : '-..', 'E' : '.', 'F' : '..-.',
	  'G' : '--.', 'H' : '....', 'I' : '..', 'J' : '.---', 'K' : '-.-',
          'L' : '.-..', 'M' : '--', 'N' : '-.', 'O' : '---', 'P' : '.--.', 'Q' : '--.-',
	  'R' : '.-.', 'S' : '...', 'T' : '-', 'U' : '..-', 'V' : '...-',
	  'W' : '.--', 'X' : '-..-', 'Y' : '-.--', 'Z' : '--..', '_' : '..--.-',

	  '\\' : '.-..-.',
	  '~' : '.-.-',
	  '%' : '.-...',
          '>' : '...-.-',
	  '<' : '-.--.',
	  '}' : '....--',
	  '{' : '...-.',
        },
        'wabun' : {
          "\u30a2" : '--.--', "\u30ab" : '.-..', "\u30b5" : '-.-.-', "\u30bf" : '-.', "\u30ca" : '.-.', "\u30cf" : '-...',
          "\u30de" : '-..-', "\u30e4" : '.--', "\u30e9" : '...', "\u30ef" : '-.-', "\u25cc" : '..', "\u30a4" : '.-',
          "\u30ad" : '-.-..', "\u30b7" : '--.-.', "\u30c1" : '..-.', "\u30cb" : '-.-.', "\u30d2" : '--..-', "\u30df" : '..-.-',
          "\u30ea" : '--.', "\u30f0" : '.-..-', "\u30a6" : '..-', "\u30af" : '...-', "\u30b9" : '---.-',
          "\u30c4" : '.--.', "\u30cc" : '....', "\u30d5" : '--..', "\u30e0" : '-', "\u30e6" : '-..--', "\u30eb" : '-.--.',
          "\u30f3" : '.-.-.',  "\u30a8" : '-.---', "\u30b1" : '-.--', "\u30bb" : '.---.', "\u30c6" : '.-.--',
          "\u30cd" : '--.-', "\u30d8" : '.', "\u30e1" : '-...-', "\u30ec" : '---', "\u30f1" : '.--..', "\u3001" : '.-.-.-',
          "\u30aa" : '.-...', "\u30b3" : '----', "\u30bd" : '---.', "\u30c8" : '..-..', "\u30ce" : '..--', "\u30db" : '-..',
          "\u30e2" : '-..-.', "\u30e8" : '--', "\u30ed" : '.-.-', "\u30f2" : '.---', "\u3002": '.-.-..' }
        // duplicate key "\u25cc" : '.--.-', "\u25cc" : '..--.', 
      },
      // transliteration tables for non-roman alphabets
      transliterations : {
        'arabic' : {
          "\u0627" : 'A', "\u062f" : 'D', "\u0636" : 'V', "\u0643" : 'K', "\ufe80" : 'E', "\u0628" : 'B', "\u0630" : 'Z', "\u0637" : 'U', "\u0644" : 'L',
          "\u062a" : 'T', "\u0631" : 'R', "\u0638" : 'Y', "\u0645" : 'M', "\u062b" : 'C', "\u0632" : 'Z', "\u0639" : 'Ä', "\u0646" : 'N', "\u062c" : 'J',
          "\u0633" : 'S', "\u063a" : 'G', "\u0647" : 'É', "\u062d" : 'H', "\u0634" : 'SH', "\u0641" : 'F', "\u0648" : 'W', "\u062e" : 'O', "\u0635" : 'X',
          "\u0642" : 'Q', "\u064a" : 'I'
        },
        'cyrillic' : {
          "\u0410" : 'A', "\u041b" : 'L', "\u0425" : 'H', "\u0411" : 'B', "\u041c" : 'M', "\u0426" : 'C', "\u0412" : 'W', "\u041d" : 'N', "\u0427" : 'Ö',
          "\u0413" : 'G', "\u041e" : 'O', "\u0428" : 'CH', "\u0414" : 'D', "\u041f" : 'P', "\u0429" : 'Q', "\u0415" : 'E', "\u0420" : 'R', "\u042c" : 'X',
          "\u0416" : 'V', "\u0421" : 'S', "\u042b" : 'Y', "\u0417" : 'Z', "\u0422" : 'T', "\u042d" : 'É', "\u0418" : 'I', "\u0423" : 'U', "\u042e" : 'Ü',
          "\u0419" : 'J', "\u0424" : 'F', "\u042f" : 'Ä', "\u041a" : 'K'
        },
        'farsi' : {
          "\u0627" : 'A', "\u062e" : 'X', "\u0635" : 'Ä', "\u06a9" : 'K', "\u0628" : 'B', "\u062f" : 'D', "\u0636" : 'É', "\u06af" : 'Q', "\u067e" : 'P',
          "\u0630" : 'V', "\u0637" : 'U', "\u0644" : 'L', "\u062a" : 'T', "\u0631" : 'R', "\u0638" : 'Y', "\u0645" : 'M', "\u062b" : 'C', "\u0632" : 'Z',
          "\u0639" : 'O', "\u0646" : 'N', "\u062c" : 'J', "\u0698" : 'G', "\u063a" : 'Ü', "\u0648" : 'W', "\u0686" : 'Ö', "\u0633" : 'S', "\u0641" : 'F',
          "\u0647" : 'E', "\u062d" : 'H', "\u0634" : 'Š', "\u0642" : '?', "\u06cc" : 'I'
        },
        'greek' : {
          "\u0391" : 'A', "\u0399" : 'I', "\u03a1" : 'R', "\u0392" : 'B', "\u039a" : 'K', "\u03a3" : 'S', "\u0393" : 'G', "\u039b" : 'L', "\u03a4" : 'T',
          "\u0394" : 'D', "\u039c" : 'M', "\u03a5" : 'Y', "\u0395" : 'E', "\u039d" : 'N', "\u03a6" : 'F', "\u0396" : 'Z', "\u039e" : 'X', "\u03a7" : 'CH',
          "\u0397" : 'H', "\u039f" : 'O', "\u03a8" : 'Q', "\u0398" : 'C', "\u03a0" : 'P', "\u03a9" : 'W'
        },
        'hebrew' : {
          "\u05d0" : 'A', "\u05dc" : 'L', "\u05d1" : 'B', "\u05de" : 'M', "\u05d2" : 'G', "\u05e0" : 'N', "\u05d3" : 'D', "\u05e1" : 'C', "\u05d4" : 'O',
          "\u05e2" : 'J', "\u05d5" : 'E', "\u05e4" : 'P', "\u05d6" : 'Z', "\u05e6" : 'W', "\u05d7" : 'H', "\u05e7" : 'Q', "\u05d8" : 'U', "\u05e8" : 'R',
          "\u05d9" : 'I', "\u05e9" : 'S', "\u05db" : 'K', "\u05ea" : 'T'
        },
        'wabun' : {
          "\u30a2" : 'a', "\u30ab" : 'ka', "\u30b5" : 'sa',  "\u30bf" : 'ta',  "\u30ca" : 'na', "\u30cf" : 'ha', "\u30de" : 'ma', "\u30e4" : 'ya', "\u30e9" : 'ra',
          "\u30a4" : 'i', "\u30ad" : 'ki', "\u30b7" : 'shi', "\u30c1" : 'chi', "\u30cb" : 'ni', "\u30d2" : 'hi', "\u30df" : 'mi', "\u30ea" : 'ri', "\u30f0" : 'wi',
          "\u30a6" : 'u', "\u30af" : 'ku', "\u30b9" : 'su',  "\u30c4" : 'tsu', "\u30cc" : 'nu', "\u30d5" : 'fu', "\u30e0" : 'mu', "\u30e6" : 'yu', "\u30eb" : 'ru',
          "\u30f3" : 'n',
          "\u30a8" : 'e', "\u30b1" : 'ke', "\u30bb" : 'se',  "\u30c6" : 'te',  "\u30cd" : 'ne', "\u30d8" : 'he', "\u30e1" : 'me', "\u30ec" : 're', "\u30f1" : 'we',
          "\u30aa" : 'o', "\u30b3" : 'ko', "\u30bd" : 'so',  "\u30c8" : 'to',  "\u30ce" : 'no', "\u30db" : 'ho', "\u30e2" : 'mo', "\u30e8" : 'yo', "\u30ed" : 'ro',  "\u30f2" : 'wo',
          // these end up as duplicate keys
          // "\u25cc" : 'Dakuten', "\u25cc" : 'Handakuten', "\u25cc" : 'Long vowel',
          "\u3001" : 'Comma', "\u3002" : 'Full stop'
        }
      }
    };
    self.setName(name || 'fldigi');
    return self;
  };

  morse.event = function() {
    var self = {
      /**
       * events: installed event handlers
       */
      events : {},
      /**
       *  on: listen to events
       */
      on : function(type, func, ctx) {
        (this.events[type] = this.events[type] || []).push({f:func, c:ctx});
      },
      /**
       *  Off: stop listening to event / specific callback
       */
      off : function(type, func) {
        if ( ! type) this.events = {};
        var list = this.events[type] || [],
            i = list.length = func ? list.length : 0;
        while(i-->0) if (func == list[i].f) list.splice(i,1);
      },
      /**
       * Emit: send event, callbacks will be triggered
       */
      emit : function() {
        var args = Array.apply([], arguments), list = this.events[args.shift()] || [], i=0;
        for (var j=list[i++]; j; j=list[i++]) j.f.apply(j.c, args);
      },
    };
    return self;
  };

  // translate keyup/keydown into keyed sidetone
  morse.player = function(context) {
    // extend morse.event
    var self = extend(morse.event(), {
      // add an oscillator
      oscillator : context.createOscillator(),
      // and a keying envelope
      key : context.createGain(),
      // the pitch of the oscillator
      set pitch(hertz) {
        this.oscillator.frequency.value = hertz;
        this.emit('change:pitch', hertz);
      },
      get pitch() { return this.oscillator.frequency.value; },
      // the envelope
      ramp : { rise : 0.004, fall : 0.004, max : 0.05 },
      // the maximum gain of the envelope in dB 
      _gain_dB : 0,
      set gain(gain_dB) {
        this._gain_dB = gain_dB;
        this.ramp.max = Math.pow(10, gain_dB/20);
      },
      get gain() { return this._gain_dB; },
      // the rise time of the envelope in ms
      set rise(ms) { this.ramp.rise = (ms || 4) / 1000; },
      get rise() { return this.ramp.rise * 1000; },
      // the fall time of the envelope in ms
      set fall(ms) { this.ramp.fall = (ms || 4) / 1000; },
      get fall() { return this.ramp.fall * 1000; },
      // where we are in the sample time stream
      curpos : 0,
      set cursor(seconds) { this.curpos = seconds; },
      get cursor() { return (this.curpos = Math.max(this.curpos, context.currentTime)); },
      // connect our output samples to somewhere
      connect : function(target) { this.key.connect(target); },
      // turn the key on now
      keyOn : function() {
        this.cancel();
        this.keyOnAt(context.currentTime);
      },
      // turn the key off now
      keyOff : function() {
        this.cancel();
        this.offAt(context.currentTime);
      },
      // schedule the key on at time
      keyOnAt : function(time) {
        // console.log("keyOnAt", time, " at ", context.currentTime);
        this.key.gain.setValueAtTime(0.0, time);
        this.key.gain.linearRampToValueAtTime(this.ramp.max, time+this.ramp.rise);
        this.cursor = time;
        this.emit('transition', 1, time);
      },
      // schedule the key off at time
      keyOffAt : function(time) {
        // console.log("keyOffAt", time, " at ", context.currentTime);
        this.key.gain.setValueAtTime(this.ramp.max, time);
        this.key.gain.linearRampToValueAtTime(0.0, time+this.ramp.fall);
        this.cursor = time;
        this.emit('transition', 0, time);
      },
      // hold the last scheduled key state for seconds
      keyHoldFor : function(seconds) {
        // console.log("keyHoldFor until", this.cursor+seconds, "at", context.currentTime);
        return this.cursor += seconds;
      },
      // cancel all scheduled key transitions
      cancel : function() {
        // console.log("cancel at ", context.currentTime);
        this.key.gain.cancelScheduledValues(this.cursor = context.currentTime);
        this.key.gain.value = 0;
      },
    });

    // initialize parameters
    self.pitch = 600;
    self.gain = -26;
    self.rise = 4;
    self.fall = 4;
    self.cursor = 0;                // next time

    // initialize the oscillator
    self.oscillator.type = 'sine';
    self.oscillator.start();

    // initialize the gain
    self.key.gain.value = 0;
    self.oscillator.connect(self.key);

    return self;
  };

  // translate text into keyed sidetone
  // extends the oscillator with a code table and timings for the elements of the code
  morse.output = function(context) {
    // extends player
    var self = extend(morse.player(context), {
      table : morse.table(),
      set wpm(wpm) { this.dit = 60.0 / (Math.max(5, Math.min(100, wpm)) * 50); },
      get wpm() { return 60 / (this.dit * 50); },
      dah : 3,            // dah length in dits
      ies : 1,            // interelement space in dits
      ils : 3,            // interletter space in dits
      iws : 7,            // interword space in dits
      send : function(string) {
        var code = this.table.encode(string);
        var time = this.cursor;
        for (var i = 0; i < code.length; i += 1) {
          var c = code.charAt(i);
          if (c == '.' || c == '-') {
            this.keyOnAt(time);
            time = this.keyHoldFor((c == '.' ? 1 : this.dah) * this.dit);
            this.keyOffAt(time);
            time = this.keyHoldFor(this.ies * this.dit);
          } else if (c == ' ') {
            if (i+2 < code.length && code.charAt(i+1) == ' ' && code.charAt(i+2) == ' ') {
              time = this.keyHoldFor((this.iws-this.ies) * this.dit);
              i += 2;
            } else {
              time = this.keyHoldFor((this.ils-this.ies) * this.dit);
            }
          }
        }
      },
    });
    self.wpm = 20;          // words per minute
    return self;
  };

  //
  // translate keyed audio tone to keyup/keydown events
  // this doesn't seem to work correctly at present.
  //
  morse.detone = function(context) {
    /*
    ** The Goertzel filter detects the power of a specified frequency
    ** very efficiently.
    **
    ** This is based on http://en.wikipedia.org/wiki/Goertzel_algorithm
    ** and the video presentation of CW mode for the NUE-PSK modem
    ** at TAPR DCC 2011 by George Heron N2APB and Dave Collins AD7JT.
    */
    // extends event
    var self = extend(morse.event(), {
      scriptNode : context.createScriptProcessor(1024, 1, 1),
      center : 600,
      bandwidth : 100,
      coeff : 0,
      s : new Float32Array(4),
      block_size : 0,
      i : 0,
      power : 0,
      setCenterAndBandwidth : function(center, bandwidth) {
        if (center > 0 && center < context.sampleRate/4) {
          this.center = center;
        } else {
          this.center = 600;
        }
        if (bandwidth > 0 && bandwidth > context.sampleRate/4) {
          this.bandwidth = bandwidth;
        } else {
          this.bandwidth = 50;
        }
        this.coeff = 2 * Math.cos(2*Math.PI*this.center/context.sampleRate);
        this.block_size = context.sampleRate / this.bandwidth;
        this.i = this.block_size;
        this.s[0] = this.s[1] = this.s[3] = this.s[4] = 0;
      },
      detone_process : function(x) {
        this.s[this.i&3] = x + this.coeff * this.s[(this.i+1)&3] - this.s[(this.i+2)&3];
        if (--this.i < 0) {
          this.power = this.s[1]*this.s[1] + this.s[0]*this.s[0] - this.coeff*this.s[0]*this.s[1];
          this.i = this.block_size;
          this.s[0] = this.s[1] = this.s[2] = this.s[3] = 0.0;
          return 1;
        } else {
          return 0;
        }
      },
      maxPower : 0,
      oldPower : 0,
      dtime : 0,
      onoff : 0,
      onAudioProcess : function(audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var outputBuffer = audioProcessingEvent.outputBuffer;
        var inputData = inputBuffer.getChannelData(0);
        var outputData = outputBuffer.getChannelData(0);
        var time = audioProcessingEvent.playbackTime;
        // console.log("onAudioProcess "+inputBuffer.length+" samples at "+time);
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          outputData[sample] = inputData[sample];
          if (this.detone_process(inputData[sample])) {
            this.maxPower = Math.max(this.power, this.maxPower);
            if (this.onoff === 0 && this.oldPower < 0.6*this.maxPower && this.power > 0.6*this.maxPower)
              this.emit('transition', this.onoff = 1, time);
            if (this.onoff == 1 && this.oldPower > 0.4*this.maxPower && this.power < 0.4*this.maxPower)
              this.emit('transition', this.onoff = 0, time);
          }
          this.oldPower = this.power;
          time += this.dtime;
        }
      },
      connect : function(node) { this.scriptNode.connect(node); },
      get target() { return this.scriptNode; },
      onchangepitch : function(pitch) { this.setCenterAndBandwidth(pitch, this.bandwidth); },
    });
    // setup
    self.setCenterAndBandwidth(self.center, self.bandwidth);
    self.dtime = 1.0 / context.sampleRate;
    self.scriptNode.onaudioprocess = function(audioProcessingEvent) { self.onAudioProcess(audioProcessingEvent); };
    // go
    return self;
  };

  // translate keydown/keyup events to dit dah strings
  morse.detime = function(context) {
    /*
    ** from observations of on/off events
    ** deduce the CW timing of the morse being received
    ** and start translating the marks and spaces into
    ** dits, dahs, inter-symbol spaces, and inter-word spaces
    */
    var self = extend(morse.detone(context), {
      wpm : 0,            /* float words per minute */
      word : 50,          /* float dits per word */
      estimate : 0,   /* float estimated dot clock period */
      time : 0,           /* float time of last event */
      n_dit : 1,          /* unsigned number of dits estimated */
      n_dah : 1,          /* unsigned number of dahs estimated */
      n_ies : 1,          /* unsigned number of inter-element spaces estimated */
      n_ils : 1,          /* unsigned number of inter-letter spaces estimated */
      n_iws : 1,          /* unsigned number of inter-word spaces estimated */

      configure : function(wpm, word) {
        this.wpm = wpm > 0 ? wpm : 15;
        this.word = 50;
        this.estimate = (context.sampleRate * 60) / (this.wpm * this.word);
      },

      /*
      ** The basic problem is to infer the dit clock rate from observations of dits,
      ** dahs, inter-element spaces, inter-letter spaces, and maybe inter-word spaces.
      **
      ** Assume that each element observed is either a dit or a dah and record its
      ** contribution to the estimated dot clock as if it were both T and 3*T in length.
      ** Similarly, take each space observed as potentially T, 3*T, and 7*T in length.
      **
      ** But weight the T, 3*T, and 7*T observations by the inverse of their squared
      ** distance from the current estimate, and weight the T, 3*T, and 7*T observations
      */
      /*** by their observed frequency in morse code.
       **
       ** Until detime has seen both dits and dahs, it may be a little confused.
       */
      detime_process : function(onoff, time) {
        time *= context.sampleRate;                     /* convert seconds to frames */
        var observation = time - this.time;     /* float length of observed element or space */
        var guess, wt, update;
        this.time = time;
        if (onoff === 0) {                               /* the end of a dit or a dah */
          var o_dit = observation;            /* float if it's a dit, then the length is the dit clock observation */
          var o_dah = observation / 3;                /* float if it's a dah, then the length/3 is the dit clock observation */
          var d_dit = o_dit - this.estimate;  /* float the dit distance from the current estimate */
          var d_dah = o_dah - this.estimate;  /* float the dah distance from the current estimate */
          if (d_dit === 0 || d_dah === 0) {
            /* one of the observations is spot on, so 1/(d*d) will be infinite and the estimate is unchanged */
          } else {
            /* the weight of an observation is the observed frequency of the element scaled by inverse of
             * distance from our current estimate normalized to one over the observations made.
             */
            var w_dit = 1.0 * this.n_dit / (d_dit*d_dit); /* raw weight of dit observation */
            var w_dah = 1.0 * this.n_dah / (d_dah*d_dah); /* raw weight of dah observation */
            wt = w_dit + w_dah;                      /* weight normalization */
            update = (o_dit * w_dit + o_dah * w_dah) / wt;
            //console.log("o_dit="+o_dit+", w_dit="+w_dit+", o_dah="+o_dah+", w_dah="+w_dah+", wt="+wt);
            //console.log("update="+update+", estimate="+this.estimate);
            this.estimate += update;
            this.estimate /= 2;
            this.wpm = (context.sampleRate * 60) / (this.estimage * this.word);
          }
          guess = 100 * observation / this.estimate;    /* make a guess */
          if (guess < 200) {
            this.n_dit += 1; return '.';
          } else {
            this.n_dah += 1; return '-';
          }
        } else {                                        /* the end of an inter-element, inter-letter, or a longer space */
          var o_ies = observation;
          var o_ils = observation / 3;
          var d_ies = o_ies - this.estimate;
          var d_ils = o_ils - this.estimate;
          guess = 100 * observation / this.estimate;
          if (d_ies === 0 || d_ils === 0) {
            /* if one of the observations is spot on, then 1/(d*d) will be infinite and the estimate is unchanged */
          } else if (guess > 500) {
            /* if it looks like a word space, it could be any length, don't worry about how long it is */
          } else {
            var w_ies = 1.0 * this.n_ies / (d_ies*d_ies);
            var w_ils = 1.0 * this.n_ils / (d_ils*d_ils);
            wt = w_ies + w_ils;
            update = (o_ies * w_ies + o_ils * w_ils) / wt;
            //console.log("o_ies="+o_ies+", w_ies="+w_ies+", o_ils="+o_ils+", w_ils="+w_ils+", wt="+wt);
            //console.log("update="+update+", estimate="+this.estimate);
            this.estimate += update;
            this.estimate /= 2;
            this.wpm = (context.sampleRate * 60) / (this.estimage * this.word);
            guess = 100 * observation / this.estimate;
          }
          if (guess < 200) {
            this.n_ies += 1; return '';
          } else if (guess < 500) {
            this.n_ils += 1; return ' ';
          } else {
            this.n_iws += 1; return '\t';
          }
        }
      },
      // event handler
      ontransition : function(onoff, time) {
        // console.log('ontransition('+onoff+", "+time+") in "+this);
        this.emit('element', this.detime_process(onoff, time), time);
      },
    });
    self.on('transition', self.ontransition, self);
    self.configure(15, 50); // this is part suggestion (15 wpm) and part routine (50 dits/word is PARIS)
    return self;
  };

  // translate dit dah strings to text
  morse.decode = function(context) {
    var self = extend(morse.detime(context), {
      table : null,
      elements : [],
      elementTimeout : null,
      elementTimeoutFun : function() {
        self.elementTimeout = null;
        if (self.elements.length > 0) {
          var code = self.elements.join('');
          self.emit('letter', self.table.decode(code) || '\u25a1', code);
          self.elements = [];
        }
      },
      onelement : function(elt, timeEnded) {
        if (this.elementTimeout) {
          clearTimeout(this.elementTimeout);
          this.elementTimeout = null;
        }
        if (elt === '') {
          return;
        }
        if (elt == '.' || elt == '-') {
          this.elements.push(elt);
          this.elementTimeout = setTimeout(this.elementTimeoutFun, 1000*(timeEnded-context.currentTime)+250);
          return;
        }
        if (this.elements.length > 0) {
          var code = this.elements.join('');
          this.emit('letter', this.table.decode(code)  || '\u25a1', code);
          this.elements = [];
        }
        if (elt == '\t') {
          this.emit('letter', ' ', elt);
        }
      },
    });
    self.on('element', self.onelement, self);
    return self;
  };

  // translate iambic paddle events into keyup/keydown events
  morse.iambic_keyer = function(context) {
    /*
    ** This has been stripped down to the minimal iambic state machine
    ** from the AVR sources that accompany the article in QEX March/April
    ** 2012, and the length of the dah and inter-element-space has been
    ** made into configurable multiples of the dit clock.
    **
    ** And then,
    */
    /*
     * newkeyer.c  an electronic keyer with programmable outputs
     * Copyright (C) 2012 Roger L. Traylor
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU General Public License as published by
     * the Free Software Foundation, either version 3 of the License, or
     * (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with this program.  If not, see <http://www.gnu.org/licenses/>.
     */


    // newkeyer.c
    // R. Traylor
    // 3.19.2012
    // iambic keyer

    // keyer states
    var IDLE =     0;  // waiting for a paddle closure
    var DIT =      1;  // making a dit or the space after
    var DAH =      2;  // making a dah or the space after

    // state variables
    var keyer_state = IDLE; // the keyer state
    var dit_pending = false;        // memory for dit seen while playing a dah
    var dah_pending = false;        // memory for dah seen while playing a dit
    var timer = 0;          // seconds counting down to next decision

    // seconds per feature
    var _perDit = 0;
    var _perDah = 0;
    var _perIes = 0;

    // parameters
    var _swapped = false;   // true if paddles are swapped
    var _wpm = 20;          // words per minute
    var _dahLen = 3;                // dits per dah
    var _iesLen = 1;                // dits per space between dits and dahs

    // update the clock computations
    // for reference a dit is
    //              80ms at 15wpm
    //              60ms at 20wpm
    //              48ms at 25wpm
    //              40ms at 30wpm
    //              30ms at 40wpm
    //              24ms at 50wpm
    function update() {
      // second timing
      _perDit = 60.0 / (_wpm * 50);
      _perDah = _perDit * _dahLen;
      _perIes = _perDit * _iesLen;
    }

    // extends player
    var self = extend(morse.player(context), {

      transition : function(state, len) {
        // mark the new state
        keyer_state = state;
        // reset the timer
        if (timer < 0) timer = 0;
        timer += len+_perIes;
        // sound the element
        var time = this.cursor;
        this.keyOnAt(time);
        this.keyOffAt(time+len);
        this.keyHoldFor(_perIes);
      },

      make_dit : function() { this.transition(DIT, _perDit); },
      make_dah : function() { this.transition(DAH, _perDah); },

      clock : function(raw_dit_on, raw_dah_on, ticks) {
        var dit_on = _swapped ? raw_dah_on : raw_dit_on;
        var dah_on = _swapped ? raw_dit_on : raw_dah_on;

        // update timer
        timer -= ticks;

        // keyer state machine
        if (keyer_state == IDLE) {
          if (dit_on) self.make_dit();
          else if (dah_on) self.make_dah();
        } else if ( timer <= _perIes/2 ) {
          if (keyer_state == DIT) {
            if ( dah_pending || dah_on ) self.make_dah();
            else if (dit_on) self.make_dit();
            else keyer_state = IDLE;
          } else if (keyer_state == DAH) {
            if ( dit_pending || dit_on ) self.make_dit();
            else if (dah_on) self.make_dah();
            else keyer_state = IDLE;
          }
        }

        //*****************  dit pending state machine   *********************
        dit_pending = dit_pending ?
          keyer_state != DIT :
          (dit_on && keyer_state == DAH && timer < _perDah/3+_perIes);

        //******************  dah pending state machine   *********************
        dah_pending = dah_pending ?
          keyer_state != DAH :
          (dah_on && keyer_state == DIT && timer < _perDit/2+_perIes);

      },

      // swap the dit and dah paddles
      set swapped(swapped) { _swapped = swapped; },
      get swapped() { return _swapped; },

      // set the words per minute generated
      set wpm(wpm) { _wpm = wpm; update(); },
      get wpm() { return _wpm; },

      // set the dah length in dits
      set dah(dahLen) { _dahLen = dahLen; update(); },
      get dah() { return _dahLen; },

      // set the inter-element length in dits
      set ies(iesLen) { _iesLen = iesLen; update(); },
      get ies() { return _iesLen; },
    });
    //
    update();
    return self;
  };

  morse.straight_input = function(context) {
    // extends player
    var self = extend(morse.player(context), {
      raw_key_on : false,
      is_on : false,
      keyset : function(key, on) {
        this.raw_key_on = on;
        if (this.raw_key_on != this.is_on) {
          this.is_on = this.raw_key_on;
          if (this.is_on) this.keyOnAt(this.cursor); else this.keyOffAt(this.cursor);
        }
      },
      //
      keydown : function(key) { self.keyset(key, true); },
      keyup : function(key) { self.keyset(key, false); },
      //
      onfocus : function() { },
      onblur : function() { self.keyset(0, false); },
      // handlers for MIDI
      onmidievent : function(event) {
        if (event.data.length == 3) {
          // console.log("onmidievent "+event.data[0]+" "+event.data[1]+" "+event.data[2].toString(16));
          switch (event.data[0]&0xF0) {
          case 0x90: self.keyset(0, true); break;
          case 0x80: self.keyset(0, false); break;
          }
        }
      },
    });
    return self;
  };

  morse.iambic_input = function(context) {
    // extend iambic keyer
    var self = extend(morse.iambic_keyer(context), {
      raw_dit_on : false,
      raw_dah_on : false,
      // handlers for focus
      onfocus : function() { self.start(); },
      onblur : function() { self.stop(); },
      // handlers for MIDI
      onmidievent : function(event) {
        if (event.data.length == 3) {
          // console.log("onmidievent "+event.data[0]+" "+event.data[1]+" "+event.data[2].toString(16));
          switch (event.data[0]&0xF0) {
          case 0x90: self.keyset(event.data[1]&1, true); break;
          case 0x80: self.keyset(event.data[1]&1, false); break;
          }
        }
      },
      // common handlers
      keyset : function(key, on) {
        if (key) this.raw_dit_on = on; else this.raw_dah_on = on;
        this.intervalFunction();
      },
      keydown : function(key) { self.keyset(key, true); },
      keyup : function(key) { self.keyset(key, false); },
      intervalLast : context.currentTime,
      intervalFunction : function() {
        var time = context.currentTime;
        var tick = time - self.intervalLast;
        self.intervalLength = (self.intervalLength + tick) / 2;
        self.intervalLast = time;
        self.clock(self.raw_dit_on, self.raw_dah_on, tick);
      },
      interval : null,
      start : function() {
        if (this.interval) {
          this.stop();
        }
        this.interval = setInterval(this.intervalFunction, 1);
      },
      stop : function() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.raw_dit_on = false;
        this.raw_dah_on = false;
        this.cancel();
      },
    });
    return self;
  };

  /*
  ** The MIDI interface may need to be enabled in chrome://flags,
  ** but even then it may not implement everything needed.
  **
  ** This mostly works in chrome-unstable as of 2015-04-16, Version 43.0.2357.18 dev (64-bit).
  ** but
  **  1) does not detect hot plugged MIDI devices, only those that are present when
  **  chrome is launched; or maybe it does, but not reliably;
  **  2) the supplied event timestamp has no value;
  **  3) the list of MIDI devices may become stale, ie they're there, they worked once, but they
  **  don't work now even though the browser continues to list them;
  */
  morse.midi_input = function() {
    var self = {
      midiOptions : { },
      midi : null,  // global MIDIAccess object
      onMIDIMessage : function ( event ) {
        var str = "MIDI message received at timestamp " + event.timestamp + "[" + event.data.length + " bytes]: ";
        for (var i=0; i<event.data.length; i++) {
          str += "0x" + event.data[i].toString(16) + " ";
        }
        console.log( str );
      },
      onMIDISuccess : function( midiAccess ) {
        // console.log( "MIDI ready!" );
        this.midi = midiAccess;
      },
      onMIDIFailure : function(msg) {
        // console.log( "Failed to get MIDI access - " + msg );
      },
      names : function() {
        var names = [];
        if (this.midi)
          for (var x of this.midi.inputs.values())
            names.push(x.name);
        return names;
      },
      connect : function(name, handler) {
        if (name && name != 'none' && this.midi) {
          for (var x of this.midi.inputs.values()) {
            if (x.name == name) {
              x.onmidimessage = handler;
              // console.log("installing handler for "+name);
            }
          }
        }
      },
      disconnect : function(name) {
        if (name && name != 'none' && this.midi) {
          for (var x of this.midi.inputs.values()) {
            if (x.name == name) {
              // console.log("uninstalling handler for "+name);
              x.onmidimessage = null;
            }
          }
        }
      },
    };
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then( self.onMIDISuccess, self.onMIDIFailure );
    } else {
      console.log("no navigator.requestMIDIAccess found");
    }
    return self;
  };

  // translate keyup/keydown into keyed oscillator sidetone
  morse.input = function(context) {
    var self = {
      straight : morse.straight_input(context),
      iambic : morse.iambic_input(context),
      get pitch() { return this.iambic.pitch; },
      set pitch(hertz) {
        this.straight.pitch = hertz;
        this.iambic.pitch = hertz;
      },
      get gain() { return this.iambic.gain; },
      set gain(gain) {
        this.straight.gain = gain;
        this.iambic.gain = gain;
      },
      get rise() { return this.iambic.rise * 1000; },
      set rise(ms) {
        this.straight.rise = ms / 1000;
        this.iambic.rise = ms / 1000;
      },
      get fall() { return this.iambic.fall * 1000; },
      set fall(ms) {
        this.straight.fall = ms / 1000;
        this.iambic.fall = ms / 1000;
      },
      get wpm() { return this.iambic.wpm; },
      set wpm(wpm) { this.iambic.wpm = wpm; },
      get dah() { return this.iambic.dah; },
      set dah(dah) { this.iambic.dah = (dah); },
      get ies() { return this.iambic.ies; },
      set ies(ies) { this.iambic.ies = (ies); },
      get ils() { return this.iambic.ils; },
      set ils(ils) { this.iambic.ils = (ils); },
      get iws() { return this.iambic.iws; },
      set iws(iws) { this.iambic.iws = (iws); },
      get swapped() { return this.iambic.swapped; },
      set swapped(swapped) { this.iambic.swapped = (swapped); },
      connect : function(target) {
        this.straight.connect(target);
        this.iambic.connect(target);
      },
      onblur : function() { },
      onfocus : function() { },
      _type : null,
      get type() { return this._type; },
      set type(type) {
        this.onblur();
        this._type = type;
        this.onfocus=this[type].onfocus;
        this.onblur=this[type].onblur;
        this.onmidievent=this[type].onmidievent;
        this.keydown=this[type].keydown;
        this.keyup=this[type].keyup;
        this.midi = this.midi;
        this.onfocus();
      },
      midi_input : morse.midi_input(),
      _midi : null,
      get midi() { return this._midi; },
      set midi(midi) {
        this.midi_input.disconnect(this._midi);
        this._midi = midi;
        this.midi_input.connect(midi, this.onmidievent);
      },
      midi_refresh : function() { this.midi_input = morse.midi_input(); },
      midi_names : function() { return this.midi_input.names(); },
    };
    return self;
  };

  // combine inputs and outputs
  morse.station = function(params) {
    var context = window.AudioContext ? new window.AudioContext() : new window.webkitAudioContext();

    var self = {
      context : context,

      output : morse.output(context),
      output_decoder : morse.decode(context),

      input : morse.input(context),
      input_decoder : morse.decode(context),

      // parameters
      defaults : {
        input_pitch : 600, input_gain : -26,
        input_wpm : 15, input_rise : 4, input_fall : 4,
        input_dah : 3, input_ies : 1, input_ils : 3, input_iws : 7,
        input_midi : 'none', input_swapped : false, input_type : 'iambic',
        output_pitch : 550, output_gain : -26,
        output_wpm : 15, output_rise : 4, output_fall : 4,
        output_dah : 3, output_ies : 1, output_ils : 3, output_iws : 7,
        output_midi : 'none'
      },
      get_params : function() {
        var params = {};
        for (var name in this.defaults) {
          params[name] = this[name];
        }
        return params;
      },
      set_params : function(params) {
        for (var name in params)
          this[name] = params[name];
      },
      set_defaults : function() { this.set_params(this.defaults); },

      // direct getters and setters on properties
      get input_pitch() { return this.input.pitch; },
      set input_pitch(v) { this.input.pitch = v; },
      get input_gain() { return this.input.gain; },
      set input_gain(v) { this.input.gain = v; },
      get input_rise() { return this.input.rise; },
      set input_rise(v) { this.input.rise = v; },
      get input_fall() { return this.input.fall; },
      set input_fall(v) { this.input.fall = v; },
      get input_wpm() { return this.input.wpm; },
      set input_wpm(v) { this.input.wpm = v; },
      get input_dah() { return this.input.dah; },
      set input_dah(v) { this.input.dah = v; },
      get input_ies() { return this.input.ies; },
      set input_ies(v) { this.input.ies = v; },
      get input_ils() { return this.input.ils; },
      set input_ils(v) { this.input.ils = v; },
      get input_iws() { return this.input.iws; },
      set input_iws(v) { this.input.iws = v; },
      get input_midi() { return this.input.midi; },
      set input_midi(v) { this.input.midi = v; },
      get input_swapped() { return this.input.swapped; },
      set input_swapped(v) { this.input.swapped = v; },
      get input_type() { return this.input.type; },
      set input_type(v) { this.input.type = v; },

      get output_pitch() { return this.output.pitch; },
      set output_pitch(v) { this.output.pitch = v; },
      get output_gain() { return this.output.gain; },
      set output_gain(v) { this.output.gain = v; },
      get output_wpm() { return this.output.wpm; },
      set output_wpm(v) { this.output.wpm = v; },
      get output_rise() { return this.output.rise; },
      set output_rise(v) { this.output.rise = v; },
      get output_fall() { return this.output.fall; },
      set output_fall(v) { this.output.fall = v; },
      get output_dah() { return this.output.dah; },
      set output_dah(v) { this.output.dah = v; },
      get output_ies() { return this.output.ies; },
      set output_ies(v) { this.output.ies = v; },
      get output_ils() { return this.output.ils; },
      set output_ils(v) { this.output.ils = v; },
      get output_iws() { return this.output.iws; },
      set output_iws(v) { this.output.iws = v; },
      get output_midi() { return this.output.midi; },
      set output_midi(v) { this.output.midi = v; },

      // unconverted property getters and setters
      // changed to make these the natural units
      get input_gain_dB() { return this.input_gain; },
      set input_gain_dB(v) { this.input_gain = v; },
      get input_rise_ms() { return this.input_rise; },
      set input_rise_ms(v) { this.input_rise = v; },
      get input_fall_ms() { return this.input_fall; },
      set input_fall_ms(v) { this.input_fall = v; },

      get output_gain_dB() { return this.output_gain; },
      set output_gain_dB(v) { this.output_gain = v; },
      get output_rise_ms() { return this.output_rise; },
      set output_rise_ms(v) { this.output_rise = v; },
      get output_fall_ms() { return  this.output_fall; },
      set output_fall_ms(v) { this.output_fall = v; },

      // useful actions
      output_midi_refresh : function() { this.output.midi_refresh(); },
      output_midi_names : function() { this.output.midi_names(); },
      output_send : function(text) { this.output.send(text); },
      output_cancel : function() { this.output.keyOff(); },
      output_decoder_on_letter : function(callback, context) { this.output_decoder.on('letter', callback, context); },
      output_decoder_off_letter : function(callback, context) { this.output_decoder.off('letter', callback, context); },

      input_midi_refresh : function() { this.input.midi_refresh(); },
      input_midi_names : function() { this.input.midi_names(); },
      input_decoder_on_letter : function(callback, context) { this.input_decoder.on('letter', callback, context); },
      input_decoder_off_letter : function(callback, context) { this.input_decoder.off('letter', callback, context); },
      input_keydown : function(isleft) { this.input.keydown(isleft); },
      input_keyup : function(isleft) { this.input.keyup(isleft); },
      input_focus : function() { this.input.onfocus(); },
      input_blur : function() { this.input.onblur(); },
    };

    var USE_DETONER = false;

    if (USE_DETONER) {
      self.output.on('change:pitch', function(pitch) { self.output_decoder.onchangepitch(pitch); });
      self.output_decoder.onchangepitch(self.output.pitch);
      self.output.connect(self.output_decoder.target);
      self.output_decoder.connect(context.destination);
    } else {
      self.output.connect(context.destination);
      self.output.on('transition', self.output_decoder.ontransition, self.output_decoder);
    }

    if (USE_DETONER) {
      self.input.straight.on('change:pitch', function(pitch) { self.input_decoder.onchangepitch(pitch); });
      self.input.iambic.on('change:pitch', function(pitch) { self.input_decoder.onchangepitch(pitch); });
      self.input_decoder.onchangepitch(self.input.pitch);
      self.input.connect(self.input_decoder.target);
      self.input_decoder.connect(context.destination);
    } else {
      self.input.connect(context.destination);
      self.input.straight.on('transition', self.input_decoder.ontransition, self.input_decoder);
      self.input.iambic.on('transition', self.input_decoder.ontransition, self.input_decoder);
    }

    self.table = self.output.table;
    self.output_decoder.table = self.table;
    self.input_decoder.table = self.table;

    if (params)
      self.set_params(params);
    else
      self.set_defaults();

    return self;
  };

  // Export the morse object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add 'morse'` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = morse;
    }
    exports = morse;
  } else {
    root.morse = morse;
  }
  // AMD registration happens at the end
  if (typeof define === 'function' && define.amd) {
    define('morse', [], function() {
      return morse;
    });
  }

}.call(this));
/* Local Variables: */
/* mode: javascript */
/* js-indent-level: 2 */
/* indent-tabs-mode: nil */
/* End: */
