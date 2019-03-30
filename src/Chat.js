import React, {
  Component
} from 'react'
import Entity from './Entity'

const formatMsgs = msgs => Object.keys(msgs)
  .map(key => ({
    key,
    ...msgs[key]
  }))
  .filter(m => Boolean(m.when) && m.key !== '_')
  .sort((a, b) => -a.when + b.when)
  .map(m => ((m.whenFmt = new Date(m.when).toLocaleString().toLowerCase()), m))

export default class Chat extends Component {
  constructor({
    entity
  }) {

    super()
    this.entity = entity;
    this.state = {
      newMsg: '',
      name: '', //document.cookie.match(/alias\=(.*?)(\&|$|\;)/i)||[])[1]||'',
      msgs: {},
    }
  }

  componentWillMount() {
    if (this.entity == null)
      return
    this.entity.onChatMessage(this.updateUIChat)
  }

  updateUIChat = obj => {
    this.setState(obj);
  }

  send = e => {
    e.preventDefault()

    if (!this.state.name) {
      console.log("err", "Sign in first!!")
      return
    }

    const when = Entity.time()
    const key = `${when}_${Entity.random()}`
    this.entity.saveMessage(key, {
      who: this.state.name,
      when,
      what: this.state.newMsg,
    })

    this.setState({
      newMsg: ''
    })
  }

  render() {
    const msgs = formatMsgs(this.state.msgs)
    return <div>
      <form onSubmit={this.send}>
      <input value={this.state.name} className="who" onChange={e => this.setState({ name: e.target.value})} />
      <input value={this.state.newMsg} className="what" onChange={e => this.setState({ newMsg: e.target.value})} />
      <button onClick={this.send}>Send</button>
      </form>
      <ul>
        {msgs.map(msg =>
          <li key={msg.key}><b>{msg.who}:</b> {msg.what}<span className="when">{msg.whenFmt}</span></li>
        )}
      </ul>
    </div>
  }
}
