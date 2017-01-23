// var annyang = require('annyang');
var speak = require("node-speak");

var initSpeech = function() {
  if (!annyang) {
    return;
  }

  var commands = {
    'hello': function() { alert('Hello World!'); },
    'google': function() { alert('Google!'); },
    'start game': function() {alert('Starting game!'); },
    'fold': function() {console.log('folding hand');
      speak('hello yadadada', {voice: 'en/en-us'});
    },
    'hey': function() {
      speak('this is a drive by, everyone get down! @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', {speed: 1000});
      // try{
      //   responsiveVoice.speak("hello world");
      // } catch (e) {
      //   console.log(e);
      // }
      // console.log("hello");

    },
    'raise (by) :amount': function(amount) {console.log('an amount', amount)}
  };

  annyang.debug();

  annyang.addCommands(commands);

  annyang.addCallback('result', function(phrases) {
    console.log('I think the user said: ', phrases[0]);
  });

  annyang.addCallback('soundstart', function() {
    console.log('I think the user is gonna say something');
  });

  annyang.addCallback('start', function() {
    console.log('I think it ought to start');
  });

  annyang.addCallback('error', function(e) {
    console.log('There was an error', e);
  });

  annyang.addCallback('result', function(result) {
    console.log('There was a result', result);
  });

  annyang.addCallback('end', function(result) {
    console.log('Finished');
  });

  console.log('started annyang');

  SpeechKITT.annyang({autoRestart: true, continuous: false});
  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');

  // Render KITT's interface
  SpeechKITT.vroom();

};

module.exports = initSpeech;
