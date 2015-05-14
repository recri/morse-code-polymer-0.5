/* -*- mode: javascript; indent-tabs-mode: nil; -*- */
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

/*
** the source and license for this package may be found at github/recri/morse-code
** see README.org at that repo for documentation.
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
    function pick(list) {
        return list[Math.floor(Math.random()*list.length)];
    }
    function shuffle(list) {
        for (var n = list.length; n > 1; n -= 1) {
            var i = Math.floor(Math.random()*n);
            if (i != n-1) {
                var t = list[i]; list[i] = list[n-1]; list[n-1] = t;
            }
        }
        return list;
    }
    function repeat(n, list) {
        var result = [];
        for(var i = 0; i < n; i += 1)
            result = result.concat(list);
        return result;
    }
    function progress_bar(id, val, max) {
        var p = document.getElementById(id);
        p.max = max;
        p.value = val;
        p.innerText = ""+val+"/"+max;
    }
    var ITEMS_PER_SESSION = 5, REPS_PER_ITEM = 5;

    var self = {
        word_list : word_list,      // the word list we are studying
        station : station,      // the tester we use to examine the student
        table : station.output.table,
        items_per_session : ITEMS_PER_SESSION,
        reps_per_item : REPS_PER_ITEM,
        words : {},             // the dictionary of words studied
        // number of times seen, recording percent correct,
        current : "",           // current word
        session : {             // current session, like words but for this session
            reps_to_do : ITEMS_PER_SESSION*REPS_PER_ITEM,
            reps_done : 0,
            score : 0,
            words : ["e", "t", "i", "ee", "a", "n", "s"],
            tests : []
        },

        input_text : "",
        output_text : "",
        input_code : "",
        output_code : "",

        test_output_time : 0,

        onoutputletter : function(ltr, code) {
            // console.log("onoutputletter("+ltr+", "+code+")");
            self.output_text += ltr;
            self.output_code += code;
        },
        oninputletter : function(ltr, code) {
            self.input_text += ltr;
            self.input_code += code;
            // console.log("oninputletter "+self.input_text+" vs "+self.current);
            if (self.input_text.trim().endsWith(self.current)) {
                self.test_next();
            }
        },
        test_word : function() {
            // test a word
            self.input_text = "";
            self.input_code = "";
            self.output_text = "";
            self.output_code = "";
            self.station.output.send(self.current);
            self.test_output_time = Date.now(); // time in milliseconds since epoch
        },
        test_again : function() {
            // test a word again, ie send it once more
            self.output_text = "";
            self.output_code = "";
            self.station.output.send(self.current);
        },
        test_score : function() {
            self.session.reps_done += 1;
            // length of code to be sent, with word space appended
            var test_output_length = self.table.ditLength(self.current+' ')*self.msPerDit;
            var test_input_length = Math.max(Date.now() - (self.test_output_time+test_output_length), test_output_length);
            var timescore = test_input_length/test_output_length;
            var input = self.input_text.trim();
            var lenscore = self.table.ditLength(input)/self.table.ditLength(self.current);
            var score = timescore * lenscore;
            self.session.score += score;
            self.session.tests.push([self.current, score]);
            document.getElementById("scores").innerHTML += "'"+self.current+"' = "+score.toFixed(2)+"("+(self.session.score/self.session.reps_done).toFixed(2)+"), ";
        },
        test_next : function() {
            // console.log("test_next");
            self.test_score();
            if (self.session.reps_done == self.session.reps_to_do) {
                self.session_progress();
                self.session_score()
            } else {
                self.session_continue();
            }
        },
        //
        session_progress : function() {
            progress_bar('session_progress', self.session.reps_done, self.session.reps_to_do);
        },
        session_continue : function() {
            // console.log("continue");
            self.session_progress();
            self.current = self.session.words[self.session.reps_done];
            self.test_word();
        },
        session_score : function() {
            var n = self.session.tests.length;
            for (var i = 0; i < n; i += 1) {
                var t = self.session.tests[i]
                self.progress_score_word(t[0], t[1]);
            }
            self.progress_progress();
            document.getElementById("scores").innerHTML += "<br>session completed with overall score: "+(self.session.score/self.session.reps_done).toFixed(2);
        },
        session_start : function() {
            // console.log("start");
            var next = self.word_list.next(self.items_per_session);
            self.session = {
                reps_to_do : self.items_per_session * self.reps_per_item,
                reps_done : 0,
                score : 0,
                words : shuffle(repeat(self.reps_per_item, next)),
                tests : []
            };
            document.getElementById("scores").innerHTML = "<strong>start new session</strong><br>"+next+"<br>";
            self.session_continue();
        },
        worst : function(n) {
            var worst = Object.keys(self.words).sort(function(a,b) {
                a = self.words[a];
                b = self.words[b]
                return (b.score-a.score) || (a.n-b.n);
            });
            // for (var i = 0; i < worst.length; i += 1) console.log(worst[i], self.words[worst[i]]);
            return worst.slice(0,self.items_per_session);
        },
        session_review : function() {
            var worst = self.worst(self.items_per_session);
            self.session =  {
                reps_to_do : self.items_per_session * self.reps_per_item,
                reps_done : 0,
                score : 0,
                words : shuffle(repeat(self.reps_per_item, worst)),
                tests : []
            };
            document.getElementById("scores").innerHTML = "<strong>start review session</strong><br>"+worst+"<br>";
            self.session_continue();
        },
        session_restart : function() {
            // console.log("restart");
            if (self.session && self.session.current) {
                self.session.reps_done = 0;
                self.session.tests = [];
                self.session_continue();
            } else {
                self.session_start();
            }
        },
        //
        progress_progress : function() {
            progress_bar('training_progress', self.word_list.next_i, self.word_list.length);
        },
        progress_score_word : function(word, score) {
            var w = self.words[word];
            if ( ! w ) {
                w = { n : 1, score : score }
            } else {
                w.n += 1;
                w.score = (w.score + score) / 2;
            }
            self.words[word] = w;
        },
        progress_save : function() {
            var save = {
                items_per_session : self.items_per_session,
                reps_per_item : self.reps_per_item,
                word_list_name : self.word_list.name,
                word_list_next_i : self.word_list.next_i,
                table_name : self.table.name,
                station_params : self.station.get_params(),
                words : self.words
            };
            localStorage.setItem(save.word_list_name, JSON.stringify(save));
            // console.log('progress_save('+save.word_list_name+', '+localStorage[save.word_list_name]);
        },
        progress_delete : function() {
            localStorage.removeItem(self.word_list.name);
        },
        //
        setSpeed : function(wpm) {
            self.station.output.wpm = (wpm);
            self.station.input.wpm = (wpm);
            self.msPerDit = 1/(wpm * 50 * (1/60) * (1/1000)); // 1 / (words/minute * dits/word * minutes/second * second/millisecond)
            document.getElementById('speed').innerText = ""+wpm;
        },
        getSpeed : function() { return self.station.output.wpm },
        faster : function() { self.setSpeed(self.getSpeed()+2.5); },
        slower : function() { self.setSpeed(self.getSpeed()-2.5); },
        swappaddles : function(swapped) { self.station.swapped = swapped; },
        setItemsPerSession : function(n) { self.items_per_session = n; },
        setRepsPerItem : function(n) { self.reps_per_item = n; },
        //
        onagain : function() { self.test_again(); },
        onnext : function() { self.test_next(); },
        onstart : function() { self.session_start(); },
        onreview : function() { self.session_review(); },
        onsave : function() { self.progress_save(); },
        ondelete : function() { self.progress_delete(); },

        onslower : function() { self.slower(); },
        onfaster : function() { self.faster(); },
        onswappaddles : function(name) { self.swappaddles(document.getElementsByName(name)[0].checked); },
    };

    self.station.input_decoder.on('letter', function(ltr, code) { self.oninputletter(ltr, code); });
    self.station.output_decoder.on('letter', function(ltr, code) { self.onoutputletter(ltr, code); });
    self.setSpeed(self.getSpeed());
    return self;
}

function study_progress_restore(name) {
    // console.log('study_progress_restore('+name+', '+localStorage[name]+')');
    var save = JSON.parse(localStorage.getItem(name));
    var table = morse.table(save.table_name);
    var word_list = word_list_by_name(save.word_list_name, table, save.word_list_next_i);
    var station = morse.station(save.station_params);
    var progress = study_progress(word_list, station);
    progress.items_per_session = save.items_per_session;
    progress.reps_per_item = save.reps_per_item;
    progress.words = save.words;
    return progress;
}
