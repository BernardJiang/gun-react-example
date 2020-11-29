import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter } from "react-router-dom";
import { h, makeComponent } from '@cycle/react';
import { div, h1, h3, br, span, input, p, nav, button } from "@cycle/react-dom";
import xs from 'xstream';
import { run } from '@cycle/run'
import makeRoutingDriver, { routes } from 'cycle-routing-driver'
import { render } from 'react-dom';
import placeholderText from 'lorem-ipsum';
import dropRepeats from 'xstream/extra/dropRepeats';


import { Entity } from './Entity';
import { greeter2View, greeterComponent } from './greeter2View'
import Sign, { SignIn } from './Sign'
import Chat from './Chat'
import Attributes from './Attributes'
import Talks from './Talks'
import Settings from './Settings'
import './App.css';
import { ThemeProvider } from 'styled-components';
import ChatBot from './lib/index';

const styles = {};

styles.fill = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

styles.content = {
  ...styles.fill,
  top: "40px",
  textAlign: "center"
};

styles.nav = {
  padding: 0,
  margin: 0,
  position: "absolute",
  top: 0,
  height: "40px",
  width: "100%",
  display: "flex",
};

styles.navItem = {
  textAlign: "center",
  flex: 1,
  listStyleType: "none",
  padding: "10px"
};

styles.hsl = {
  ...styles.fill,
  color: "red",
  paddingTop: "20px",
  fontSize: "30px"
};

styles.rgb = {
  ...styles.fill,
  color: "white",
  paddingTop: "20px",
  fontSize: "30px"
};

function navigation(pathname) {
  return nav('main_nav', [
    span('#signin', {
      dataset: { page: 'signin' },
      className: { 'active': pathname === '/signin' }
    }, 'Sign In'),
    span('#Settings', {
      dataset: { page: 'settings' },
      className: { 'active': pathname === '/settings' }
    }, 'Settings'),
    span('#Attributes', {
      dataset: { page: 'attributes' },
      className: { 'active': pathname === '/attributes' }
    }, 'Attributes'),
    span('#Talks', {
      dataset: { page: 'talks' },
      className: { 'active': pathname === '/talks' }
    }, 'Talks'),
    span('#Chatbot', {
      dataset: { page: 'chatbot' },
      className: { 'active': pathname === '/chatbot' }
    }, 'Chatbot'),
    span('#Greeter', {
      dataset: { page: 'greeter' },
      className: { 'active': pathname === '/greeter' }
    }, 'Greeter')
  ])
}

function settingsView() {
  return div("#divSettings", [
    h1('Settings!'),
    p('Here to edit settings '),
  ])
}
function attributesView() {
  return div('#divAttributes',[
    h1('Attributes !'),
    p('Here to attributes '),
  ])
}
function talksView() {
  return div('#divTalks', [
    h1('Talks !'),
    p('Here to talks'),
  ])
}
// function chatbotView() {
//   return div('#divChatbot', [
//     h1('Chat bot !'),
//     p('Here to chat bot in/ up '),
//   ])
// }


function view(history$) {
  return history$.map(([history, nameview, signview, chatbotview]) => {
    const { pathname } = history;
    let page = h1('404 not found')
    if (pathname === '/Greeter') {
      page = nameview
    } else if (pathname === '/Sign In') {
      page = signview
    } else if (pathname === '/Settings') {
      page = settingsView()
    } else if (pathname === '/Attributes') {
      page = attributesView()
    } else if (pathname === '/Talks') {
      page = talksView()
    } else if (pathname === '/Chatbot') {
      page = chatbotview
    }

    return div([
      navigation(pathname),
      page,
      br(),
      h3('History object'),
      p(JSON.stringify(history))
    ]);
  });
}


function main(sources) {
  const { react, entity } = sources;

  const history$ = react.select('main_nav').events('click')
    .map(e => {
      return e.target.textContent
    })
    .compose(dropRepeats())

  const props$ = xs.of({
    label: 'Welcome!!! ', value: 'no one'
  });
  
  const greetersink = greeterComponent({ DOM: react, props$ })
  
  const signsink = SignIn({ DOM: react, entity: entity });
  
  const chatbotsink = ChatBot({ DOM: react, entity: entity });

  const actions$ = xs.combine(sources.history, greetersink.DOM, signsink.DOM, chatbotsink.DOM);

  const vdom$ = view(actions$);

  return {
    react: vdom$,
    history: history$,
    entity: signsink.entity
  };
}

const App = main;
export default App;
