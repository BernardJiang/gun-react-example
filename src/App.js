import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter } from "react-router-dom";
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
          <ul>
            <li>
              <Link to="/SignIn">Sign in</Link>
            </li>
            <li>
              <Link to="/Settings">Settings</Link>
            </li>
            <li>
              <Link to="/Attributes">Attributes</Link>
            </li>
            <li>
              <Link to="/Talks">Talks</Link>
            </li>
            <li>
              <Link to="/Chatbot">Chatbot</Link>
            </li>
          </ul>
          <Switch>
          
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
          <AuthButton entity={this.entity}/>
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
  bottom: 0
};

styles.content = {
  ...styles.fill,
  top: "0px",
  textAlign: "center"
};

styles.nav = {
  padding: 0,
  margin: 0,
  position: "absolute",
  top: 0,
  height: "40px",
  width: "100%",
  display: "flex"
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

export default App;
