import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter } from "react-router-dom";
import {h,  makeComponent} from '@cycle/react';
import { div, h1, input, p, button} from "@cycle/react-dom";
import xs from 'xstream';
import {run} from '@cycle/run'
import makeRoutingDriver, {routes} from 'cycle-routing-driver'
import {render} from 'react-dom';


import Entity from './Entity';
// import Gun from 'gun/gun'
// import Todos from './Todos'
import Sign from './Sign'
import Chat from './Chat'
import Attributes from './Attributes'
import Talks from './Talks' 
import Settings from './Settings'
// import Json from './Json'
// import logo from './logo.svg';
import './App.css';
import { ThemeProvider } from 'styled-components';
import ChatBot from './lib/index';

function greeter(sources) {
  const input$ = sources.react
    .select('name')
    .events('input')
    .map(ev => ev.target.value);

  const name$ = xs.merge(
    sources.react.props().map(p => p.initial),
    input$
  );

  const elem$ = name$.map(name =>
    div([
      h1(name ? 'Welcome, ' + name : 'What\'s your name?'),
      input({ sel: 'name', type: 'text' })
    ])
  );

  return { react: elem$ };
}

 const Greeter = makeComponent(greeter);
 const App = Greeter;
 export default App;

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

const AuthButton = withRouter(({ history, ...rest }) => {
  let obj1 = { ...rest }
  let isAuthenticated = obj1.entity.isUserOnline()
  return isAuthenticated ? (
    <p>
      Welcome!{" "}
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
}
)


// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  let obj1 = { ...rest };
  console.log("obj1  entity=", obj1.entity.stageName)
  console.log("rest useronline =", obj1.entity.stageName === "")
  // var entity = rest.Entity
  return (
    <Route
      {...rest}
      render={({ location }) =>
        (obj1.entity.stageName !== "") ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/SignIn",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
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

class App_old extends Component {
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
        <div style={{display: "flex", flexDirection: 'column'}}>
          <ul style={{display: "flex", flex: 1, flexDirection: 'row'}}>
            <li style={styles.navItem} >
              <Link to="/SignIn">{ this.entity.isUserOnline() ? 'Sign Out' : 'Sign In' }</Link>
            </li>
            <li  style={styles.navItem} >
              <Link to="/Settings">Settings</Link>
            </li>
            <li  style={styles.navItem} >
              <Link to="/Attributes">Attributes</Link>
            </li>
            <li  style={styles.navItem} >
              <Link to="/Talks">Talks</Link>
            </li>
            <li  style={styles.navItem} >
              <Link to="/Chatbot">Chatbot</Link>
            </li>
          </ul>

          <Switch style={{display: "flex", flex: 16, flexDirection: 'row'}}>
          <Route path="/Chatbot">
            <ChatBot entity={this.entity}/>
          </Route>
          <PrivateRoute path="/Attributes" entity={this.entity} >
            <Attributes entity={this.entity}/>
          </PrivateRoute>
          <Route path="/Talks">
            <Talks entity={this.entity}/>
          </Route>
          <Route path="/Settings">
            <Settings entity={this.entity}/>
          </Route>
          <Route path="/SignIn">
            <Sign entity={this.entity}/>
          </Route>
          <Route path="/">
            <Sign entity={this.entity}/>
          </Route>
          </Switch>
          <AuthButton style={{display: "flex", flex: 1, flexDirection: 'row'}} entity={this.entity}/>
          <Greeter initial={"person"} />
          </div>          
    </Router>
    );
  }
  
}

function NavLink(props) {
  return (
    <li style={styles.navItem}>
      <Link {...props} style={{ color: "inherit" }} />
    </li>
  );
}


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

// export default App_old;
