import React, { Component }  from 'react'
import './style.css'
import Entity from './Entity';
import { div, form, ul, h1, input, button } from '@cycle/react-dom';

export function greeter2View(name) {
    return div([
      h1(name ? 'Welcominggg e, ' + name : 'What\'s your ffk name?'),
      input({ sel: 'greeter2namewwww', type: 'text' })
    ])
  }

export function greeterComponent(sources) {
    const domSource = sources.react;
    const props$ = sources.props;

    const input$ = domSource
      .select('greeterComponent')
      .events('input')
      .map(ev => { 
        console.log(" greeter input ev=", ev);
        return ev.target.value
      });

    const state$ = props$
        .map( props => input$
            .map( val => ({
                label: props.label,
                value: val
            })) 
            .startWith(props)
            )
        .flatten()
        .remember();  

    const vdom$ = state$
       .map( state => 
           div([
            h1('Welcome, ' + state.lable ),
            input({ sel: 'namecomp', type: 'text', value: state.value })
          ])
        );
    const sinks = {
        react: vdom$,
        value: state$.map(state => state.value)
    }
    return sinks;
  }
  