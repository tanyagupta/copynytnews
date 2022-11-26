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
const FALLBACK_MESSAGE = "I an sorry I cannot help you with that. You can say launch flash news briefing"
const FALLBACK_REPROMPT = HELP_REPROMPT


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

         result.push(temp)

        }


        return handlerInput.responseBuilder
            .withShouldEndSession(false)
            .reprompt('Would you like some more news?')
            .addDirective({
              type: 'Alexa.Presentation.APL.RenderDocument',
              version: '1.0',
              document: mydocument,
              datasources: {
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

const FallbackIntentHandler = {

  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.

  //              This handler will not be triggered except in that locale, so it can be

  //              safely deployed for any locale.

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
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        RepeatIntentHandler,
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

/*
[{author=By Jazmine Ulloa, cat1=Politics, cat2=U.S., img_wid=600.0, img_len=400.0,
article_url=https://www.nytimes.com/2022/11/11/us/politics/arizona-senator-mark-kelly-blake-masters.html,
headline=Mark Kelly Wins Arizona Senate Race, Putting Democrats a Seat From Control Mr. Kelly, who ran as a bipartisan legislator devoted to the needs of Arizona,
defeated Blake Masters, a Republican newcomer whose ideological fervor failed to win over enough independent voters.,
img_url=images/2022/11/08/multimedia/08election-day-kelly-masters-hfo-1-ce3c/08election-day-kelly-masters-hfo-1-ce3c-articleLarge.jpg},
{cat2=U.S., img_len=400.0, cat1=Politics, img_wid=600.0, article_url=https://www.nytimes.com/2022/11/11/us/politics/nevada-governor-sisolak-lombardo.html,
headline=Lombardo Ousts Sisolak in Nevada Governor’s Race Joseph Lombardo, the Clark County sheriff, ran as a law-and-order Republican who would focus on reducing regulations.,
img_url=images/2022/10/31/multimedia/Joe-Lombardo-wins-1-95c6/Joe-Lombardo-wins-1-95c6-articleLarge.jpg, author=By Jennifer Medina}]
*/
