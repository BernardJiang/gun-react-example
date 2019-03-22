import React, { Component }  from 'react'
// import Gun from 'gun/gun'
import path from 'gun/lib/path'
import './style.css'
// import Sea from 'gun/sea' 
import Entity from './Entity';
// import as from 'gun/as'
// import nts from 'gun/nts'

// const formatToSign = todos => Object.keys(todos)
//   .map(key => ({ key, val: todos[key] }))
//   .filter(t => Boolean(t.val) && t.key !== '_')

export default class Sign extends Component {
  constructor({entity}) {
    super()
    this.entity = entity;
    this.state = {
      name: 'alias', 
      password: 'unsafe', 
      authenticated: false, 
      userlist: {},
      mencnt: 0}
  }

  componentWillMount() {
    this.entity.hookUserList(this.updateUI);
  }

  componentWillUnmount() {
    this.entity.leave(this.state.name, this.state.password, this.updateSignStatus)
  }

 session = () => {
  if(!sessionStorage){ return }
  sessionStorage.alias = this.state.name;
  sessionStorage.tmp = this.state.password;
 }

  signup = async e => {
    e.preventDefault()
    
    console.log("create", "user="+this.state.name + "pwd=" + this.state.password);
    var ack = await this.entity.create(this.state.name, this.state.password);
    var ack = await this.entity.auth(this.state.name, this.state.password);
    console.log(ack);
    console.log("dbg", "signup");
  }
  updateUI = (obj ) => {
    console.log("updateUI", "online user count=" + obj.list.length);
    this.setState({
      userlist: obj.list || [],
      mencnt : obj.list.length
    });
  }

  updateSignStatus = (InOrOut) => {
    this.setState({authenticated: InOrOut});
  }
  
  signin = async e => {
    e.preventDefault()
    if(this.state.authenticated)
      this.entity.leave(this.state.name, this.state.password, this.updateSignStatus)
    else
      this.entity.auth(this.state.name, this.state.password, this.updateSignStatus) 
  }

  handleNameChange = e => this.setState({ name: e.target.value})
  handlePasswordChange = e => this.setState({ password: e.target.value})

  render() {
    return <div id="sign" class="hue page">
			<form id="inup" class="sign pad center" onSubmit={this.signin}>
				<div class="mid row col">
					<input value={this.state.name} class="huet jot sap" type="text" placeholder="alias" onChange={this.handleNameChange}/>
					Enter your name.
				</div>
				<div class="mid row col">
					<input value={this.state.password} class="huet jot sap" type="password" placeholder="password" onChange={this.handlePasswordChange}/>
					And a long private passphrase.
				</div>
				<div class="mid row col go">
					<button class="huet sap act symbol" onClick={this.signin} > {this.state.authenticated ? 'Sign Out' : 'Sign In'} </button>
					<div class="or">or</div>
					<button class="huet sap act symbol" onClick={this.signup} >sign up</button>
				</div>
				<div class="mid row col go">
          <div> mencnt : {this.state.mencnt}</div>
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

