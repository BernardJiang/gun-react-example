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
  }
  componentWillMount() {
    if(this.entity == null)
       return
    const tmpState = {}
    this.entity.chat.map().val((msg, key) => {
      tmpState[key] = msg
      this.setState({msgs: Object.assign({}, this.state.msgs, tmpState)})
    })

  }
  send = e => {
    e.preventDefault()
    
    if(!this.entity.user.is){ 
      console.log("err", "Sign in first!!");
      return 
    }else{
      const tmpState = {}
      // this.gun = this.get('chat');
      this.entity.chat.map().val((msg, key) => {
        console.log("chat", key)
        console.log("chat", msg)
        tmpState[key] = msg
        this.setState({msgs: Object.assign({}, this.state.msgs, tmpState)})
      })
     
    }
    
    this.entity.user.recall().then( ack=> {
      const who = ack.alias;
      console.log(who);      
      this.setState({name: who})
      document.cookie = ('alias=' + who) 
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
