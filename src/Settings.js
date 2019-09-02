import React, { Component }  from 'react'
import Entity from './Entity'

const formatMsgs = msgs => Object.keys(msgs)
  .map(key => ({ ...msgs[key] }))
  .filter(m => Boolean(m.when) && m.key !== '_')
  .sort((a, b) => - a.when + b.when)
  .map(m => ((m.whenFmt = new Date(m.when).toLocaleString().toLowerCase()), m))
  
export default class Settings extends Component {
  constructor({entity}) {
    super()
    this.entity = entity;
    this.state = {
      newMsg: '',
      stageName: '', //(document.cookie.match(/alias\=(.*?)(\&|$|\;)/i)||[])[1]||'',
      msgs: {},
    }
  } 
   
  componentWillMount() {
    this.entity && this.entity.onSettingsChange(this.updateUISettings)   
  }

  updateUISettings =  obj => {
    this.setState(obj);
  }
  
  onSubmitForm = async e => {
    e.preventDefault()
  }
  handlestageNameChange = e => this.setState({ stageName: e.target.value})

  render() {
    // const msgs = formatMsgs(this.state.msgs)

    return <div>
          Settings

          <form id="inup" className="sign pad center" onSubmit={this.onSubmitForm}>
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
          <div> mencnt : {this.state.mencnt}</div>
				</div>
				<a href="info">more info</a>
			</form>

      <ul>
        {/* {msgs.map(msg =>
          <li key={msg.key}><b> Q: {msg.message} </b> A: {msg.answer}<span className="when">{msg.whenFmt}</span></li>
        )} */}
      <li> <b> StageName: A </b> </li>
      <li> <b> Avatar: Avatar </b> </li>

      </ul>
    </div>
  }
}
