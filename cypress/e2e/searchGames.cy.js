import GameBacklogHome from '../pages/GameBacklogHome';

describe('Search Games', () => {

    const home = new GameBacklogHome();

    beforeEach(() => {
        cy.visit('/'); //Use the baseUrl defined in cypress.config.js to visit the home page before each test
    });

    it('should find Fire Emblem games', () => {

        home.searchGame('Fire Emblem');

        home.verifyGame('Fire Emblem Awakening');
        home.verifyGame('Fire Emblem Fates: Birthright');

        home.verifyGameNotPresent('GTA V');
        home.verifyGameNotPresent('Grand Theft Auto V');
    });

    it('should find a single game', () => {

        home.searchGame('Fire Emblem Fates: Conquest');
        home.verifyGame('Fire Emblem Fates: Conquest');
    });

    it('should display no games for a non-existent game', () => {

        home.searchGame('ddgdfsg');
        home.verifyNoGameCardsVisible();
    });

});