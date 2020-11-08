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
  