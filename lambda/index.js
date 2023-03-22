const Alexa = require('ask-sdk-core');
var requestlib = require('request');
const mydocument = require('main.json')
const dummy_document = require('dummy.json')


const SKILL_NAME ="New York Times News"
const STOP_MESSAGE = 'Goodbye! Thanks for listening to New York Times flash briefing by Learn in 60 seconds';
const HELP_MESSAGE = 'You can say launch flash news briefing, or, you can say stop... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
var ALL_NEWS_SET;
//var INTROS=["Leading the news today is the headline ","In other news we also have a story ", "Third on the list is the following headline ","The New York Times reports as follows: ","Our last headline of the day is as follows: "]
var MAX
const STEP = 5
var NEWSINDEX=0
const LAST_NEWS = "You have now finished hearing about all the news for today";
const FALLBACK_MESSAGE = "I an sorry I cannot help you with that. You can say launch flash news briefing"
const FALLBACK_REPROMPT = HELP_REPROMPT

const TouchListHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
            && handlerInput.requestEnvelope.request.source.id === 'myImageListWithItemsToSpeak';
    },
    handle(handlerInput){

      news = handlerInput.requestEnvelope.request.arguments[1]
      header_title = (ALL_NEWS_SET[Number(news)-1])["headerTitle"]
      news_url = (ALL_NEWS_SET[Number(news)-1])["article_url"]
      if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: dummy_document,
                token: 'opennews'
            });

            var urlToGo="https://www.nytimes.com/2023/03/19/world/europe/putin-mariupol-crimea-ukraine.html";

            handlerInput.responseBuilder.addDirective({
                type: "Alexa.Presentation.APL.ExecuteCommands",
                token: 'opennews',
                commands: [{
                  type: "OpenURL",
                  source: news_url
                }]
            });
        }


        return handlerInput.responseBuilder
        .speak("You have clicked on "+header_title+". We will now open the link. You can say flash briefing to start over")
        .withShouldEndSession(false)
        .getResponse();
    }
}

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

        var res = info_set
        var result = []
        for (var i in res){
         temp={}
        //         if(res[i][0].length===0){return}
         head1 =res[i][0] || ""
         head2 = res[i][2] || ""
         temp["headerTitle"] = head1
         temp["primaryText"] = head1
         temp["secondaryText"] = head2
         temp["headline"] = head1+". "+head2
         temp["article_url"]=res[i][3]  || ""
         temp["imageSource"]="https://static01.nyt.com/"+res[i][4]  || ""
         temp["img_len"]=res[i][5]  || ""
         temp["img_wid"]=res[i][6]  || ""
         temp["author"]=res[i][7] || ""
         temp["cat1"]=res[i][8] || ""
         temp["cat2"]=res[i][9] || ""
         temp["num"]=i
         temp["id"]="myImageListWithItemsToSpeak"

         result.push(temp)


        }
        ALL_NEWS_SET=result
        MAX=ALL_NEWS_SET.length-1
        var news_set=""
        for (var i=0;i<STEP;i++){
          news_set=news_set+result[i]["headline"]+"<break time='2s'/>"+" ";
          if(i===STEP-1){
            sessionAttributes.lastSpeech = news_set;
          }

        }
        NEWSINDEX=STEP


        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){
          //console.log("this device supports APL")
          const news_data_set = {
            "imageListData": {
              "type": "object",
              "defaultImageSource":"https://raw.githubusercontent.com/tanyagupta/tanyagupta.github.io/master/images/blank.png",
              "objectId": "imageListDataId",
              "headerTitle": "New York Times Flash Briefing",
              "headerSubtitle": "By Learn in 60 seconds",
              "headerAttributionImage": "https://developer.nytimes.com/files/poweredby_nytimes_30b.png?v=1583354208352",
              "backgroundImageSource": "https://d2o906d8ln7ui1.cloudfront.net/images/BT7_Background.png",
              "properties": {
                "listItemsToShow": result
              },
              "transformers": [
                {
                  "inputPath": "listItemsToShow[*].headline",
                  "outputName": "speech",
                  "transformer": "textToSpeech"
                }
              ]

            },
          }

          const news_speech_directive = {
            type: 'Alexa.Presentation.APL.RenderDocument',
            version: '1.0',
            document: mydocument,
            datasources: news_data_set
          }

          const news_response =  handlerInput.responseBuilder
              .withShouldEndSession(false)
              .reprompt('Would you like some more news?')
              .addDirective(news_speech_directive)

          console.log(result[0])


          return news_response.getResponse()
            }
            else {

              console.log("no support for APL")


              return handlerInput.responseBuilder
                .speak(news_set)
                .withShouldEndSession(false)
                .reprompt('Would you like some more news?')
                .getResponse()
            }
    }
};
const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      console.log(sessionAttributes)
      console.log(NEWSINDEX)
      console.log(MAX)
      console.log(STEP)
      var response_string = ""
      var j=0



      var news_set=""

      if (NEWSINDEX+STEP<=MAX){
        for (var i=NEWSINDEX;i<NEWSINDEX+STEP;i++){
          news_set=news_set+ALL_NEWS_SET[i]["headline"]+"<break time='2s'/>"+" ";
          if(i===NEWSINDEX+STEP-1){
            sessionAttributes.lastSpeech = news_set;
          }

        }
        NEWSINDEX=NEWSINDEX+STEP

          var response_clean = news_set.replace(/\&/ig, 'and')
          const speakOutput = response_clean+" "+"Would you like more news?";

            return handlerInput.responseBuilder
              .speak(speakOutput)
              .withShouldEndSession(false)
              .reprompt('Would you like some more news?')
              .getResponse();
        }
        else{
          console.log("last news")
          return handlerInput.responseBuilder
                      .speak("You have now finished hearing about all the news for today")
                      .withShouldEndSession(true)
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


        return handlerInput.responseBuilder
            .speak(STOP_MESSAGE)
            .withShouldEndSession(true)
            .getResponse();
    }
};


const ExitIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request.type;
    console.log("ExitIntentHandler")
    console.log(request)
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
        console.log("CancelAndStopIntentHandler")
        console.log(handlerInput.requestEnvelope.request.intent.name)
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
        const reason = handlerInput.requestEnvelope.request.reason;
        console.log("==== SESSION ENDED WITH REASON ======");
        console.log(reason);
        return handlerInput.responseBuilder.getResponse();
    }
};


/*

CANCEL

OR

AMAZON.StopIntent
*/
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

const RepeatIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const REPEAT = sessionAttributes.lastSpeech

    console.log("I am in repeat handler")
    console.log(REPEAT)
    return handlerInput.responseBuilder
      .speak(REPEAT+" Would you like more news?")
      .reprompt(REPEAT+" Would you like more news?")
      .getResponse();
  },
};

const FallbackIntentHandler = {

  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },

  handle(handlerInput) {

    return handlerInput.responseBuilder

      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_REPROMPT)
      .getResponse();

  }

};

const sendEventHandler = {
      canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments.length > 0;
      },
      handle(handlerInput) {

      //retrieving the argument of the SendEvent command. "PRESSED" in this case
      const sendEventArgument = (handlerInput.requestEnvelope.request.arguments[0]);

      let speechText = sendEventArgument;

      //make your API call here

          return handlerInput.responseBuilder
              .speak(speechText)
          }
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      //  LaunchRequestHandler,

        GetNewsIntentHandler,
        TouchListHandler,
       YesIntentHandler,
       NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        ExitIntentHandler,
        SessionEndedRequestHandler,
        sendEventHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        )
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();

    function getNews() {
      return new Promise(function (resolve, reject) {
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
