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

  render() {
    const msgs = formatMsgs(this.state.msgs)
    return <div>
          Settings
      <ul>
        {msgs.map(msg =>
          <li key={msg.key}><b> Q: {msg.message} </b> A: {msg.answer}<span className="when">{msg.whenFmt}</span></li>
        )}
      </ul>
    </div>
  }
}
