import React, { Component }  from 'react'
import Gun from 'gun/gun'

const formatMsgs = msgs => Object.keys(msgs)
  .map(key => ({ key, ...msgs[key] }))
  .filter(m => Boolean(m.when) && m.key !== '_')
  .sort((a, b) => a.when - b.when)
  .map(m => ((m.whenFmt = new Date(m.when).toLocaleString().toLowerCase()), m))

export default class Chat extends Component {
  constructor({gun}) {
    super()
    this.user = gun.user();
    this.gun = gun.get('chat');
    this.state = {
      newMsg: '',
      name: (document.cookie.match(/alias\=(.*?)(\&|$|\;)/i)||[])[1]||'',
      msgs: {},
    }
  }
  componentWillMount() {
    if(this.gun == null)
       return
    const tmpState = {}
    this.gun.map().val((msg, key) => {
      tmpState[key] = msg
      this.setState({msgs: Object.assign({}, this.state.msgs, tmpState)})
    })

  }
  send = e => {
    e.preventDefault()
    
    if(!this.user.is){ 
      console.log("err", "Sign in first!!");
      return 
    }else{
      const tmpState = {}
      // this.gun = this.get('chat');
      this.gun.map().val((msg, key) => {
        tmpState[key] = msg
        this.setState({msgs: Object.assign({}, this.state.msgs, tmpState)})
      })
     
    }
    
    this.user.recall().then( ack=> {
      const who = ack.alias;
      console.log(who);      
      this.setState({name: who})
      document.cookie = ('alias=' + who) 
      const when = Gun.time.is()
      const key = `${when}_${Gun.text.random(4)}`
      this.gun.path(key).put({
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
