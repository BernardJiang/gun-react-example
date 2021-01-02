import styled from 'styled-components';
import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import sampleCombine from 'xstream/extra/sampleCombine';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Random from 'random-id';
// import { CustomStep, OptionsStep, TextStep } from './steps_components';
// import schema from './schemas/schema';
// import * as storage from './storage';
// import { Entity } from '../../Entity'
import { set } from 'lodash';
import { div, form, ul, li, h1, input, button, p } from '@cycle/react-dom';


function entityIntent(entity) {
  const userAttributeList$ = entity.getAttributeList()
    .startWith({ attributeList: [] })
    .compose(dropRepeats());

  return {userAttributeList$}
}

function Intent(DOM) {
  
  const clickevents$ = DOM
    .select('btnattrdel')
    .events('click')
    .map(ev => {
      console.log("Clicked Delete 1!")
      return { typeKey: 'btnattrdel', pos: 1 }
    }).startWith({ typeKey: 'noclick' });

  return { clickevents$ }
}

function model(entityEvents, events) {
  const state$ = xs.merge(entityEvents.userAttributeList$)
    .fold((acc, x) => { return { ...acc, ...x } }, {})
    .startWith({ attributeList: [] })
  return state$
}

function view(state$) {
  const vdom$ = state$
    .map( state => {
      // console.log("state=", state)
      return div('.mid.row.col.go', [
        !!state.attributeList && Object.values(state.attributeList).sort((a, b) => (a.when < b.when) ? 1 : -1).map((item, id) => {
          const oparr = []
          if (item.oplen != 0 ){
            var i;
            for (i=0; i<item.oplen; i++){
              oparr.push( p( item['op'+i] + ';'))
            }
          }
          return div('.bd.rowC', {key: id}, [
            p( new Date(item.when).toLocaleString().toLowerCase()),
            p(item.message + '?'),
            ...oparr,
            p(item.answer + '.'),
            div('.mr', [
              button({ sel: 'btnattrdel' }, 'x')
            ])
          ])
        })
      ])   
    });
  return vdom$
}

function entityTodo(clickevents$, state$) {
  // sink map filtered stream of payloads into function and emit function
  const outgoingEntityEvents$ = clickevents$
  .compose(sampleCombine(state$))
    .map( ([click, state]) => {
      // console.log("ENTITY todo state=", state)
      // console.log("ENTITY click=", click)
      // if (state.userinput && state.authenticated) {
        if (click.typeKey === 'btnattrdel') {
          return {action: 'btnattrdel', userinput: state.userinput, stageName: state.stageName, pos: click.pos}
        }
      // } else {
      //   console.log("either no content or not signed in");      
      // }
    });
  return outgoingEntityEvents$
}

function AttributeList(sources) {
  const { DOM, entity } = sources;
  const entityEvents = entityIntent(entity);
  const events = Intent(DOM);
  const state$ = model(entityEvents, events)
  const outgoingEntityEvents$ = entityTodo(events.clickevents$, state$)
  const vdom$ = view(state$)
  const sinks = {
    DOM: vdom$,
    value: state$,
    entity: outgoingEntityEvents$
  }
  return sinks;
}

export default AttributeList;


