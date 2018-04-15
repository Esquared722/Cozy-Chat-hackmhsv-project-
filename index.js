'use strict';

const Alexa = require('alexa-sdk');
const request = require('sync-request');

const QUESTIONS = ['Welcome, how are you feeling?',
    'Do you tend to be skeptical or tend to believe?',
    'Are you bored by time alone or need time alone?',
    // 'Do you accept things as they are? ',
    //  'Are your energetic or mellow?',
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
    //  'Do you like public speaking?',
];


const QUESTIONS_LENGTH = QUESTIONS.length;

const GAME_STATES = {
    QUESTION: "_QUESTIONMODE", // Asking questions.
    END: "_ENDMODE", //Asking for email and closing out.
    CONNECT: "_CONNECTMODE",
};

const RESPONSES = {
    neutral : "",
    positive : "I'm glad to hear that. ",
    negative : "Sorry to hear that. "
}

const newSessionHandlers = {
    "LaunchRequest": function() {
        if (Object.keys(this.attributes).length === 0) {
            this.attributes.storage = {
                'personalityType': null,
                'email': "null"
            }
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
    }
};

const questionStateHandlers = Alexa.CreateStateHandler(GAME_STATES.QUESTION, {
    "AnswerIntent": function() {

        var response = this.event.request.intent.slots.answer.value;
        this.attributes['responses'] = this.attributes['responses'].concat(" " + response);
        
        var myJSONObject = {
            'api_key': "c8035c455b999a23470f20f6c76d58f7",
            'data': response
        };
        var res = request('POST', 'https://apiv2.indico.io/sentimenthq', {
            json: myJSONObject
        });
        var data = JSON.parse(res.getBody('utf8')).results;

        var sentimentfulResponse =  RESPONSES.neutral;
        if (data < 0.5) {
            sentimentfulResponse = RESPONSES.negative;
        } else if (data > 0.95) {
            sentimentfulResponse = RESPONSES.positive;
        }

        var questionNum = this.attributes['questionNum'];
        if (questionNum < QUESTIONS_LENGTH) {
            this.response.speak(sentimentfulResponse + QUESTIONS[questionNum]).listen(QUESTIONS[questionNum]);
            this.attributes['questionNum']++;
            this.emit(":responseReady");
        } else {
            var myJSONObject = {
                'api_key': "c8035c455b999a23470f20f6c76d58f7",
                'data': this.attributes['responses'],
                'persona': true,
                'threshold': 0.0
            };
            var res = request('POST', 'https://apiv2.indico.io/personality', {
                json: myJSONObject
            });
            var data = JSON.parse(res.getBody('utf8'));
            data = data.results;
            console.log(data);
            var maxNum = -1;
            var maxType = null;
            for (var key in data) {
                if (data[key] > maxNum) {
                    maxNum = data[key];
                    maxType = key;
                }
            }
            this.attributes.storage.personalityType = maxType;
            this.response.speak("Congrats you are a " +
                maxType + ". Would you like to save your email to connect with other " + this.attributes.storage.personalityType + "s?").listen("Would you like to save your email?");
            this.handler.state = GAME_STATES.END;
            this.emit(":responseReady");
        }
    },

});

const emailStateHandlers = Alexa.CreateStateHandler(GAME_STATES.END, {
    "LaunchRequest": function() {
        var personalityType = this.attributes.storage.personalityType;
        if (this.attributes.storage.email === "null") {
            this.response.speakthis.response.speak("Would you like to save your email to connect with other " + personalityType + "s?")
                    .listen("Would you like to save your email to connect with other " + personalityType + "s?");
            this.emit(":responseReady");
        } else {
            this.response.speak("Would you like to connect with other " + personalityType + "s?").listen("Would you like to connect with other " + personalityType + "s?");
            this.handler.state = GAME_STATES.CONNECT;
            this.emit(":responseReady");
        }
    },
    "AnswerIntent": function() {
        var emaily = this.event.request.intent.slots.answer.value;
        this.attributes.storage.email = emaily;
        var personalityType = this.attributes.storage.personalityType;
        this.response.speak("Would you like to connect with other " + personalityType + "s?").listen("Would you like to connect with other " + personalityType + "s?");
        this.handler.state = GAME_STATES.CONNECT;
        this.emit(':responseReady')
    },
    "AMAZON.YesIntent": function() {
        this.response.speak("What is your email?").listen("What is your email?");
        this.emit(":responseReady")
    },
    "AMAZON.NoIntent": function() {
        this.response.speak("Okay.");
        this.emit(':responseReady')
    },
    'AMAZON.StopIntent': function() {
        this.response.speak('Ok, hope we will chat again soon.');
        this.emit(':responseReady');
    },
    // Cancel
    'AMAZON.CancelIntent': function() {
        this.response.speak('Ok, hope we will chat again soon.');
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
        console.log('session ended!');
        this.emit(':saveState', true);
    }
});

const connectStateHandlers = Alexa.CreateStateHandler(GAME_STATES.CONNECT, {
    "LaunchRequest": function() {
        var personalityType = this.attributes.storage.personalityType;
        this.response.speak("Would you like to connect with other " + personalityType + "s?").listen("Would you like to connect with other " + personalityType + "s?");
        this.emit(":responseReady")
    },
    "AMAZON.YesIntent": function() {
        this.response.speak("Here is a friend!");
        this.emit(":responseReady")
    },
    "AMAZON.NoIntent": function() {
        this.response.speak("Okay.");
        this.emit(':responseReady')
    },
    'AMAZON.StopIntent': function() {
        this.response.speak('Ok, hope we will chat again soon.');
        this.emit(':responseReady');
    },
    // Cancel
    'AMAZON.CancelIntent': function() {
        this.response.speak('Ok, let\'s play again soon.');
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
        console.log('session ended!');
        this.emit(':saveState', true);
    }
});


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'user';
    alexa.registerHandlers(newSessionHandlers, questionStateHandlers, emailStateHandlers, connectStateHandlers);
    alexa.execute();
};