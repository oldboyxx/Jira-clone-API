import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import App from 'App';

if (process.env.NODE_ENV === "development" && process.env.REACT_APP_MSW) {
    // eslint-disable-next-line global-require
    const { worker } = require('./mocks/browser');
    worker.start({
        serviceWorker: {
            url: '/mockServiceWorker.js',
        },
    });
}

ReactDOM.render(<App />, document.getElementById('root'));
