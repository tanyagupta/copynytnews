// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
var requestlib = require('request');
const mydocument = require('main.json')


const SKILL_NAME ="New York Times News"
const STOP_MESSAGE = 'Goodbye! Thanks for listening to New York Times flash briefing by Learn in 60 seconds';
const HELP_MESSAGE = 'You can say launch flash news briefing, or, you can say stop... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
var ALL_NEWS_SET;
var INTROS=["Leading the news today is the headline ","In other news we also have a story ", "Third on the list is the following headline ","The New York Times reports as follows: ","Our last headline of the day is as follows: "]
var MAX
const STEP = 5
var NEWSINDEX
const LAST_NEWS = "You have now finished hearing about all the news for today";

// const LaunchRequestHandler = {
//     canHandle(handlerInput) {
//         return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
//     },
//     handle(handlerInput) {
//         const speakOutput = 'Would you like to hear the flash briefing for today?';
//         return handlerInput.responseBuilder
//             .speak(speakOutput)
//             .reprompt(speakOutput)
//             .getResponse();
//     }
// };
const GetNewsIntentHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'LaunchRequest'
        || (request.type === 'IntentRequest'
          && request.intent.name === 'GetNewsIntent');
        },
    async handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.invokeReason = 'another-news';
        var result = await getNews();

        var info_set = JSON.parse(result)


        //var info_set = [["For Trump and the Nation, a Final Test of Accountability","WASHINGTON — Barely 11 months after President Trump was acquitted in a momentous Senate trial, the nation now confronts the possibility of yet another impeachment battle in the twilight of his presidency, a final showdown that will test the boundaries of politics, accountability and the Constitution.","The push by Democrats to impeach the president for his role in inciting the attack on the Capitol underscores how American politics has been profoundly shaken in ways still hard to measure.","https://www.nytimes.com/2021/01/09/us/politics/trump-impeachment-possible.html","images/2021/01/09/us/politics/09dc-impeach-1/09dc-impeach-1-articleLarge.jpg","By Peter Baker","Washington","U.S.","Politics"]]
        ALL_NEWS_SET = info_set
        MAX = Number(ALL_NEWS_SET.length)-1;
        j=0
        var response_string = ""
        for (var i=0;i<STEP;i++){

          response_string=response_string
          +" "+INTROS[j]
          +" "+ALL_NEWS_SET[i][0]
          +"<break time='1s'/>"
          +" "+ALL_NEWS_SET[i][2]
          //+"<break time='1s'/>"
          //+"Here's the lead Para:"
          //+" "+ALL_NEWS_SET[i][1]
          +"<break time='2s'/>"+" ";
          j++

        }
        NEWSINDEX=STEP+1


        var response_clean = response_string.replace(/\&/ig, 'and')
        sessionAttributes.lastSpeech = response_clean;
        var display_text = (ALL_NEWS_SET[0][0]).replace(/\&/ig, 'and')
        var display_image = ALL_NEWS_SET[NEWSINDEX][4] ? "https://static01.nyt.com/"+ALL_NEWS_SET[NEWSINDEX][4] : "https://raw.githubusercontent.com/tanyagupta/nytnewsflash/main/skill-package/assets/social-media-1989152_640.jpg";
        var height = ALL_NEWS_SET[NEWSINDEX][5] ? ALL_NEWS_SET[NEWSINDEX][5] : "";
        var width =  ALL_NEWS_SET[NEWSINDEX][6] ? ALL_NEWS_SET[NEWSINDEX][6] : "";


        const speakOutput = response_clean+" "+"Would you like more news?";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.withSimpleCard(SKILL_NAME,"HELLO")
            .withStandardCard(SKILL_NAME,display_text,display_image)
            .withShouldEndSession(false)
            .reprompt('Would you like some more news?')
            .addDirective({
              type: 'Alexa.Presentation.APL.RenderDocument',
              version: '1.0',
              document: mydocument,
              datasources: {
                response: {
                  text: display_text,
                  title: SKILL_NAME,
                  url:display_image,
                  height:height,
                  width: width,
                  //logo:"https://monkeyfacts.s3.ap-south-1.amazonaws.com/icon_512_A2Z.png"
                },
              },
            })
            .getResponse();
    }
};
const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      var response_string = ""
      var j=0
      if (NEWSINDEX+STEP<=MAX){
        for(var i = NEWSINDEX; i<NEWSINDEX+STEP;i++){

          response_string=response_string
          +INTROS[j]
          +" "+ALL_NEWS_SET[i][0]
          +"<break time='1s'/>"
          +" "+ALL_NEWS_SET[i][2]
          //+"<break time='1s'/>"
          //+"Here's the lead Para:"
          //+" "+ALL_NEWS_SET[i][1]
          +"<break time='2s'/>"+" "
          j++

        }
        var response_clean = response_string.replace(/\&/ig, 'and')
        sessionAttributes.lastSpeech = response_clean;
        var display_text = (ALL_NEWS_SET[NEWSINDEX][0]).replace(/\&/ig, 'and')
        var display_image = ALL_NEWS_SET[NEWSINDEX][4] ? "https://static01.nyt.com/"+ALL_NEWS_SET[NEWSINDEX][4] : "https://raw.githubusercontent.com/tanyagupta/nytnewsflash/main/skill-package/assets/social-media-1989152_640.jpg";

        NEWSINDEX=NEWSINDEX+STEP;

        const speakOutput = response_clean+" "+"Would you like more news?";
        //const speakOutput = 'Yes yes yes';

          return handlerInput.responseBuilder
            .speak(speakOutput)
            //.withSimpleCard(SKILL_NAME,"HELLO")
            .withStandardCard(SKILL_NAME,display_text,display_image)
            .withShouldEndSession(false)
            .reprompt('Would you like some more news?')
            .getResponse();
      }
      else{
                    return handlerInput.responseBuilder
                      .speak(LAST_NEWS)
                      .withShouldEndSession(true)
                      .withSimpleCard(SKILL_NAME,LAST_NEWS)
                      .getResponse();
                  }



    }
};
const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'No no no';

        return handlerInput.responseBuilder
            .speak(STOP_MESSAGE)
            .withShouldEndSession(true)
            .getResponse();
    }
};


const ExitIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .withShouldEndSession(true)
      .getResponse();
  },
};
const RepeatIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const REPEAT = sessionAttributes.lastSpeech


    return handlerInput.responseBuilder
      .speak(REPEAT+" Would you like more news?")
      .reprompt(REPEAT+" Would you like more news?")
      .getResponse();
  },
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {


        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(HELP_REPROMPT)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
        .speak(STOP_MESSAGE)
        .withShouldEndSession(true)
        .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      //  LaunchRequestHandler,
        GetNewsIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        RepeatIntentHandler,
        ExitIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        )
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();

    function getNews() {
      return new Promise(function (resolve, reject) {
        //var url = 'https://script.google.com/macros/s/AKfycbxDldtSHoZoYMBct9BrmYohyFO10JdOeAaMoO3F0e9HSrOZQTEJ/exec'
        //var url = 'https://script.google.com/macros/s/AKfycbzdDlPW9-iZodsf45dEOTN2tlXqszE5atPDfuiIJCzdttjl_0f7/exec'
        var url = "https://script.google.com/macros/s/AKfycbzdDlPW9-iZodsf45dEOTN2tlXqszE5atPDfuiIJCzdttjl_0f7/exec"
          requestlib(url, function (error, res, body) {


          if (!error && res.statusCode == 200) {
            resolve(body);
          } else {
            reject(error);
          }
        });
      });

}
