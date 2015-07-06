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

  var self = {
    word_list: word_list,       // the word list we are studying
    station: station,           // the tester we use to examine the student
    table: station.output.table,
    words: {},                  // the dictionary of words studied
    // number of times seen, recording percent correct, first time, last time
    time: 0.0,                  // cumulative time spent in study
    // proportion complete of course
    progress: function() {
      return 100 * self.word_list.next_i / self.word_list.length;
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
      self.station.set_params(save.station_params);
      self.words = save.words;
      self.check_words();
      return self;
    },
    delete: function(name) {
      localStorage.removeItem(name);
    },

    check_words : function() {
      if (self.word_list && self.table && self.words) {
        // console.log("check_words");
        // console.log("self.word_list", self.word_list);
        // console.log("self.table", self.table);
        // console.log("self.words", self.words);
        var dup = word_list_by_name(self.word_list.name, self.table, 0);
        var count = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        var total = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        while (dup.next_i < self.word_list.next_i) {
          var word = dup.next(1)[0];
          if ( ! self.words[word]) {
            console.log("missing", word);
            self.score_word(word, 1.0);
          }
          count[word.length] += 1;
          total[word.length] += 1;
        }
        while (dup.any_more()) {
          word = dup.next(1)[0];
          total[word.length] += 1;
        }
      }
      // console.log("count", count);
      // console.log("total", total);
    },
      
    
  };
  return self;
}

function study_session(mimic, progress, type, items_per_session, reps_per_item) {
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
      this.output_text += ltr;
      this.output_code += code;
    },
    oninputletter: function(ltr, code) {
      this.input_text += ltr;
      this.input_code += code;
      // console.log("oninputletter "+self.input_text+" vs "+self.current);
      if (this.input_text.trim().endsWith(this.current)) {
        this.test_next();
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
      self.log("'" + self.current + "' = " + score.toFixed(2)+", ");
    },

    test_next: function() {
      // console.log("test_next");
      self.test_score();
      if (self.reps_done == self.reps_to_do) {
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
      mimic.next_word(self.current);
    },
    session_score: function() {
      var n = self.tests.length;
      for (var i = 0; i < n; i += 1) {
        var t = self.tests[i];
        progress.score_word(t[0], t[1]);
      }
      progress.progress();
      self.score = (self.score / self.reps_done).toFixed(2);
      self.log(" score: " + self.score);
    },

    // worst in score is one thing, worst in times reviewed is another
    worst: function(n) {
      var worst = Object.keys(progress.words).sort(function(a, b) {
        a = progress.words[a];
        b = progress.words[b];
        return (a.n - b.n) || (b.score - a.score) || (Math.random-0.5);
      });
      // for (var i = 0; i < worst.length; i += 1) console.log(worst[i], progress.words[worst[i]]);
      return worst.slice(0, items_per_session);
    },

    session_new_words: function(type) {
      return (type === 'review') ? self.worst(items_per_session) : next_words(items_per_session);
    },

    session_new: function() {
      self.type = type;
      self.dict = self.session_new_words(type).sort();
      // console.log('session_new', 'words', self.dict.length, self.dict);
      self.reps_to_do = items_per_session * reps_per_item;
      self.reps_done = 0;
      self.score = 0;
      self.words = repeat(reps_per_item, self.dict);
      // console.log('session_new', 'self.words', self.words.length, self.words);
      self.words = shuffle(self.words);
      // console.log('session_new', 'self.words', self.words.length, self.words);
      self.tests = [];
      self.log("start " + type + " session [" + self.dict + "]");
      //self.session_continue();
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
