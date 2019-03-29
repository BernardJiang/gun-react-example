import React, { Component } from 'react';
// import Gun from 'gun/gun'
// import Todos from './Todos'
import Sign from './Sign'
import Chat from './Chat'
import Attributes from './Attributes'
// import Json from './Json'
// import logo from './logo.svg';
import './App.css';
import Entity from './Entity';

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
      <div className="App" className='rowC'>
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
        <Sign entity={this.entity} />
        <Chat entity={this.entity} />
        <Attributes entity={this.entity} />
      </div>
    );
  }
}

export default App;
