import React, { Component }  from 'react'
// import Gun from 'gun/gun'
import Entity from './Entity'

const formatMsgs = msgs => Object.keys(msgs)
  .map(key => ({ key, ...msgs[key] }))
  .filter(m => Boolean(m.when) && m.key !== '_')
  .sort((a, b) => a.when - b.when)
  .map(m => ((m.whenFmt = new Date(m.when).toLocaleString().toLowerCase()), m))

export default class Chat extends Component {
  constructor({entity}) {

    super()
    this.entity = entity;
    this.state = {
      newMsg: '',
      name: (document.cookie.match(/alias\=(.*?)(\&|$|\;)/i)||[])[1]||'',
      msgs: {},
    }
    // console.log("dbg", "Calling constructor!");
    
  }
  componentWillMount() {
    // console.log("dbg", "Calling componentWillMount!");
    if(this.entity == null)
       return
    // this.entity.onChatMessage(this.setState)   
    const tmpState = {}
    this.entity.chat.map().once((msg, key) => {
      tmpState[key] = msg
      this.setState({msgs: Object.assign({}, this.state.msgs, tmpState)})
    })

  }
  send = e => {
    e.preventDefault()
    // console.log("dbg", "Calling send!");
    
    if(!this.entity.isUserOnline()){ 
      console.log("err", "Sign in first!!")
      return 
    }else{
      // this.entity.onChatMessage(this.setState)   
      
      const tmpState = {}
      // this.gun = this.get('chat');
      this.entity.chat.map().once((msg, key) => {
        // console.log("chat", key)
        // console.log("chat", msg)
        tmpState[key] = msg
        this.setState({msgs: Object.assign({}, this.state.msgs, tmpState)})
      })
     
    }
    // console.log("dbg", "Calling recall!");

    this.entity.user.recall().then( ack=> {
      const who = ack.alias;
      // console.log(who);      
      this.setState({name: who})
      document.cookie = ('alias=' + who)
      // console.log("zzz", document.cookie); 
      // console.log("zzz", this.state.name); 
      const when = Entity.time()
      const key = `${when}_${Entity.random()}`
      this.entity.saveMessage(key, {
        who,
        when,
        what: this.state.newMsg,
      })

      this.setState({newMsg: ''})
    });

  }
  render() {
    // console.log("dbg", "Calling render!");

    const msgs = formatMsgs(this.state.msgs)
    return <div>
      <ul>
        {msgs.map(msg =>
          <li key={msg.key}><b>{msg.who}:</b> {msg.what}<span className="when">{msg.whenFmt}</span></li>
        )}
      </ul>
      <form onSubmit={this.send}>
      <input value={this.state.name} className="who" onChange={e => this.setState({ name: e.target.value})} />
      <input value={this.state.newMsg} className="what" onChange={e => this.setState({ newMsg: e.target.value})} />
      <button onClick={this.send}>Send</button>
      </form>
    </div>
  }
}
