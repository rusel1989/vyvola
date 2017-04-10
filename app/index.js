import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './app'
import './app.global.css';

render(<AppContainer><App /></ AppContainer>, document.getElementById('root'));

if (module.hot) {
  module.hot.accept('./app', () => {
    const NextRoot = require('./app'); // eslint-disable-line global-require
    render(<AppContainer><NextRoot /></ AppContainer>, document.getElementById('root'));
  });
}
