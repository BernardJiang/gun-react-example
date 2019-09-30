import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Entity from './Entity';
// import Gun from 'gun/gun'
// import Todos from './Todos'
import Sign from './Sign'
import Chat from './Chat'
import Attributes from './Attributes'
import Settings from './Settings'
// import Json from './Json'
// import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import ChatBot from './lib/index';
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
      <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Sign</Link>
            </li>
            <li>
              <Link to="/Settings">Settings</Link>
            </li>
            <li>
              <Link to="/Attributes">Attributes</Link>
            </li>
            <li>
              <Link to="/Chatbot">Chatbot</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/Chatbot">
            <ChatBot entity={this.entity}/>
          </Route>
          <Route path="/Attributes">
            <Attributes entity={this.entity}/>
          </Route>
          <Route path="/Settings">
            <Settings entity={this.entity}/>
          </Route>
          <Route path="/">
            <Sign entity={this.entity}/>
          </Route>
        </Switch>
      </div>
    </Router>
    );
  }
  render1() {
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
        <ChatBot entity={this.entity}/>
        <Settings entity={this.entity} />
      </div>
    );
  }
}

export default App;
