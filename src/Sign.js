import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import sampleCombine from 'xstream/extra/sampleCombine';

import React, { Component } from 'react'
import './style.css'
import Entity from './Entity';
import { div, form, ul, li, h1, input, button } from '@cycle/react-dom';

export default class Sign extends Component {
  constructor({ entity }) {
    super()
    this.entity = entity;
    this.state = {
      stageName: this.entity.isUserOnline() ? this.entity.getStageName() : 'alias',
      password: this.entity.isUserOnline() ? '' : 'unsafe',
      authenticated: this.entity.isUserOnline(),
      userlist: this.entity.userNameList,
      mencnt: this.entity.userNameList.length
    }
  }

  componentDidMount() {
    this.entity && this.entity.onSignChange(this.updateUISign);
  }

  componentWillUnmount() {
    this.entity && this.entity.onSignChange(null);
    // this.entity.leave(this.state.stageName, this.state.password)
  }

  session = () => {
    if (!sessionStorage) { return }
    sessionStorage.alias = this.state.stageName;
    sessionStorage.tmp = this.state.password;
  }

  signup = async e => {
    e.preventDefault()

    var ack = await this.entity.create(this.state.stageName, this.state.password);
    if (ack)
      ack = await this.entity.auth(this.state.stageName, this.state.password);
  }

  updateUISign = obj => {
    this.setState(obj);
  }

  signin = async e => {
    e.preventDefault()
    if (this.state.authenticated)
      this.entity.leave(this.state.stageName, this.state.password)
    else
      this.entity.auth(this.state.stageName, this.state.password)
  }

  handlestageNameChange = e => this.setState({ stageName: e.target.value })
  handlePasswordChange = e => this.setState({ password: e.target.value })

  render() {
    return <div id="sign" className="hue page">
      <form id="inup" className="sign pad center" onSubmit={this.signin}>
        <div className="mid row col">
          <input value={this.state.stageName} className="huet jot sap" type="text" placeholder="alias" onChange={this.handlestageNameChange} />
					Enter your stageName.
				</div>
        <div className="mid row col">
          <input value={this.state.password} className="huet jot sap" type="password" placeholder="password" onChange={this.handlePasswordChange} />
					And a long private passphrase.
				</div>
        <div className="mid row col go">
          <button className="huet sap act symbol" onClick={this.signin} > {this.state.authenticated ? 'Sign Out' : 'Sign In'} </button>
          <div className="or">or</div>
          <button className="huet sap act symbol" onClick={this.signup} >sign up</button>
        </div>
        <div className="mid row col go">
          <div> number of users : {this.state.mencnt}</div>
        </div>
        <a href="info">more info</a>
      </form>

      <ul>
        {
          !!this.state.userlist.length && this.state.userlist.map((item) => <li key={item.key}>* {item.text}</li>)
        }
      </ul>

    </div>

  }

}


function gunIntent( gun ) {
  const userAuth$ = gun.select('userlist').shallow()
    .map((state) => {
      console.log("userlist state = ", state);
      let newlist = []
      for (let key in state) {
        let row = state[key];
        if (row !== null || key === '_')
          continue;
        // console.log( "key=", key, ". row=", row)
        newlist.push(key)
      }
      console.log("newlist = ", newlist);

      return newlist
    })
    .compose(dropRepeats());

    const useris$ = gun.select('signstatus').shallow()
    .map(state => {
      console.log('is online =', state)
      let auth = false
      let name = 'noone'
      for (let key in state) {
        let row = state[key];
        if (key === 'stageName')
          name = row
        if (key === 'signin')
          auth = row
        console.log("key=", key, ". row=", row)
      }
      return { authenticated: auth, stageName: name }
    });

    

    return {userAuth$: userAuth$, useris$:useris$ }
}

function Intent( DOM) {
  const stageNameInput$ = DOM
    .select('stagenameinput')
    .events('input')
    .map(ev => {
      console.log(" stagename ev value=", ev.target.value);
      return ev.target.value
    }).startWith("namewho");

  const passwordInput$ = DOM
    .select('signpassword')
    .events('input')
    .map(ev => {
      console.log(" password ev value=", ev.target.value);
      return ev.target.value
    }).startWith("passwordwild");

  const newValueName$ = stageNameInput$.map(v => { return { stageName: v } }).remember();
  const newValuePassword$ = passwordInput$.map(v => { return { password: v } }).remember();

  const clickeventsignin$ = DOM
    .select('btnsignin')
    .events('click')
    .map(ev => {
      console.log(" sign in clicked ev value=", ev.target.value);
      return { typeKey: 'signin' }
    }).startWith(false);

  const clickeventsignup$ = DOM
    .select('btnsignup')
    .events('click')
    .map(ev => {
      console.log(" sign up clicked ev value=", ev.target.value);
      return { typeKey: 'signup' }
    }).startWith(false);

  const clickevents$ = xs.merge(clickeventsignin$, clickeventsignup$)

    return { clickevents$, newValueName$, newValuePassword$ }
}

function model(gunEvents, events){
  const state$ = xs.combine(gunEvents.userAuth$, gunEvents.useris$, events.newValueName$, events.newValuePassword$)
  .map(([init, useris, name, pwd]) => {
    const astate = { userlist: init, ...name, ...pwd, ...useris }
    console.log('init = ', init)
    console.log("useris =", useris)
    // const astate = { stageName : 'abc', password: 'dfg' };
    console.log("astate =", astate)
    return astate
  })
  return state$
}

function view(state$){

  const vdom$ = state$
    .map(state =>
      div('.hue.page', [
        form('#inup.sign.pad.center', [
          div('.mid.row.col', [
            h1('Enter your stageName: ' + state.stageName),
            input({ sel: 'stagenameinput', type: 'text', placeholder: 'alias' })
          ]),
          div('.mid.row.col', [
            h1('A long private passphrase: ' + state.password),
            input({ sel: 'signpassword', type: 'password', placeholder: 'password' })
          ]),
          div('.mid.row.col.go', [
            button({ sel: 'btnsignin' }, state.authenticated ? 'Sign Out' : 'Sign In'),
            div('.or', [h1('or')]),
            button({ sel: 'btnsignup' }, 'sign up'),
            h1('button signin is clicked : ' + state.signin + " and sign up : " + state.signup)
          ]),
          div('.mid.row.col.go', [
            h1('number of users :' + state.userlist.length)
          ])
          // <a href="info">more info</a>
        ]),

        ul(

          !!state.userlist.length && state.userlist.map((item) => li(item))

        )
      ])

    );
    return vdom$
}

function gunTodo(clickevents$, state$){
  // sink map filtered stream of payloads into function and emit function
  const outgoingGunEvents$ = clickevents$
    .compose(sampleCombine(state$))
    .map(([click, state]) => {
      console.log("click = ", click)
      console.log("state = ", state)
      if (click.typeKey === 'signin') {
        return (gunInstance) => {
          if (state.authenticated) {
            return gunInstance.user().auth(state.stageName, state.password, ack => {
              if (ack.err) {
                console.log('auth err', ack.err);
                return;
              } else {
                console.log('auth OK, set userlist');
                const myself = gunInstance.get(state.stageName).put({ stageName: state.stageName })
                gunInstance.get('userlist').set({ realid: myself._, stageName: state.stageName })
                gunInstance.get('signstatus').put({ stageName: state.stageName, signin: true })

              }
            })
          } else {
            const myself = gunInstance.get(state.stageName).put({ stageName: state.stageName })
            gunInstance.get('userlist').unset(myself)
            gunInstance.get('signstatus').put({ stageName: state.stageName, signin: false })
            return gunInstance.user().leave()
          }
        }
      }

      if (click.typeKey === 'signup') {
        return (gunInstance) => {
          return gunInstance.user().create(state.stageName, state.password, ack => {
            if (ack.err) {
              console.log('create user failed', ack.err);
              return;
            } else {
              console.log('create user OK, set userlist', ack.err);
            }
          })
        };
      }

    });
  return outgoingGunEvents$
}

export function SignIn(sources) {
  const { DOM, gun } = sources;
  console.log('sources.gun', gun)

  const gunEvents = gunIntent(gun);
  const events = Intent(DOM);

  const state$ = model(gunEvents, events)

  const vdom$ = view(state$)
  const outgoingGunEvents$ = gunTodo(events.clickevents$, state$)

  const sinks = {
    DOM: vdom$,
    value: state$,
    gun: outgoingGunEvents$
  }
  return sinks;

}
