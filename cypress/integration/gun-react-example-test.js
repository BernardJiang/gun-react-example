// import xs from 'xstream'
// import {mount} from 'cypress-cycle-unit-test'
// import App from '../../src/App';
// import { makeDOMDriver } from "@cycle/react-dom";
// import {makeHashHistoryDriver} from '@cycle/history';
// import { makeGunDriver } from '../../src/cyclegun';

describe('Sign up then sign in', function() {
    // beforeEach(() => {
    //     const drivers = {
    //             react: makeDOMDriver(document.getElementById("root")),
    //             history: makeHashHistoryDriver(),
    //             gun: makeGunDriver({root: 'root', peers: ['http://localhost:8765/gun']})
    //     }
    //     mount(App, drivers)
    //   })

    function addUser(username, userpassword) {
      cy.get('#sign > #inup > :nth-child(1) > .huet')
        .clear()
        .type(username)
        .should('have.value', username)

      cy.get('#sign > #inup > :nth-child(2) > .huet')
        .clear()
        .type(userpassword)
        .should('have.value', userpassword)

      cy.get('#inup > :nth-child(3) > :nth-child(3)')
        .click()
      
        cy.wait(1000)

      cy.get('#inup > :nth-child(3) > :nth-child(1)')
        .should('contain','Sign In')
        .click()
        .should('contain','Sign Out')
        cy.wait(500)

        cy.get('#inup > :nth-child(3) > :nth-child(1)')
        .should('contain','Sign Out')
        .click()
        .should('contain','Sign In')
        cy.wait(500)

    }

    function signInUser(username, userpassword) {
      cy.get('#sign > #inup > :nth-child(1) > .huet')
        .clear()
        .type(username)
        .should('have.value', username)

      cy.get('#sign > #inup > :nth-child(2) > .huet')
        .clear()
        .type(userpassword)
        .should('have.value', userpassword)

      cy.get('#inup > :nth-child(3) > :nth-child(1)')
        .should('contain','Sign In')
        .click()
        .should('contain','Sign Out')

    }

    it('Visits local host', function() {
      let waittime = 2000
      cy.visit('http://localhost:3000')
      
      .get('#signin').click().wait(waittime)
      .get('#divSign').should('be.visible')
      
      .get('#Settings').click().wait(waittime)
      .get('#divSettings').should('be.visible')
      
      .get('#Attributes').click().wait(waittime)
      .get('#divAttributes').should('be.visible')
      .get('#Talks').click().wait(waittime)
      .get('#divTalks').should('be.visible')
      .get('#Chatbot').click().wait(waittime)
      .get('#divChatbot').should('be.visible')
      .get('#Greeter').click().wait(waittime)
      .get('#divGreeter').should('be.visible')
    //   addUser('a', 'a')
    //   addUser('b', 'b')
    //   addUser('c', 'c')
    //   addUser('d', 'd')
    //   signInUser('a', 'a')
    //   cy.get('.rsc-input').clear().type('Q1?').should('have.value', 'Q1?')

    })

    // it.only('Ask a question, then answer it', function() {
    //   cy.visit('http://localhost:3000')
    // //   signInUser('a', 'a')
    // //   cy.get('.rsc-input')
    // //     .clear()
    // //     .type('Q1?')
    // //     .should('have.value', 'Q1?')
    // //     .type('{enter}')
    // //     .should('have.value', '')

    // })


  })