'use strict';

var Alexa = require('alexa-sdk');

const QUESTIONS = ['Welcome, how are you feeling?',
    'Do you tend to be skeptical or tend to believe?',
    'Are you bored by time alone or need time alone?',
    'Do you accept things as they are? ',
     'Are your energetic or mellow?',
    //  'Are you chaotic or organized?',
    //  'Do you work best in groups or alone?',
    //  'Do you plan far ahead or plan last minute?',
    //  'Are you focused on the present or the future?',
    //  'Do you talk more or listen more?',
    //  'Do you tell people what happened or what it meant?',
    //  'Do you get work done right away or procrastinate?',
    //  'Do you follow your heart or your head?',
    //  'Do you stay at home or go out?',
    //  'Do you want the big picture or the details?',
    //  'Do you improvise or prepare?',
    //  'Do you find it difficult to yell loudly?',
    //  'Do you work hard or play hard?',
    //  'Are you comfortable with emotions?',
    //  'Do you like public speaking?'
    ];

const QUESTIONS_LENGTH = QUESTIONS.length;

const GAME_STATES = {
    START: "_STARTMODE", //Start asking questions.
    QUESTION: "_QUESTIONMODE", // Asking questions.
    END: "_ENDMODE", //Asking for email and closing out.
    // START: "_STARTMODE", // Entry point, start the game.
    // HELP: "_HELPMODE", // The user is asking for help.
};

const newSessionHandlers = {
    "LaunchRequest": function () {
        this.attributes.storage = {
            'personalityType' : null,
            'email': ""
        }
        if (this.attributes.storage.personalityType === null) {
            this.handler.state = GAME_STATES.QUESTION;
            this.attributes['questionNum'] = 0;
            this.attributes['responses'] = "";
            this.response.speak(QUESTIONS[this.attributes['questionNum']]).listen(QUESTIONS[this.attributes['questionNum']]);
            this.attributes['questionNum']++;
        } else {
            this.handler.state = GAME_STATES.END;
        }
        this.emit(":responseReady")
    },
    'AMAZON.StopIntent': function() {
           this.response.speak('Ok, bye!');
           this.emit(':responseReady');
     },
     // Cancel
     'AMAZON.CancelIntent': function() {
         this.response.speak('Ok, bye!');
         this.emit(':responseReady');
     },
};

const questionStateHandlers = Alexa.CreateStateHandler(GAME_STATES.QUESTION, {
    "AnswerIntent": function () {
        var response = this.event.request.intent.slots.answer.value;
        this.attributes['responses'] = this.attributes['responses'].concat("" + response);
        var questionNum = this.attributes['questionNum'];
        if (questionNum < QUESTIONS_LENGTH) {
            this.response.speak(QUESTIONS[questionNum]).listen(QUESTIONS[questionNum]);
            this.attributes['questionNum']++;
        } else {
            this.attributes.storage.personalityType = "introvert"
            this.response.speak("You are a" + this.attributes.storage.personalityType + "and your response was" + this.attributes['responses']).listen("Thanks!");
            this.handler.state = GAME_STATES.END
        }
        this.emit(":responseReady")
    },
    'AMAZON.StopIntent': function() {
           this.response.speak('Ok, bye!');
           this.emit(':responseReady');
     },
     // Cancel
     'AMAZON.CancelIntent': function() {
         this.response.speak('Ok, bye!');
         this.emit(':responseReady');
     },
});

const connectStateHandlers = Alexa.CreateStateHandler(GAME_STATES.END, {
    "AnswerIntent": function() {
        this.handler.state = GAME_STATES.END;
        this.response.speak("Would you like to give your email so others of your same personality type can contact you?")
        .listen("Would you like to give your email so others of your same personality type can contact you?")
        var emaily = this.event.request.intent.slots.answer.value;
        this.attributes.storage.email = emaily;
    },
    
     // Save state
   'SessionEndedRequest': function() {
       console.log('session ended!');
       this.emit(':saveState', true);
     }
});
    

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'user';
    alexa.registerHandlers(newSessionHandlers, questionStateHandlers, connectStateHandlers);
    alexa.execute();
};
