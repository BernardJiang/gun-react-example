import React, { Component }  from 'react'
import './style.css'
import Entity from './Entity';
import { div, form, ul, h1, input, button } from '@cycle/react-dom';

export default class Sign extends Component {
  constructor({entity}) {
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
    if(!sessionStorage){ return }
    sessionStorage.alias = this.state.stageName;
    sessionStorage.tmp = this.state.password;
  }

  signup = async e => {
    e.preventDefault()
    
    var ack = await this.entity.create(this.state.stageName, this.state.password);
    if(ack)
       ack = await this.entity.auth(this.state.stageName, this.state.password);
  }
  
  updateUISign = obj => {
    this.setState(obj);
  }

  signin = async e => {
    e.preventDefault()
    if(this.state.authenticated)
      this.entity.leave(this.state.stageName, this.state.password)
    else
      this.entity.auth(this.state.stageName, this.state.password) 
  }

  handlestageNameChange = e => this.setState({ stageName: e.target.value})
  handlePasswordChange = e => this.setState({ password: e.target.value})

  render() {
    return <div id="sign" className="hue page">
			<form id="inup" className="sign pad center" onSubmit={this.signin}>
				<div className="mid row col">
					<input value={this.state.stageName} className="huet jot sap" type="text" placeholder="alias" onChange={this.handlestageNameChange}/>
					Enter your stageName.
				</div>
				<div className="mid row col">
					<input value={this.state.password} className="huet jot sap" type="password" placeholder="password" onChange={this.handlePasswordChange}/>
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

export function signIn(state) {
  return div('.hue.page', [
    form('#inup.sign.pad.center',[
      div('.mid.row.col',[
        h1('Enter your stageName: ' + state.stageName),
        input({sel: 'stagenameinput',  type: '"text', placeholder: 'alias'})
      ]),
      div('.mid.row.col',[
        h1('And a long private passphrase.'),
        input('.huet.jot.sap', {sel: 'password', type: 'password', placeholder: 'password'})      
      ]),
      div('.mid.row.col.go',[
         button('.huet.sap.act.symbol', state.authenticated ? 'Sign Out' : 'Sign In'),
         div('.or', [ h1('or') ]),
         button('.huet.sap.act.symbol', 'sign up')
      ]),
      div('.mid.row.col.go', [
         h1('number of users : {state.mencnt}')
      ])
      // <a href="info">more info</a>
    ]),

    ul(
    //   {
    //     !!state.userlist.length && state.userlist.map((item) => <li key={item.key}>* {item.text}</li>)          
    //   }
    // </ul>
    )
  ])

}


