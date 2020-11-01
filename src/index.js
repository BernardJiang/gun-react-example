import React from 'react';
// import ReactDOM from 'react-dom';
import {createElement} from 'react';
import xs from 'xstream';
import {render} from 'react-dom';
import {h, makeComponent} from '@cycle/react';
import './index.css';
// import App from './App';
import * as serviceWorker from './serviceWorker';

function main(sources) {
    const init$ = xs.of(() => 0);
  
    const increment$ = xs.periodic(1000).mapTo(x => x + 1);
  
    const btnSel = Symbol();
  
    const reset$ = sources.react
      .select(btnSel)
      .events('click')
      .mapTo(() => 0);
  
    const count$ = xs
      .merge(init$, increment$, reset$)
      .fold((state, fn) => fn(state));
  
    const vdom$ = count$.map(i =>
      h('div', [
        h('h1', `Hello ${i} times`),
        h('button', {sel: btnSel}, 'Reset'),
      ]),
    );
  
    return {
      react: vdom$,
    };
  }
  
  const App = makeComponent(main);
  
render(createElement(App), document.getElementById('root'));
  

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
