/**
 * Board - class that represents the board of the game
 */
class Board {
    /**
     * Constructor of the class
     * @param {GameOrchestrator} orchestrator - reference to the game orchestrator
     * @param {Array} boardArray - array with the initial board layout, in terms of microbes
     */
    constructor(orchestrator, boardArray) {
        this.orchestrator = orchestrator;

        this.pickStates = Object.freeze({
            "NO_PICK": 1,
            "PICK_PIECE": 2,
            "PICK_PLAYER_MOVE": 3,
            "ANIMATING": 4,
            "CHECK_GAME_OVER": 5
          }); 
        this.pickState = this.pickStates.NO_PICK;

        this.selectedTileLine = null;
        this.selectedTileColumn = null;

        this.sideBoardA = new SideBoard(this.orchestrator, 'A');
        this.sideBoardB = new SideBoard(this.orchestrator, 'B');

        this.initialTileX = 1.95; 
        this.initialTileY = -1.95;
        this.tileOffset = 0.65; // tile side + space between 2 tiles = 0.6 + 0.05 = 0.65 
        this.boardTiles = this.generateBoardTiles(); // individual board tiles that interact with mouse events
        this.interpretBoardArray(boardArray);
    }


    /**
     * Method to receive a new template from the XML file
     * @param {BoardTemplate} newTemplate - new board template
     * @param {MicrobeTemplate} newMicrobeATemplate - new template for the microbes of player A
     * @param {MicrobeTemplate} newMicrobeBTemplate - new template for the microbes of player B
     * @param {SideBoardTemplate} newSideBoardTemplate - new template for the side board of player A
     * @param {SideBoardTemplate} newSideBoardTemplate - new template for the side board of player B
     */
	loadTemplate(newTemplate, newMicrobeATemplate, newMicrobeBTemplate, newSideBoardATemplate, newSideBoardBTemplate) {
        // loads template for the board
        this.boardTemplate = newTemplate;

        this.microbeATemplate = newMicrobeATemplate;
        this.microbeBTemplate = newMicrobeBTemplate;

        let currentTileMat = this.boardTemplate.tile1Mat;
        let currentTileTex = this.boardTemplate.tile1Texture;

        for(let i = 0; i < this.boardTiles.length; i++) {
            // loads template for the tiles
            this.boardTiles[i].loadTemplate(currentTileMat, currentTileTex);
            currentTileMat = currentTileMat == this.boardTemplate.tile1Mat ? this.boardTemplate.tile2Mat : this.boardTemplate.tile1Mat;
            currentTileTex = currentTileTex == this.boardTemplate.tile1Texture ? this.boardTemplate.tile2Texture : this.boardTemplate.tile1Texture;
        
            // loads template for the microbes
            if(this.boardTiles[i].microbe != null) {
                let microbeTemplate = this.boardTiles[i].microbe.type == 'A' ? newMicrobeATemplate : newMicrobeBTemplate;
                this.boardTiles[i].microbe.loadTemplate(microbeTemplate);
            }
        }

        this.sideBoardA.loadTemplate(newSideBoardATemplate, this.microbeATemplate);
        this.sideBoardB.loadTemplate(newSideBoardBTemplate, this.microbeBTemplate);
    }


    /**
     * Method that creates new microbe objects to store in the tiles, depending on the information stored in the board array
     * @param {Array} boardArray - array with the initial board layout, in terms of microbes
     */ 
    interpretBoardArray(boardArray) {
        this.sideBoardA.microbe = null;
        this.sideBoardB.microbe = null;

        for(let line = 0; line < boardArray.length; line++) {
            let currentLine = boardArray[line];

            for(let column = 0; column < currentLine.length; column++) {
                let currentPosition = currentLine[column];
                let tile = this.getTileByCoords(line + 1, column + 1);
                if(currentPosition == 'a') {
                    let microbe = new Microbe(this.orchestrator, 'A');
                    microbe.loadTemplate(this.microbeATemplate);
                    tile.addMicrobeToTile(microbe);
                }
                else if(currentPosition == 'b') {
                    let microbe = new Microbe(this.orchestrator, 'B');
                    microbe.loadTemplate(this.microbeBTemplate);
                    tile.addMicrobeToTile(microbe);
                }
                else if(currentPosition == 'empty') {
                    tile.removeMicrobeFromTile();
                }
            } 
        }
    }


    /**
     * Method that generates a new microbe in one of the side boards
     * @param {char} player - character indicating what player will have the microbe (player A or B)
     * @return Side board of the player
     */
    generateMicrobeSideBoard(player) {
        let sideBoard, microbeTemplate;
        if(player == 'A') {
            sideBoard = this.sideBoardA;
            microbeTemplate = this.microbeATemplate;
        }
        else if(player == 'B') {
            sideBoard = this.sideBoardB;
            microbeTemplate = this.microbeBTemplate;
        }

        sideBoard.generateNewMicrobe(microbeTemplate);

        return sideBoard;
    }


    /**
     * Method that selects a tile after it's been picked
     * @param {int} tileID - unique tile ID of the picked tile
     */
    selectTile(tileID) {
        this.boardTiles[tileID - 1].selected = true;
        this.selectedTileLine = this.boardTiles[tileID - 1].line;
        this.selectedTileColumn = this.boardTiles[tileID - 1].column;
    }

    
    /**
     * Method that receives an array with coordinate pairs, and highlights all the tiles in those coordinates
     * @param {Array} validMoves - Array with the valid moves
     */
    highlightTilesForMove(validMoves) {
        for(let validPosition of validMoves) {
            this.getTileByCoords(validPosition[0], validPosition[1]).highlighted = true;
        }
    }

    
    /**
     * Method that highlights a certain tile
     * @param {int} tileID - unique tile ID of the tile
     */
    highlightTile(tileID) {
        this.boardTiles[tileID - 1].highlighted = true;
    }


    /**
     * Method that resets all tiles to their standard state (no selected, no highlighted)
     */
    resetTiles() {
        for(let tile of this.boardTiles) {
            tile.selected = false;
            tile.highlighted = false;
        }
        this.selectedTileLine = null;
        this.selectedTileColumn = null;
    }


    /**
     * Method that returns the tile that is on the line and column specified in the arguments
     * @param {int} line - tile line
     * @param {int} column - tile column
     * @return the tile in those coordinates
     */
    getTileByCoords(line, column) {
        let tileID = 7 * (line - 1) + column;
        return this.boardTiles[tileID - 1];
    }


    /**
     * Function that generates the individual board tiles that will interact with mouse events
     * @return Array with all the tiles
     */
    generateBoardTiles() {
        let curTileID = 1;
        let tilesArray = [];
        let y = this.initialTileY;
        for(let line = 1; line <= 7; line++) {
            let x = this.initialTileX;
            for(let column = 1; column <= 7; column++) {
                tilesArray.push(new Tile(this.orchestrator, curTileID, line, column, x, y, this));
                curTileID++;
                x -= this.tileOffset;
            }
            y += this.tileOffset;
        }

        return tilesArray;
    }


    /**
     * Update method that is in charge of updating the microbe's position
     * @param {float} deltaTime - time difference between this call and the last call
     */
    update(deltaTime) {
        for (let tile of this.boardTiles) {
			if (tile.microbe != null && tile.microbe.animation != null) {
				tile.microbe.update(deltaTime);
            }
        }

        if(this.sideBoardA.microbe != null)
            this.sideBoardA.microbe.update(deltaTime);

        if(this.sideBoardB.microbe != null)
            this.sideBoardB.microbe.update(deltaTime);
    }

    /**
     * Display method for the game board and its tiles
     */
    display() {        
        let scene = this.orchestrator.scene;

        scene.pushMatrix();

        this.boardTemplate.boardMaterial.apply();
        if(this.boardTemplate.boardTexture != null)
            this.boardTemplate.boardTexture.bind();
        
        this.boardTemplate.boardGeometry.display();

        if(this.boardTemplate.boardTexture != null)
            this.boardTemplate.boardTexture.unbind();

        this.sideBoardA.display();
        this.sideBoardB.display();

        for(let i = 0; i < this.boardTiles.length; i++) {
            let tile = this.boardTiles[i];
            if(tile.selected)
                this.boardTemplate.selectedTileMat.apply();
            else if(tile.highlighted)
                this.boardTemplate.highlightedTileMat.apply();
            else
                tile.tileMaterial.apply();

            if(tile.tileTexture != null)
                tile.tileTexture.bind();

            scene.pushMatrix();
            scene.translate(tile.y, 0.051, tile.x);

            scene.registerForPick(tile.id, tile);
            this.boardTemplate.tileGeometry.display();
            if(tile.microbe != null)
                tile.microbe.display();

            scene.clearPickRegistration();
            scene.popMatrix();

            if(tile.tileTexture != null)
                tile.tileTexture.unbind();
        }


        scene.popMatrix();
    
    }
}
