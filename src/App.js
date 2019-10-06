import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter } from "react-router-dom";
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

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};

const AuthButton = withRouter(({ history }) =>
  fakeAuth.isAuthenticated ? (
    <p>
      Welcome!{" "}
      <button
        onClick={() => {
          fakeAuth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
);

function PrivateRoute({ component: Component, ...rest }) {
  // console.log("PrivateRoute", this.props)
  return (
    <Route
      {...rest}
      render={props =>
        fakeAuth.isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

function Public() {
  return <h3>Public</h3>;
}

function Protected() {
  return <h3>Protected</h3>;
}

class Login extends Component {
  state = { redirectToReferrer: false };

  login = () => {
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={this.login}>Log in</button>
      </div>
    );
  }
}

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
        <AuthButton />
        <nav>
          <ul>
            <li>
              <Link to="/">Sign in</Link>
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
            <li>
              <Link to="/public">Public Page</Link>
            </li>
            <li>
              <Link to="/protected">Protected Page</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Route path="/public" component={Public} />
          <Route path="/login" component={Login} />
          <PrivateRoute path="/protected" component={Protected} />
          <PrivateRoute path="/Chatbot">
            <ChatBot entity={this.entity}/>
          </PrivateRoute>
          <PrivateRoute path="/Attributes">
            <Attributes entity={this.entity}/>
          </PrivateRoute>
          <PrivateRoute path="/Settings">
            <Settings entity={this.entity}/>
          </PrivateRoute>
          <Route path="/">
            <Sign entity={this.entity}/>
          </Route>
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
