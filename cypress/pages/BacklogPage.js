class BacklogPage {
    page = '.favourites, .favourites-empty';
    gameCard = '.game-card';
    gameCardName = '.game-info h3';
    gridViewButton = '.game-view-toggle button:contains("Card view")';
    listViewButton = '.game-view-toggle button:contains("List view")';
    searchField = '.favourites-search .search-input';
    sortSelect = '#favourites-sort-by';
    sortDirectionButton = '.favourites-sort-direction';
    statusDropdown = '.favourites-status-dropdown';
    statusOptions = '.favourites-status-options';
    noResultsMessage = '.favourites-no-results';
    emptyState = '.favourites-empty';

    visit() {
        cy.visit('/favourites');
        cy.get(this.page).should('be.visible');
    }

    navigateToPage() {
        cy.get('.navbar-links').contains('a', 'Backlogged').click();
        cy.get(this.page).should('be.visible');
    }

    selectGridView() {
        cy.get(this.gridViewButton).should('be.visible').click();
    }

    selectListView() {
        cy.get(this.listViewButton).should('be.visible').click();
    }

    verifyGridViewSelected() {
        cy.get(this.gridViewButton).should('have.attr', 'aria-pressed', 'true');
    }

    verifyListViewSelected() {
        cy.get(this.listViewButton).should('have.attr', 'aria-pressed', 'true');
    }

    searchGames(query) {
        cy.get(this.searchField).clear();
        if (query) {
            cy.get(this.searchField).type(query);
        }
    }

    setSortBy(sortBy) {
        cy.get(this.sortSelect).select(sortBy);
    }

    toggleSortDirection() {
        cy.get(this.sortDirectionButton).click();
    }

    setStatusFilter(status, isSelected = true) {
        cy.get(this.statusDropdown).then(($dropdown) => {
            if (!$dropdown.attr('open')) {
                cy.wrap($dropdown).find('summary').click();
            }
        });

        cy.contains(`${this.statusOptions} label`, status)
            .find('input')
            .then(($checkbox) => {
                if ($checkbox.prop('checked') !== isSelected) {
                    cy.wrap($checkbox).click();
                }
            });
    }

    getGameCard(gameName) {
        return cy.get('body').find(this.gameCard).filter((_, card) => {
            const title = card.querySelector(this.gameCardName);
            return title && title.innerText.trim() === gameName;
        });
    }

    verifyGame(gameName) {
        this.getGameCard(gameName).should('have.length', 1).should('be.visible');
    }

    verifyGameNotPresent(gameName) {
        cy.get('body').should(($body) => {
            const gameCards = Array.from($body[0].querySelectorAll(this.gameCard));
            const matchingGame = gameCards.some((card) => {
                const title = card.querySelector(this.gameCardName);
                return title && title.innerText.trim() === gameName;
            });

            expect(matchingGame).to.be.false;
        });
    }

    verifyNoMatchingGames() {
        cy.get(this.noResultsMessage).should('be.visible');
        cy.get(this.gameCard).should('not.exist');
    }

    verifyEmptyBacklog() {
        cy.get(this.emptyState).should('be.visible');
    }

    setGameStatus(gameName, status) {
        this.getGameCard(gameName).find('.favourite-btn').focus({ force: true });
        this.getGameCard(gameName).contains('.status-btn', status)
            .should('be.visible')
            .click();
    }

    verifyGameStatus(gameName, status) {
        this.getGameCard(gameName)
            .contains('.status-btn', status)
            .should('have.class', 'active');
    }

    verifyGameStatusNotSelected(gameName, status) {
        this.getGameCard(gameName)
            .contains('.status-btn', status)
            .should('not.have.class', 'active');
    }

    setGamePlatform(gameName, platform) {
        this.getGameCard(gameName).find('select[id^="platform-"]').select(platform);
    }

    verifyGamePlatform(gameName, platform) {
        this.getGameCard(gameName)
            .find('select[id^="platform-"]')
            .should('have.value', platform);
    }

    setGameScore(gameName, score) {
        this.getGameCard(gameName).find('.score-btn').click();

        const scoreInput = this.getGameCard(gameName).find('input[name="score"]');
        scoreInput.clear();
        if (score !== '') {
            scoreInput.type(String(score));
        }
        this.getGameCard(gameName).find('button[type="submit"]').click();
    }

    setGameScoreFromPreset(gameName, score) {
        this.getGameCard(gameName).find('.score-btn').click();
        this.getGameCard(gameName)
            .contains('.score-menu li button', `${score} (`)
            .click();
    }

    verifyGameScore(gameName, score) {
        this.getGameCard(gameName)
            .find('.score-btn')
            .should('contain.text', `Score: ${score}`);
    }

    verifyGameScoreNotSet(gameName) {
        this.getGameCard(gameName)
            .find('.score-btn')
            .should('have.text', 'Score:');
    }

    saveGameNote(gameName, note) {
        this.getGameCard(gameName).find('.game-note-button').click();
        cy.get('.game-note-dialog textarea').clear();
        if (note) {
            cy.get('.game-note-dialog textarea').type(note);
        }
        cy.get('.game-note-save').click();
    }

    verifyGameNotePreview(gameName, preview) {
        this.getGameCard(gameName)
            .find('.game-note-button')
            .should('contain.text', preview);
    }

    verifyGameNote(gameName, note) {
        this.getGameCard(gameName).find('.game-note-button')
            .should('have.class', 'has-note-preview')
            .click();
        cy.get('.game-note-dialog textarea').should('have.value', note);
    }

    removeGame(gameName) {
        this.getGameCard(gameName).find('.favourite-btn').focus().click();
    }
}

export default BacklogPage;
