import React, { Component }  from 'react'
import Gun from 'gun/gun'
import path from 'gun/lib/path'
import './style.css'
import Sea from 'gun/sea' 
// import as from 'gun/as'
// import nts from 'gun/nts'

// const formatToSign = todos => Object.keys(todos)
//   .map(key => ({ key, val: todos[key] }))
//   .filter(t => Boolean(t.val) && t.key !== '_')

export default class Sign extends Component {
  constructor({gun}) {
    super()
    this.gun = gun.get('sign');
    this.user = gun.user();
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
  sessionStorage.alias = this.state.stagename;
  sessionStorage.tmp = this.state.password;
 }

  signup = e => {
    e.preventDefault()
    // this.gun.path(Gun.text.random()).put(this.state.newTodo)'
    console.log("create", "user="+this.state.stagename + "pwd=" + this.state.password);

    this.user.create(this.state.stagename, this.state.password, ack => {
      // if(!ack.wait){ but.removeClass('pulse') }
      if(ack.err){ console.log(ack.err); return }
      if(ack.pub){
        console.log("pub", "succeeded");
        this.user.get(this.state.stagename).put(this.gun.get('~@'+this.state.stagename));
        this.user.get("stagename").put(this.state.stagename);
      }
      
      this.session();
      this.user.auth(this.state.stagename, this.state.password);
    });
    // this.setState({stagename: '', password: ''})
    console.log("dbg", "signup");
  }

  signin = e => {
    e.preventDefault()
    // this.gun.path(Gun.text.random()).put(this.state.newTodo)
    this.user.auth(this.state.stagename, this.state.password, ack => {
      console.log("signin", ack);
    });
    
    // this.setState({stagename: '', password: ''})
    console.log("dbg", "signin");
  }

//   del = key => this.gun.path(key).put(null)

//   handleChange = e => this.setState({ newTodo: e.target.value})
  handleStageNameChange = e => this.setState({ stagename: e.target.value})
  handlePasswordChange = e => this.setState({ password: e.target.value})

  render() {
    return <div id="sign" class="hue page">
			<form id="inup" class="sign pad center" onSubmit={this.signin}>
				<div class="mid row col">
					<input value={this.state.stagename} class="huet jot sap" type="text" placeholder="alias" onChange={this.handleStageNameChange}/>
					Enter your stagename.
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

