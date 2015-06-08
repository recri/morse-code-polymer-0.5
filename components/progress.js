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

//
// make the object for maintaining progress
//
//  sessions/lesson either
//  1) Present a collection of new words for study
//      chosen in order of increasing difficulty
//  2) Present a collections of old words for review
//      chosen according to how well they are known
//  3) Present a mixter of new words and old words
//
//  in all cases, the words are presented in random order
//  and the student needs to echo the word back correctly
//  to progress to the next word in the session, or press
//  the [next] button.  The length of the answers to a
//  given prompt divided by the correct answer (in dits)
//  gives a score which is greater than or equal to 1 if
//  the correct answer is given.  If the next button is
//  pressed, then a penalty score needs to be awarded.
//
//  when the student is getting everything right then the
//  score can be weighted by the time taken to give the
//  answer divided by the time taken to present the original
//  prompt.
//

function study_progress(word_list, station) {
  function progress_bar(id, val, max) {
    var p = document.getElementById(id);
    p.max = max;
    p.value = val;
    p.innerText = "" + val + "/" + max;
  }

  var ITEMS_PER_SESSION = 5,
      REPS_PER_ITEM = 5;

  var self = {
    word_list: word_list, // the word list we are studying
    station: station, // the tester we use to examine the student
    table: station.output.table,
    items_per_session: ITEMS_PER_SESSION,
    reps_per_item: REPS_PER_ITEM,
    words: {}, // the dictionary of words studied
    // number of times seen, recording percent correct,

    // proportion complete of course
    progress: function() {
      return self.word_list.next_i / self.word_list.length;
    },

    score_word: function(word, score) {
      var w = self.words[word];
      if (!w) {
        w = {
          n: 1,
          score: score
        };
      } else {
        w.n += 1;
        w.score = (w.score + score) / 2;
      }
      self.words[word] = w;
    },

    save: function(name) {
      var save = {
        items_per_session: self.items_per_session,
        reps_per_item: self.reps_per_item,
        word_list_name: self.word_list.name,
        word_list_next_i: self.word_list.next_i,
        table_name: self.table.name,
        station_params: self.station.get_params(),
        words: self.words
      };
      localStorage.setItem(name, JSON.stringify(save));
      // console.log('progress_save('+save.word_list_name+', '+localStorage[save.word_list_name]);
    },

    restore: function(name) {
      var save = JSON.parse(localStorage.getItem(name));
      self.table = morse.table(save.table_name);
      self.word_list = word_list_by_name(save.word_list_name, self.table, save.word_list_next_i);
      self.station = morse.station(save.station_params);
      self.items_per_session = save.items_per_session;
      self.reps_per_item = save.reps_per_item;
      self.words = save.words;
      return self;
    },
    delete: function(name) {
      localStorage.removeItem(name);
    },

  };

  return self;
}

function study_session(progress, type) {
  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(list) {
    for (var n = list.length; n > 1; n -= 1) {
      var i = Math.floor(Math.random() * n);
      if (i != n - 1) {
        var t = list[i];
        list[i] = list[n - 1];
        list[n - 1] = t;
      }
    }
    return list;
  }

  function repeat(n, list) {
    // console.log('repeat', n, list);
    var result = [];
    for (var i = 0; i < n; i += 1)
      result = result.concat(list);
    return result;
  }

  function output_send(text) {
    // console.log('output_send', text);
    progress.station.output_send(text);
  }

  function ditLength(text) {
    return progress.table.ditLength(text);
  }

  function next_words(n) {
    // console.log('next_words', n);
    return progress.word_list.next(n);
  }
  // 1 / (words/minute * dits/word * minutes/second * second/millisecond)
  var msPerDit = 1 / (progress.station.output_wpm * 50 * (1 / 60) * (1 / 1000));
  var self = {
    reps_to_do: 0,
    reps_done: 0,
    score: 0,
    words: [],
    tests: [],

    current: "", // current word
    input_text: "",
    output_text: "",
    input_code: "",
    output_code: "",

    test_output_time: 0,

    logtext: "",

    log: function(text) {
      self.logtext += text;
    },

    onoutputletter: function(ltr, code) {
      // console.log("onoutputletter("+ltr+", "+code+")");
      self.output_text += ltr;
      self.output_code += code;
    },
    oninputletter: function(ltr, code) {
      self.input_text += ltr;
      self.input_code += code;
      // console.log("oninputletter "+self.input_text+" vs "+self.current);
      if (self.input_text.trim().endsWith(self.current)) {
        self.test_next();
      }
    },

    test_word: function() {
      // test a word
      self.input_text = "";
      self.input_code = "";
      self.output_text = "";
      self.output_code = "";
      output_send(self.current);
      self.test_output_time = Date.now(); // time in milliseconds since epoch
    },
    test_again: function() {
      // test a word again, ie send it once more
      self.output_text = "";
      self.output_code = "";
      output_send(self.current);
    },
    test_score: function() {
      self.reps_done += 1;
      // length of code to be sent, with word space appended
      var test_output_length = ditLength(self.current + ' ') * msPerDit;
      var test_input_length = Math.max(Date.now() - (self.test_output_time + test_output_length), test_output_length);
      var timescore = test_input_length / test_output_length;
      var input = self.input_text.trim();
      var lenscore = ditLength(input) / ditLength(self.current);
      var score = timescore * lenscore;
      self.score += score;
      self.tests.push([self.current, score]);
      self.log("'" + self.current + "' = " + score.toFixed(2) + "(" + (self.score / self.reps_done).toFixed(2) + "), ");
    },
    test_next: function() {
      // console.log("test_next");
      self.test_score();
      if (self.reps_done == self.reps_to_do) {
        self.session_progress();
        self.session_score();
      } else {
        self.session_continue();
      }
    },

    session_progress: function() {
      return self.reps_done / self.reps_to_do;
    },
    session_continue: function() {
      // console.log("continue");
      self.session_progress();
      self.current = self.words[self.reps_done];
      // console.log("session_continue", self.reps_done+"/"+self.reps_to_do, self.current);
      self.test_word();
    },
    session_score: function() {
      var n = self.tests.length;
      for (var i = 0; i < n; i += 1) {
        var t = self.tests[i];
        progress.score_word(t[0], t[1]);
      }
      progress.progress();
      self.log("<br>session completed with overall score: " + (self.score / self.reps_done).toFixed(2));
    },

    worst: function(n) {
      var worst = Object.keys(self.words).sort(function(a, b) {
        a = self.words[a];
        b = self.words[b];
        return (b.score - a.score) || (a.n - b.n);
      });
      // for (var i = 0; i < worst.length; i += 1) console.log(worst[i], self.words[worst[i]]);
      return worst.slice(0, self.items_per_session);
    },

    session_new_words: function(type) {
      return (type === 'review') ? self.worst(progress.items_per_session) : next_words(progress.items_per_session);
    },

    session_new: function() {
      var words = self.session_new_words(type);
      // console.log('session_new', 'words', words.length, words);
      self.reps_to_do = progress.items_per_session * progress.reps_per_item;
      self.reps_done = 0;
      self.score = 0;
      self.words = repeat(progress.reps_per_item, words);
      // console.log('session_new', 'self.words', self.words.length, self.words);
      self.words = shuffle(self.words);
      // console.log('session_new', 'self.words', self.words.length, self.words);
      self.tests = [];
      progress.station.input_decoder_on_letter(function(ltr, code) { self.oninputletter(ltr, code); });
      progress.station.output_decoder_on_letter(function(ltr, code) { self.onoutputletter(ltr, code); });
      self.log("<strong>start " + type + " session</strong><br>" + words + "<br>");
      self.session_continue();
      return self;
    }
  };
  return self.session_new();
}
/* Local Variables: */
/* mode: javascript */
/* js-indent-level: 2 */
/* indent-tabs-mode: nil */
/* End: */
