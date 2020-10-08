import React, { Component }  from 'react'
import ReactDOM from 'react-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import Entity from './Entity'

const formatMsgs = msgs => Object.keys(msgs)
  .map(key => ({ ...msgs[key] }))
  .filter(m => Boolean(m.when) && m.key !== '_')
  .sort((a, b) => - a.when + b.when)
  .map(m => ((m.whenFmt = new Date(m.when).toLocaleString().toLowerCase()), m))


cytoscape.use( dagre );  

export default class Talks extends Component {
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
    };
    this.cy = '';
  }
  
  componentDidMount() {
    this.entity && this.entity.onTalksChange(this.updateUITalks) 
    // cytoscape.use( dagre );  
  }

  updateUITalks =  obj => {
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
    this.entity.addNewTalk({ question: this.state.question, answer: this.state.answer, options: this.state.options})
  }

  render() {
    const elements = [
      { data: { id: 'n1', label: 'question 1' }  },
      { data: { id: 'n2', label: 'question 2' }  },
      { data: { id: 'n3', label: 'question 3' }  },
      { data: { id: 'n4', label: 'question 4' }  },
      { data: { id: 'n5', label: 'question 5' }  },
      { data: { id: 'n6', label: 'question 6' }  },
      { data: { source: 'n1', target: 'n2', label: 'E12' } },
      { data: { source: 'n2', target: 'n3', label: 'E23' } },
      { data: { source: 'n3', target: 'n4', label: 'E34' } },
      { data: { source: 'n3', target: 'n5', label: 'E35' } },
      { data: { source: 'n3', target: 'n6', label: 'E36' } },
   ];
   const stylesheet = [
    {
      selector: 'node',
      style: {
        width: 80,
        height: 15,
        shape: 'rectangle',
        'background-fit': 'cover',
        'border-color': '#000',
        'border-width': 3,
        'border-opacity': 0.5,
        'content': 'data(label)',
        'text-valign': 'center',
      }
    },
    {
      selector: 'edge',
      style: {
        width: 3,
        'target-arrow-shape': 'triangle',
        'line-color': '#ffaaaa',
        'target-arrow-color': '#ffaaaa',
        'curve-style': 'bezier',
        'content': 'data(label)'
      }
    }
  ];

  //  cytoscape.use( dagre );
   const layout = { name: 'dagre' };

    const msgs = formatMsgs(this.state.msgs)
    // console.log("attri:", "total attrs=" +Object.keys(this.state.msgs) + " .... msgs = " + Object.keys(msgs))
    //  msgs.forEach(a => {
    //     console.log("Bernard", "msg=" + a.message + '. bot='+ a.bot)
    //     console.log(a.message, a)
    //   })
    return <div>
        Talk for  {this.state.stageName}
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
      <CytoscapeComponent   stylesheet={stylesheet} elements={elements} style={ { width: '1200px', height: '800px' } } layout={layout} cy={(cy) => { this.cy = cy }}/>
      <ul>
        {msgs.map(msg =>
          <li key={msg.message}><b> Q: {msg.message} </b> A: { "answer" in msg ? msg.answer : ""}<span className="when">{msg.whenFmt}</span></li>
        )}
      </ul>
    </div>
  }
}
