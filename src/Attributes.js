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
      question: '',
      answer: '',
      options: '',
      msgs: {},
    }
  }
  
  componentDidMount() {
    this.entity && this.entity.onAttributesChange(this.updateUIAttributes)   
  }

  componentWillUnmount() {
    this.entity && this.entity.onAttributesChange(null)   
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
  handleQuestionChange = (event) => {
    console.log("handleQuestionChange", event);
    this.setState({question: event.target.value});
  }

  handleAnswerChange = (event) => {
    console.log("handleAnswerChange", event);
    this.setState({answer: event.target.value});
  }
  handleOptionsChange = (event) => {
    console.log("handleOptionsChange", event);
    this.setState({options: event.target.value});
  }

  handleChange = (event) => {
    console.log("handleOptionsChange", event);
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit = (event) => {
    // console.log("Attributes", 'question: ' + this.state.question);
    // console.log("Attributes", 'answer: ' + this.state.answer);
    // console.log("Attributes", 'options: ' + this.state.options);
    event.preventDefault();
    this.entity.addNewAttribute({ question: this.state.question, answer: this.state.answer, options: this.state.options})
  }

  render() {
    
    const msgs = formatMsgs(this.state.msgs)
    // console.log("attri:", "total attrs=" +Object.keys(this.state.msgs) + " .... msgs = " + Object.keys(msgs))
    //  msgs.forEach(a => {
    //     console.log("Bernard", "msg=" + a.message + '. bot='+ a.bot)
    //     console.log(a.message, a)
    //   })
    return <div>
        Attributes for {this.state.stageName}
        <form onSubmit={this.handleSubmit}>
          <label>
            Type a question that ends with a ?:
            <input type="text" value={this.state.question} name="question" onChange={this.handleChange} />
            Answer and other options in format o1; o2; o3. 
            <input type="text" value={this.state.answer} name="answer" onChange={this.handleChange} />
            <input type="text" value={this.state.options} name="options" onChange={this.handleChange} />
            {/* Options:
            <select value={this.state.value} onChange={this.handleChange}>
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option value="coconut">Coconut</option>
            <option value="mango">Mango</option>
          </select> */}
          </label>
          <input type="submit" value="Submit" />
      </form>
      <ul>
        {msgs.map(msg =>
          <li key={msg.message}><b> Q: {msg.message} </b> A: { "answer" in msg ? msg.answer : ""}<span className="when">{msg.whenFmt}</span></li>
        )}
      </ul>
    </div>
  }
}
