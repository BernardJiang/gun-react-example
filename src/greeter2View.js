import React, { Component }  from 'react'
import './style.css'
import Entity from './Entity';
import { div, form, ul, h1, input, button } from '@cycle/react-dom';
import xs from 'xstream';

export function greeter2View(name) {
    return div([
      h1(name ? 'Welcominggg e, ' + name : 'What\'s your ffk name?'),
      input({ sel: 'greeter2namewwww', type: 'text' })
    ])
  }

export function greeterComponent(sources) {
    // const input$ = sources.DOM
    //   .select('greeterComponent')
    //   .events('input')
    //   .map(ev => { 
    //     console.log(" greeter input ev=", ev);
    //     return ev.target.value
    //   });

    // const initialValue$ = sources.props$.map(props => props.initial).take(1);
    // const newValue$ = input$.map( v => { return { value: v.target.value, label: v.target.value} }); 
    // const state$ = xs.merge(initialValue$, newValue$).remember();
    const domSource = sources.DOM;
    const props$ = sources.props$;

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
            input({ sel: 'greeterComponent', type: 'text', value: state.value })
          ])
        );
    const sinks = {
        DOM: vdom$,
        value: state$.map(state => state.value)
    }
    return sinks;
  }
  