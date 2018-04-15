"use strict";

const Alexa = require("alexa-sdk");

const opt = ['scissors', 'rock', 'paper'];

const handlers = {
    "LaunchRequest": function () {
        if (Object.keys(this.attributes).length === 0) {
          this.attributes.storage = {
            'lastMove': '',
            'moves': {
              'rock': {
                'usage': 0,
                'wins': 0
              },
              'paper': {
                'usage': 0,
                'wins': 0
              },
              'scissors': {
                'usage': 0,
                'wins': 0
              }
            }
          };
       this.response.speak("Welcome to rps! Rock, paper, or scissors?")
                     .listen("I said, rock, paper, or scissors.");
        } else {
          var last = this.attributes.storage.lastMove;
          var usage = this.attributes.storage.moves[last].usage;
          var wins = this.attributes.storage.moves[last].wins;
          this.response.speak("Welcome back to rps! You played " + last + " last and have used it a total of " + usage +
          " times" + " and have won " + wins + " games with " + last + ". Is it gonna be rock, paper, or scissors?")
          .listen("I said, rock, paper, or scissors.");
        }
        this.emit(":responseReady");
    },
    "MoveIntent": function () {
        var uso = this.event.request.intent.slots.choice.value;
        
        var resp = opt[Math.floor(Math.random() * opt.length)];
        var outcome = "";
        if (opt.indexOf(uso) === -1) {
            outcome = "you chose some weird thing";
        } else {
            this.attributes.storage.lastMove = uso;
            if (resp === uso) {
                outcome = 'it\'s a tie';
                this.attributes.storage.moves[uso].usage++;
            } else if (opt.indexOf(resp) > opt.indexOf(uso)) {
              if (opt.indexOf(uso) === 0 && opt.indexOf(resp) === 2) {
                outcome = 'you win';
                this.attributes.storage.moves[uso].usage++;
                this.attributes.storage.moves[uso].wins++;
              }  else {
                outcome = 'you lose';
                this.attributes.storage.moves[uso].usage++;
              }
            } else {
              if (opt.indexOf(resp) === 0 && opt.indexOf(uso) === 2) {
                  outcome = 'you lose';
                  this.attributes.storage.moves[uso].usage++;
              } else { 
                outcome = 'you win';
                this.attributes.storage.moves[uso].wins++;
                this.attributes.storage.moves[uso].usage++;
              }
            }
        }
        this.response.speak("I chose " + resp + ", " + outcome + ". Let's play again! Choose rock, paper, or scissors or say stop or cancel to quit.")
        .listen("Rock, paper, or scissors?");
        this.emit(":responseReady");
    },
     // Save state
   'SessionEndedRequest': function() {
       console.log('session ended!');
       this.emit(':saveState', true);
     }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'points';
    alexa.registerHandlers(handlers);
    alexa.execute();
};