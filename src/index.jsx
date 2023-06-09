//import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';
import './polyfill'

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './services/i18n';

import * as serviceWorker from './serviceWorker';
import { freeSet, flagSet, brandSet } from '@coreui/icons';

React.icons = {...freeSet, ...flagSet, ...brandSet }

ReactDOM.render(
      <App/>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
