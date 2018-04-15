'use strict';

const Alexa = require('alexa-sdk');
const request = require('sync-request');

const QUESTIONS = ['Welcome, how are you feeling?',
    'Tell me about your experiences working in groups.',
    'Tell me about the way you organize your life.',
    'Tell me about how you make a tough decision.',
    'Tell me about how your experiences with public speaking.',
    'Tell me about your energy level throughout the day.'
    //  'Do you tend to be skeptical or tend to believe?',
    //  'Are you bored by time alone or need time alone?',
    //  'Do you accept things as they are? ',
    //  'Are your usually energetic or mellow?',
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

const STRONG_AND_WEAK = {
    'architect' : {
        'Strength' :
            'You are imaginative and strategic. You have a deep curiosity for intellectual challenge. ' + 
            'You have high self-confidence. You trust your logical thinking process. ' + 
            'You are decisive. ' + 
            'You are determined. ',
        'Weakness' :
            'If you are too confident, you will close yourself off to opinion of others. ' +
            'You are judgmental and may jump to conclusions too quickly. ' +
            'You are overly analytical, which may extend to obsessive analyzing.'
    }, 

    'logician' : {
        'Strength' :
            'You are analytical and excel at connecting dots. ' +
            'You are imaginative. ' +
            'You are straightforward and believe truth is important. ',
        'Weakness' :
            'You are shy in social situations. ' + 
            'You are insensitive because you rely on logic too much. ' + 
            'You can be absent-minded when thinking about your ideas.'
    },

    'commander' : {
        'Strength' :
            'You are efficient and goal oriented. ' +
            'You are energetic and enjoy striving towards goals. ' +
            'You are determined and do not give up easily. ',

        'Weakness' :
            'You can be too confident and stubborn. ' +
            'You can be intolerant of ideas that do not align with your goal.'
    },


    'debater' : {
        'Strength' :
            'You are dedicated to learning. ' +
            'You are a quick thinker who can come up with arguments on the spot. ',
    
        'Weakness' :
            'You can be overly argumentative and disrespect others’ believes. ' +
            'You can be too insensitive of people around you.'
    },

    'advocate' : {
        'Strength' :
            'You have a vivid imagination. ' +
            'You have a strong sense of passion. ' +
            'You appeal to human senses and inspire others. ',
            
        'Weakness' :
            'You can be sensitive when people criticize you. ' + 
            'You can be extremely private and appear hard to approach. ' +
            'You are perfectionistic and pursue ideals.' 
    },



    ' mediator' : {
        'Strength' :
            'You are idealistic and optimistic. ' +
            'You care for others and seek harmony. ',

        'Weakness' :
            'Idealistic can hurt when you are setting yourself up for disappointment again and again. ' +
            'You can be too altruistic and neglect to care for yourself.'
        
    },

    'protagonist' : {
        'Strength' :
            'You are charismatic and charming. ' +
            'You are natural leaders with strong positive vision. ',
        
        'Weakness' :
            'You can struggle to make tough decisions. ' +
            'You can be too selfless when you strive wholeheartedly to improve the world.'
    },



    'campaigner' : {
        'Strength' :
            'You are curious and outgoing. ' +
            'You are observant and never miss out on details. ',

        'Weakness' :
            'You can find it difficult to focus in this exciting world. ' +
            'You can overthink things and lose practicality.'
    
    },

    'logistician': {
        'Strength':
            'You are honest and direct because integrity is important to you. ' + 
            'You are strong-willed and focus on your goals. ',
     
        'Weakness':
            'You can be stubborn when you are too focused on your original beliefs. ' + 
            'You can take on extra responsibility and put a lot of stress on yourself.' 
    },
    'defender': {
        'Strength':
            'You are incredibly supportive and like to help others. ' +
            'You are reliable and never fails to deliver. ',

        'Weakness':
            'You are shy and you don’t like to show off your accomplishments. ' +
            'You may try too hard to fulfill your duty and repress your feelings and neglect your health.'
    },

    'executive': {
        'Strength':
            'You are dedicated and follows a project through completion. ' +
            'You are excellent at organizing and distributing tasks and responsibilities. ',

        'Weakness':
            'You can be stubborn and dismissive of unconventional ideas. ' + 
            'You can place too much pressure on yourself to complete everything on time and perfectly.'
    },

    'consul' : {
        'Strength' :
            'You are highly practical and excel and routine tasks. ' +
            'You are very loyal and values trustworthiness. ' ,
            
        'Weakness' :
            'You can care excessively about your social status. ' +
            'You can be very defensive when receiving criticism.' 
    },
    
    
    
    'virtuoso' : {
        'Strength' :
            'You are optimistic, energetic, and fun to be around. ' +
            'You are creative and act gracefully under pressure. ' ,
        
        'Weakness' :
            'You can be easily bored by routine and long-term plans. ' +
            'Your spontaneous personality may lead to excessively risky choices.'
    } ,
    
    
    
    'adventurer' : {
        'Strength' :
            'You are charming, warm, and live with a free spirit. ' +
            'You are passionate and artistic. ',
    
        'Weakness' :
            'You can be easily stressed out when your creativity is limited by external factors. ' + 
            'You can be overly competitive and waste time trying to win at everything.' 
    },


    'entrepreneur' : {
        'Strength' :
            'You are bold, full of energy, and enjoys pushing boundaries. ' +
            'You are direct, sociable, and have a knack of networking. ',
        
        'Weakness' :
            'You can be impatient when everyone is not moving at the fast pace you are expecting. ' +
            'You can be too involved in the moment and miss the bigger picture. '
    },


    'entertainer' : {
        'Strength' :
            'You are original and love to experience everything. ' +
            'You are excellent at socializing and thrive in social situations. ' ,
        
        'Weakness' :
            'You can be poor long term planners because plans seem boring. ' +  
            'You can be unfocused and easily distracted by your love to experience everything.'
    }
}

const EMAILS = {
    'architect': 'daddyaf@hotmail.com',
    'logician':'flexicution@gmail.com',
    'commander': 'codgod@yahoo.com',
    'architect': 'projectarch@aol.com',
    'debator': 'wheresmywatch@watch.net',
    'mediator': 'stressed@force.org',
    'entertainer': 'eatsleepcode@repeat.com',
    'campaigner': 'codmw2@bestcampaign.com',
    'logistician':'no@u.com',
    'advocate': 'devils@advocate.com',
    'virtuoso': 'uzivirt@kusco.com',
    'consul': 'consulation@prize.com',
    'defender': 'bloonstower@defense.com',
    'protagonist': 'protean@con.com',
    'executive': '3x3cut3@me.net'
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
                maxType + 
                ". That means " + STRONG_AND_WEAK[maxType]['Strength'] + 
                " Sadly, this means " + STRONG_AND_WEAK[maxType]['Weakness'] +
                " Would you like to save your email to connect with other " + 
                this.attributes.storage.personalityType + "s?")
                .listen("Would you like to save your email?");
            this.handler.state = GAME_STATES.END;
            this.emit(":responseReady");
        }
    },

});

const emailStateHandlers = Alexa.CreateStateHandler(GAME_STATES.END, {
    "LaunchRequest": function() {
        var personalityType = this.attributes.storage.personalityType;
        if (this.attributes.storage.email === "null") {
            this.response.speak("Would you like to save your email to connect with other " + personalityType + "s?")
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
        var personalityType = this.attributes.storage.personalityType;
        this.response.speak("Email a fellow " + personalityType + " at " + EMAILS[personalityType]);
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