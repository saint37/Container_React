import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import 'babel-polyfill';
import './index.css';
import 'antd/dist/antd.css';
import registerServiceWorker from './registerServiceWorker';
import RouterIndex from './router/index.js';  

ReactDOM.render(<RouterIndex />, document.getElementById('root'));
registerServiceWorker();
