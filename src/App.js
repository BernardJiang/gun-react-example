import React, { Component } from 'react';
import Entity from './Entity';
// import Gun from 'gun/gun'
// import Todos from './Todos'
import Sign from './Sign'
import Chat from './Chat'
import Attributes from './Attributes'
// import Json from './Json'
// import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import ChatBot from './lib/index';
const steps = [
  {
    id: '1',
    message: 'What is your name?',
    trigger: '2',
  },
  {
    id: '2',
    user: true,
    trigger: '3',
  },
  {
    id: '3',
    message: 'Hi {previousValue}, nice to meet you!',
    // end: true,
    // user: true,
    trigger: '2'
  },
];
class App extends Component {
  constructor() {
    super();
    var newloc = window.location.origin;
    if (window.location.port !== '8765') {
      newloc = window.location.protocol + "//"
        + window.location.hostname
        + (window.location.port ? ':' + '8765' : '');
    }

    this.entity = new Entity(newloc + '/gun');

  }
  render() {
  return (
      <div className={['rowC']}>
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
        <div className={['column']}>
          <Sign entity={this.entity} />
          <Attributes entity={this.entity} />

        </div>


        <Chat entity={this.entity} />
        <ChatBot steps={steps} entity={this.entity}/>
      </div>
    );
  }
}

export default App;
