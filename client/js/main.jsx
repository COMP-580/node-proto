var React = require('react');
var ReactDOM = require('react-dom');

/**
 * Libraries
 */

global.jQuery = require('jquery');
global.$ = jQuery;
var bootstrap = require('../libraries/bootstrap-sass/assets/javascripts/bootstrap');
global.canvas = $('#c')[0];
var socket = require('./sockets/init');
// require('./sockets/initSocket')(socket);
var initSpeech = require('./utils/speech');
initSpeech();


/**
 * Components
 */

var MainComponent = require('./components/MainFrame.jsx');

/**
 * Actions/Stores
 */

require('./import');

/**
 * Add the components
 */

ReactDOM.render(
  <MainComponent />,
  document.getElementById('main-frame')
);
