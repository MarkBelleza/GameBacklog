import GameBacklogHome from '../pages/GameBacklogHome';
import BacklogPage from '../pages/BacklogPage';

const game = {
    id: 12345,
    name: 'Cypress Test Game',
    cover: null,
    first_release_date: null,
};

describe('Game backlog', () => {
    const home = new GameBacklogHome();
    const backlog = new BacklogPage();

    beforeEach(() => {
        cy.intercept('GET', '**/igdb/popular*', {
            statusCode: 200,
            body: [game],
        }).as('getPopularGames');

        cy.visit('/');
        cy.wait('@getPopularGames');
        home.verifyGame(game.name);
    });

    it('should be able to add games to backlog and persist even after a page reload', () => {
        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        //Check that game has been added to local storage before reloading
        cy.window().should((window) => {
            const favourites = JSON.parse(window.localStorage.getItem('favourites') || '[]');
            expect(favourites.some((favourite) => favourite.id === game.id)).to.be.true;
        });

        cy.reload();
        backlog.verifyGame(game.name);
    });


    it('should be able to remove a game from the backlog by clicking its heart icon', () => {
        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        backlog.removeGame(game.name);
        backlog.verifyGameNotPresent(game.name);
    });


    it('should be able to select a status and be preserved even after a page reload', () => {
        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        backlog.setGameStatus(game.name, 'Playing');
        backlog.verifyGameStatus(game.name, 'Playing');
        backlog.verifyGameStatusNotSelected(game.name, 'Finished');
        backlog.verifyGameStatusNotSelected(game.name, 'Dropped');

        //Check that game has been added to local storage before reloading
        cy.window().should((window) => {
            const statuses = JSON.parse(window.localStorage.getItem('gameStatuses') || '{}');
            expect(statuses[game.id]).to.equal('Playing');
        });

        cy.reload();
        backlog.verifyGameStatus(game.name, 'Playing');
        backlog.verifyGameStatusNotSelected(game.name, 'Finished');
        backlog.verifyGameStatusNotSelected(game.name, 'Dropped');
    });

    it('should be able to remove selected status by selecting the same status again', () => {
        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        //Add Playing status
        backlog.setGameStatus(game.name, 'Playing');
        backlog.verifyGameStatus(game.name, 'Playing');

        //Remove Playing status
        backlog.setGameStatus(game.name, 'Playing');
        backlog.verifyGameStatusNotSelected(game.name, 'Playing');
        backlog.verifyGameStatusNotSelected(game.name, 'Finished');
        backlog.verifyGameStatusNotSelected(game.name, 'Dropped');

        //Check that game has been added to local storage before reloading
        cy.window().should((window) => {
            const statuses = JSON.parse(window.localStorage.getItem('gameStatuses') || '{}');
            expect(statuses).not.to.have.property(String(game.id));
        });

        cy.reload();
        backlog.verifyGameStatusNotSelected(game.name, 'Playing');
        backlog.verifyGameStatusNotSelected(game.name, 'Finished');
        backlog.verifyGameStatusNotSelected(game.name, 'Dropped');
    })
});
