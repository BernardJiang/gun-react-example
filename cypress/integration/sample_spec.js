describe('Sign up then sign in', function() {
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
      cy.visit('http://localhost:3000')
      addUser('a', 'a')
      addUser('b', 'b')
      addUser('c', 'c')
      addUser('d', 'd')
      signInUser('a', 'a')
      cy.get('.rsc-input').clear().type('Q1?').should('have.value', 'Q1?')

    })

    it.only('Ask a question, then answer it', function() {
      cy.visit('http://localhost:3000')
      signInUser('a', 'a')
      cy.get('.rsc-input')
        .clear()
        .type('Q1?')
        .should('have.value', 'Q1?')
        .type('{enter}')
        .should('have.value', '')

        cy.get('.rsc-input')
        .clear()
        .type('A1.')
        .should('have.value', 'A1.')
        .type('{enter}')
        .should('have.value', '')
        
    })


  })