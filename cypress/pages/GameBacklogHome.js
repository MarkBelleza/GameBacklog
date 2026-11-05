class GameBacklogHome {

    // Locators
    searchField = '.search-input';
    searchButton = '.search-game-btn';
    gameCardName = '.game-card .game-info h3';
    gameCard = '.game-card';
    gamesGrid = '.games-grid';
    loadingMessage = 'p:contains("Loading games...")';


    // Actions
    searchGame(gameName) {
        this.verifyGameCardsVisible();

        cy.get(this.searchField)
            .should('be.visible')
            .type(gameName);

        cy.get(this.searchButton)
            .should('be.visible')
            .click();
    }


    // Verification
    verifyGame(gameName) {
        this.verifyGameCardsVisible();

        cy.get(this.gameCardName)
            .filter((index, element) => {
                return element.innerText.trim() === gameName;
            })
            .should('have.length', 1);

        // cy.get(this.gameCardName).each((element) => {
        //     if (element.text().trim() === gameName) {
        //         cy.wrap(element).should('be.visible');
        //     }
        // });
    }

    verifyGameNotPresent(gameName) {
        this.verifyGameCardsVisible();

        cy.get(this.gameCardName)
            .filter((index, element) => {
                return element.innerText.trim() === gameName
            }).should('have.length', 0);

    }


    verifyNoGameCardsVisible() {
        cy.get(this.loadingMessage)
            .should('not.exist');

        cy.get(this.gamesGrid)
            .should('be.visible');

        cy.get(this.gameCard)
            .should('not.exist');
    }


    verifyGameCardsVisible() {
        cy.get(this.loadingMessage)
            .should('not.exist');

        cy.get(this.gameCard)
            .should('be.visible');
    }
}

export default GameBacklogHome;