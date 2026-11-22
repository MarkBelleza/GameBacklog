import GameBacklogHome from '../pages/GameBacklogHome';
import BacklogPage from '../pages/BacklogPage';

const game = {
    id: 12345,
    name: 'Cypress Test Game',
    cover: null,
    first_release_date: null,
};

describe('Game backlog features', () => {
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

    it('should be able to add platform and persist after a page reload', () => {
        const platform = 'Steam';

        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        backlog.setGamePlatform(game.name, platform);
        backlog.verifyGamePlatform(game.name, platform);

        //Check that platform has been added to local storage before reloading
        cy.window().should((window) => {
            const platforms = JSON.parse(window.localStorage.getItem('gamePlatforms') || '{}');
            expect(platforms[game.id]).to.equal(platform);
        });

        cy.reload();
        backlog.verifyGame(game.name);
        backlog.verifyGamePlatform(game.name, platform);
    });

    it('should be able to add score using the text box and persist after a page reload', () => {
        const score = '8.5';

        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        backlog.setGameScore(game.name, score);
        backlog.verifyGameScore(game.name, score);

        //Check that score has been added to local storage before reloading
        cy.window().should((window) => {
            const scores = JSON.parse(window.localStorage.getItem('gameScores') || '{}');
            expect(scores[game.id]).to.equal(score);
        });

        cy.reload();
        backlog.verifyGame(game.name);
        backlog.verifyGameScore(game.name, score);
    });

    it('should be able to add score using a dropdown option and persist after a page reload', () => {
        const score = '8';

        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        backlog.setGameScoreFromPreset(game.name, score);
        backlog.verifyGameScore(game.name, score);

        //Check that score has been added to local storage before reloading
        cy.window().should((window) => {
            const scores = JSON.parse(window.localStorage.getItem('gameScores') || '{}');
            expect(scores[game.id]).to.equal(score);
        });

        cy.reload();
        backlog.verifyGame(game.name);
        backlog.verifyGameScore(game.name, score);
    });

    it('should be able to reset the score and persist after a page reload', () => {
        const score = '8.5';

        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);

        backlog.setGameScore(game.name, score);
        backlog.verifyGameScore(game.name, score);

        backlog.setGameScore(game.name, '');
        backlog.verifyGameScoreNotSet(game.name);

        //Check that score has been removed from local storage before reloading
        cy.window().should((window) => {
            const scores = JSON.parse(window.localStorage.getItem('gameScores') || '{}');
            expect(scores).not.to.have.property(String(game.id));
        });

        cy.reload();
        backlog.verifyGame(game.name);
        backlog.verifyGameScoreNotSet(game.name);
    });

    it('should be able to add note and persist after a page reload', () => {
        const note = 'Worth revisiting after the next update.';

        home.toggleFavourite(game.name);
        backlog.navigateToPage();
        backlog.verifyGame(game.name);
        cy.get('.guest-notice-fixed .notice-close').click();

        backlog.saveGameNote(game.name, note);
        backlog.verifyGameNotePreview(game.name, note.slice(0, 36));
        backlog.verifyGameNote(game.name, note);
        cy.get('.game-note-cancel').click();

        //Check that note has been added to local storage before reloading
        cy.window().should((window) => {
            const notes = JSON.parse(window.localStorage.getItem('gameNotes') || '{}');
            expect(notes[game.id]).to.equal(note);
        });

        cy.reload();
        backlog.verifyGame(game.name);
        backlog.verifyGameNotePreview(game.name, note.slice(0, 36));
        backlog.verifyGameNote(game.name, note);
        cy.get('.game-note-cancel').click();
        backlog.verifyGameNote(game.name, note);
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
