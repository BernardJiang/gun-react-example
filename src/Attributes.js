import React, { Component }  from 'react'
import Entity from './Entity'

const formatMsgs = msgs => Object.keys(msgs)
  .map(key => ({ ...msgs[key] }))
  .filter(m => Boolean(m.when) && m.key !== '_')
  .sort((a, b) => - a.when + b.when)
  .map(m => ((m.whenFmt = new Date(m.when).toLocaleString().toLowerCase()), m))


  
export default class Attributes extends Component {
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
    this.entity && this.entity.onAttributesChange(this.updateUIAttributes)   
  }

  updateUIAttributes =  obj => {
    this.setState(obj);
  }

  //Not in use yet.
  // send = e => {
  //   e.preventDefault()
  //   // console.log("dbg", "Calling send!");
    
  //   if(!this.entity.isUserOnline()){ 
  //     console.log("err", "Sign in first!!")
  //     return 
  //   }else{
  //     this.entity.onChatMessage(this.updateUI)   
  //   }
  //   // console.log("dbg", "Calling recall!");

  //   this.entity.user.recall().then( ack=> {
  //     const who = ack.alias;
  //     // console.log(who);      
  //     this.setState({name: who})
  //     // document.cookie = ('alias=' + who)
  //     // console.log("zzz", document.cookie); 
  //     // console.log("zzz", this.state.name); 
  //     const when = Entity.time()
  //     const key = `${when}_${Entity.random()}`
  //     this.entity.saveMessage(key, {
  //       who,
  //       when,
  //       message: this.state.newMsg,
  //     })

  //     this.setState({newMsg: ''})
  //   });

  // }

  render() {
    
    const msgs = formatMsgs(this.state.msgs)
    // console.log("attri:", "total attrs=" +Object.keys(this.state.msgs) + " .... msgs = " + Object.keys(msgs))
    //  msgs.forEach(a => {
    //     console.log("Bernard", "msg=" + a.message + '. bot='+ a.bot)
    //     console.log(a.message, a)
    //   })
    return <div>
          Attributes for {this.state.stageName}
      <ul>
        {msgs.map(msg =>
          <li key={msg.message}><b> Q: {msg.message} </b> A: { "answer" in msg ? msg.answer : ""}<span className="when">{msg.whenFmt}</span></li>
        )}
      </ul>
    </div>
  }
}
