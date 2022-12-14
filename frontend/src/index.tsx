import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {
  ChakraProvider,
  ColorModeProvider,
  CSSReset,
  theme,
} from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n';
import { Provider } from 'react-redux';
import { store } from './app/store';
import 'react-datepicker/dist/react-datepicker.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Router>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <ColorModeProvider>
          <CSSReset />
          <App />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  </Router>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
