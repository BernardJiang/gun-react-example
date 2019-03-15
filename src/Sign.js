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
    this.state = {name: 'alias', password: 'unsafe'}
  }

  componentWillMount() {
    // this.gun.on(todos => this.setState({
    //   todos: formatTodos(todos)
    // }))
  }

//   add = e => {
//     e.preventDefault()
//     this.gun.path(Gun.text.random()).put(this.state.newTodo)
//     this.setState({newTodo: ''})
//   }

 session = () => {
  if(!sessionStorage){ return }
  sessionStorage.alias = this.state.name;
  sessionStorage.tmp = this.state.password;
 }

  signup = async e => {
    e.preventDefault()
    // this.gun.path(Gun.text.random()).put(this.state.newTodo)'
    console.log("create", "user="+this.state.name + "pwd=" + this.state.password);
    var ack = await this.entity.createUser(this.state.name, this.state.password);
    var ack = await this.entity.auth(this.state.name, this.state.password);
    console.log(ack);
    // this.setState({name: '', password: ''})
    console.log("dbg", "signup");
  }

  signin = async e => {
    e.preventDefault()
    // this.gun.path(Gun.text.random()).put(this.state.newTodo)
    var ack = this.entity.auth(this.state.name, this.state.password)    
    // console.log(ack);
        // this.setState({name: '', password: ''})
    console.log("dbg", "signin 2");
    this.entity.usercount();
  }

//   del = key => this.gun.path(key).put(null)

//   handleChange = e => this.setState({ newTodo: e.target.value})
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
					<button class="huet sap act symbol" onClick={this.signin} >sign in</button>
					<div class="or">or</div>
					<button class="huet sap act symbol" onClick={this.signup} >sign up</button>
				</div>
				<a href="info">more info</a>
			</form>
		</div>

  }




}

