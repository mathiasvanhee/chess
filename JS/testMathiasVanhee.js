//CLASSES

function Player( playerGame, color = 'white' ) {

	this.grid = playerGame.gridMatrix;

	this.game = playerGame;

	this.color = color;

	this.isChecked = false;

	this._playing = false;

	this.actions = [];

	this.piecesObj = {

		pawns: [],

		rooks: [],

		knights: [],

		bishops: [],

		queen: null,

		king: null
	};

	this.memory = {};

	this.piecesList = [];

	{

		let line = color === 'white' ? 2 : 7;

		for ( col = 1; col <= 8; col++ ) {
			let pawn = new Piece( 'pawn', line, col, this.color, this.piecesList.length, this.grid );
			this.piecesObj.pawns.push( pawn );
			this.piecesList.push( pawn );
			this.grid[line - 1][col - 1] = pawn;

		}

		line = color === 'white' ? 1 : 8;

		let rook1 = new Piece( 'rook', line, 1, this.color, this.piecesList.length, this.grid );
		this.grid[line - 1][0] = rook1;
		let rook2 = new Piece( 'rook', line, 8, this.color, this.piecesList.length + 1, this.grid );
		this.grid[line - 1][7] = rook2;
		this.piecesObj.rooks.push( rook1, rook2 );
		this.piecesList.push( rook1, rook2 );

		let knight1 = new Piece( 'knight', line, 2, this.color, this.piecesList.length, this.grid );
		this.grid[line - 1][1] = knight1;
		let knight2 = new Piece( 'knight', line, 7, this.color, this.piecesList.length + 1, this.grid );
		this.grid[line - 1][6] = knight2;
		this.piecesObj.knights.push( knight1, knight2 );
		this.piecesList.push( knight1, knight2 );

		let bishop1 = new Piece( 'bishop', line, 3, this.color, this.piecesList.length, this.grid );
		this.grid[line - 1][2] = bishop1;
		let bishop2 = new Piece( 'bishop', line, 6, this.color, this.piecesList.length + 1, this.grid );
		this.grid[line - 1][5] = bishop2;
		this.piecesObj.bishops.push( bishop1, bishop2 );
		this.piecesList.push( bishop1, bishop2 );

		let queen = new Piece( 'queen', line, 4, this.color, this.piecesList.length, this.grid );
		this.grid[line - 1][3] = queen;
		this.piecesObj.queen = queen;
		this.piecesList.push( queen );

		let king = new Piece( 'king', line, 5, this.color, this.piecesList.length, this.grid );
		this.grid[line - 1][4] = king;
		this.piecesObj.king = king;
		this.piecesList.push( king );

	}

}

Player.sortActionsById = function ( actions ) {

	let moves = actions.moves;
	let captures = actions.captures;
	//à partir de moves, on crée un tableau de tableau de 16 de longueur o% chaque élément est un tableau: à tableau[6], il y aura un tableau de tous les moves dont la piece ait un id égal à 6;

	let returnedMoves = [];
	returnedMoves.length = 16;
	
	let returnedCaptures = [];
	returnedCaptures.length = 16;
	for ( let i = 0; i < 16; i++ ) {
		returnedMoves[i] = [];
		returnedCaptures[i] = [];
	}

	for ( let i = 0; i < moves.length; i++ ) {
		returnedMoves[moves[i].piece.id].push( moves[i] );
	}


	for ( let i = 0; i < captures.length; i++ ) {
		returnedCaptures[captures[i].piece.id].push( captures[i] );
	}

	return { moves: returnedMoves, captures: returnedCaptures };

}

Player.getPxById = function ( sortedActions ) {

	let returnedPx = { moves: [], captures: [] };
	returnedPx.moves.length = 16;
	returnedPx.captures.length = 16;
	for ( let id = 0; id < 16; id++ ) {
		returnedPx.moves[id] = [];
		returnedPx.captures[id] = [];
	}

	//on trie les pixels par id de Pièce.
	//pour chaque pièce:
	for ( let id = 0; id < 16; id++ ) {

		let moves = sortedActions.moves[id];
		let captures = sortedActions.captures[id];

		//pour chaque move:
		for ( let i = 0; i < moves.length; i++ ) {
			let move = moves[i];
			returnedPx.moves[id].push( { line: move.finish.y + 1, col: move.finish.x + 1 } );
		}

		//pour chaque capture:
		for ( let i = 0; i < captures.length; i++ ) {
			let capture = captures[i];
			returnedPx.captures[id].push( { line: capture.finish.y + 1, col: capture.finish.x + 1 } );
		}
		
	}

	return returnedPx;

}

Object.assign( Player.prototype, {

	//regarde si l'action est réalisable de la part du joueur (this)
	isActionPossible: function ( action ) {

		//on simule d'abord l'action du joueur:
		this.simulateAction( action );

		//on regarde alors si parmi les captures du joueur adverse (this.opponent), il y a possibilité de prendre le roi du joueur (this).
		let captures = this.opponent.findAllControllingActions().captures;
		let isPossible = true;
		//on regarde pour chacune des captures potentielles du joueur adverse(this.opponent)  on regarde si le roi n'est pas pris (s'il n'est pas la cible de la capture) :
		for ( let i = 0; i < captures.length; i++ ) {
			let capture = captures[i];
			//si oui il est menacé, donc l'action du joueur (this) est impossible.
			if ( capture.target.type === 'king' ) {
				isPossible = false
				break;
			}
		}

		//on repart en arrière pour remettre bien la grille:
		this.unsimulateAction( action );

		return isPossible;

	},

	//méthode qui renvoit toutes les actions possibles du joueur.
	getPossibleActions: function () {

		let sortedActions = this.findAllActions();
		let actions = sortedActions.moves.concat( sortedActions.captures );

		let possibleActions = { moves: [], captures: [] };
		for ( let i = 0; i < actions.length; i++ ) {
			if ( this.isActionPossible( actions[i] ) ) {
				possibleActions[actions[i].type + "s"].push( actions[i] );
            }
		}
		return possibleActions;

    },

	//vérifie si le joueur a mis en échec ou échec et mat l'adversaire.
	verifyCheck: function () {

		let captures = this.findAllActions().captures;
		for ( let i = 0; i < captures.length; i++ ) {

			if ( captures[i].target.type === "king" ) {
				//le roi adverse est mis en échec -> on vérifie si le joueur adverse (this.opponent) peut encore jouer.
				this.opponent.isChecked = true;

				//On regarde les actions possibles de l'adversaire :
				let validOpponentActions = this.opponent.getPossibleActions();
				
				//si le joueur adverse ne peut plus jouer, il est mat.
				if ( !(validOpponentActions.moves.length || validOpponentActions.captures.length) ) {
					return 'checkmate';
				}
				//sinon, le joueur adverse peut jouer, sauf qu'on lui fournit la liste de ces moves directement.
				this.opponent.actions = validOpponentActions;
				return 'check';
				
			}

		}
		return false;

	},

	getControlledZones: function () {

		const getZone = action => action.finish;

		let controllingActions = this.findAllControllingActions();
		let controlledZones = Array.from( controllingActions.moves, getZone ).concat( Array.from( controllingActions.captures, getZone ) );

		return controlledZones;
			
	},


	findAllActions: function () {

		let actions = this.findAllControllingActions();
		let pawns = this.piecesObj.pawns;

		for ( let id = 0; id < pawns.length; id++ ) {

			let pawn = pawns[id];
			if ( !pawn.alive ) continue;

			//déplacement vers l'avant:
			let finish = Object.assign( {}, pawn.coordinates );
			finish.y += this.color === 'white' ? 1 : -1;

			let move = new Move( pawn, finish, this.grid );
			if ( move.isPossible() ) {
				actions.moves.push( move );
			}
		}

		return actions;

	},

	findAllControllingActions: function () {

		//on ne regarde pas ici si le roi est sous contrôle.

		let moves = [];
		let captures = [];

		//pawns: deplacement vers l'avant et prise de diagonale-avant:
		let pawns = this.piecesObj.pawns;
		for ( let id = 0; id < pawns.length; id++ ) {

			let pawn = pawns[id];
			if ( !pawn.alive ) continue;

			let finish = Object.assign( {}, pawn.coordinates );
			finish.y += this.color === 'white' ? 1 : -1;

			//capture vers l'avant en diagonale:
			finish.x += 1;
			let captureR = new Capture( pawn, finish, this.grid );
			if ( captureR.isPossible() ) {
				captures.push( captureR );

			}

			finish.x -= 2;
			let captureL = new Capture( pawn, finish, this.grid );
			if ( captureL.isPossible() ) {
				captures.push( captureL );

			}
		}


		//rooks:
		let rooks = this.piecesObj.rooks;
		for ( let id = 0; id < rooks.length; id++ ) {

			let rook = rooks[id];
			if ( !rook.alive ) continue;

			//déplacement latéral:
			rook.addLatMoves( 1, moves, captures );
			rook.addLatMoves( -1, moves, captures );

			//déplacement vertical:
			rook.addVertMoves( 1, moves, captures );
			rook.addVertMoves( -1, moves, captures );


		}


		//knights:
		let knights = this.piecesObj.knights;
		for ( let id = 0; id < knights.length; id++ ) {

			let knight = knights[id];
			if ( !knight.alive ) continue;

			for ( let i = 0; i < allKnightMvments.length; i++ ) {
				let finish = Object.assign( {}, knight.coordinates );
				finish.x += allKnightMvments[i].x
				finish.y += allKnightMvments[i].y
				knight.checkAttackMove( finish, moves, captures, this.grid )
			}

		}


		//bishops:
		let bishops = this.piecesObj.bishops;
		for ( let id = 0; id < bishops.length; id++ ) {

			let bishop = bishops[id];
			if ( !bishop.alive ) continue;

			bishop.addLinearMoves( +1, +1, moves, captures );
			bishop.addLinearMoves( +1, -1, moves, captures );
			bishop.addLinearMoves( -1, +1, moves, captures );
			bishop.addLinearMoves( -1, -1, moves, captures );

		}

		//queen:
		let queen = this.piecesObj.queen;
		if ( queen.alive ) {

			//déplacement latéral:
			queen.addLatMoves( 1, moves, captures );
			queen.addLatMoves( -1, moves, captures );
			//déplacement vertical:
			queen.addVertMoves( 1, moves, captures );
			queen.addVertMoves( -1, moves, captures );
			//déplacements diagonaux:
			queen.addLinearMoves( +1, +1, moves, captures );
			queen.addLinearMoves( +1, -1, moves, captures );
			queen.addLinearMoves( -1, +1, moves, captures );
			queen.addLinearMoves( -1, -1, moves, captures );
		}


		//King:
		let king = this.piecesObj.king;
		//déplacement latéral:
		king.addLatMoves( 1, moves, captures, 1 );
		king.addLatMoves( -1, moves, captures, 1 );
		//déplacement vertical:
		king.addVertMoves( 1, moves, captures, 1 );
		king.addVertMoves( -1, moves, captures, 1 );
		//déplacements diagonaux:
		king.addLinearMoves( +1, +1, moves, captures, 1 );
		king.addLinearMoves( +1, -1, moves, captures, 1 );
		king.addLinearMoves( -1, +1, moves, captures, 1 );
		king.addLinearMoves( -1, -1, moves, captures, 1 );

		return { 'moves': moves, 'captures': captures };

	},

	movePiece: function ( move = new Move ) {

		this.changeGrid( move );
		this.game.getDomElem( move.piece.line, move.piece.col ).append( move.piece.img );

		this.endTurn();

	},

	capturePiece: function ( capture = new Capture ) {

		capture.target.alive = false;
		capture.target.img.detach();

		this.movePiece( capture );

	},

	endTurn: function () {

		this.playing = false;
		//on vérifie si par le coup effectué le joueur a mis mat ou en échec le joueur adverse:
		let isOppChecked = this.verifyCheck();
		if ( isOppChecked !== "checkmate" ) {
			this.opponent.playing = true;
		}
		else {
			game.checkmate( this, this.opponent );
		}

	},


	changeGrid: function ( action ) {

		action.piece.coordinates = Object.assign( {}, action.finish );
		this.grid[action.source.y][action.source.x] = 0;
		this.grid[action.finish.y][action.finish.x] = action.piece;

	},

	unChangeGrid( action ) {

		this.changeGrid( Object.assign(
			{},
			action,
			{
				finish: Object.assign( {}, action.source ),
				source: Object.assign( {}, action.finish )
			}
		) );

	},

	simulateAction: function ( action ) {
		this.changeGrid( action );
		if ( action.type === 'capture' ) {
			action.target.alive = false;
        }
	},

	unsimulateAction: function ( action ) {

		this.unChangeGrid( action );
		if ( action.type === "capture" ) {
			this.grid[action.finish.y][action.finish.x] = action.target;
			action.target.alive = true;
		}

	},


	startHandlingClick: function ( sortedActions = this.memory.sortedActions, sortedPx = this.memory.sortedPx ) {

		for ( let i = 0; i < this.piecesList.length; i++ ) {

			let piece = this.piecesList[i];
			
			let data = {
				actions: { moves: sortedActions.moves[i], captures: sortedActions.captures[i] },
				pixels: { moves: sortedPx.moves[i], captures: sortedPx.captures[i] },
				player: this,
				piece: piece,
				domElement: this.game.getDomElem( piece.line, piece.col )
			};
			//S'il n'y a aucune action possible, on empêche le joueur de pouvoir cliquer sur la pièce.
			if ( !( data.actions.moves.length || data.actions.captures.length ) ) continue;
			data.domElement.one( "click", data, this.game.moveImgHandler );
			//piece.img.on( "click", data, this.game.moveImgHandler );
		}
		

	},

	stopHandlingClick: function () {

		for ( let i = 0; i < this.piecesList.length; i++ ) {
			let piece = this.piecesList[i];
			let domElement = this.game.getDomElem( piece.line, piece.col )
			domElement.off();

		}

	}

} );


Object.defineProperties( Player.prototype, {

	"opponent": {

		get: function () {
			return this._opponent;
		},

		set: function ( opponent = new Player ) {
			this._opponent = opponent;
			opponent._opponent = this;
		}
	},

	"playing": {

		get: function () {
			return this._playing;
		},

		set: function ( bool ) {

			if ( typeof bool != "boolean" ) return;

			this._playing = bool;

			if ( bool ) {
				//starts playing
				if ( !this.isChecked ) {
					this.actions = this.getPossibleActions();
					if ( !(this.actions.moves.length || this.actions.captures.length) ) {
						//pat: le joueur ne peut pas jouer sans être en échec.
						game.stalemate();
						return;
                    }
				}
				let moves = this.actions.moves;
				let captures = this.actions.captures;

				//-> faire une fonction qui renvoie pour moves et captures une liste, dans laquelle est rangé toutes les actions à partir de l'id de la pièce.
				let sortedActions = Player.sortActionsById( this.actions );

				let sortedPx = Player.getPxById( sortedActions );

				this.memory.sortedActions = sortedActions;
				this.memory.sortedPx = sortedPx;

				this.startHandlingClick( sortedActions, sortedPx );
			}
			else {
				this.isChecked = false;
				
				//stops playing -> stop the event listener.
				this.stopHandlingClick();
			}
		}
	}
} );



function Piece( type = 'pawn', line = 1, col = 1, color = "white", id = 'null', grid ) {

	this.id = id
	this.type = type;
	this.line = line;
	this.col = col;
	this.color = color;
	this.grid = grid;
	this.alive = true;

	this.img = $( document.createElement( 'img' ) ).prop( 'src', `DATA/img/pieces/${color[0]}/${this.type}.png` ).addClass('piece');

}


Object.assign( Piece.prototype, {

	move: function ( line, col ) {

		this.line = line;
		this.col = col;

	},

	checkAttackMove: function ( finish, moves, captures ) {

		let move = new Move( this, Object.assign( {}, finish), this.grid );

		if ( move.isPossible() ) {
			moves.push( move );
		}

		else {
			let capture = new Capture( this, Object.assign( {}, finish ), this.grid );
			if ( capture.isPossible() ) {
				captures.push( capture );
			}
		}
	},

	addLatMoves: function ( nb, moves, captures, max ) {
		this.addLinearMoves( nb, 0, moves, captures, max );
	},

	addVertMoves: function (  nb, moves, captures, max ) {
		this.addLinearMoves( 0, nb, moves, captures, max );
	},

	addLinearMoves: function ( iX, iY, moves, captures, max ) {

		if ( !max ) max = 10;
		let finish = Object.assign( {}, this.coordinates );
		let dist = 1;
		while ( dist <= max ) {
			finish.x += iX;
			finish.y += iY;
			dist++;
			let move = new Move( this, finish, this.grid );
			if ( move.isPossible() ) {
				moves.push( move );
			}
			else {
				let capture = new Capture( this, finish, this.grid );
				if ( capture.isPossible() ) {
					captures.push( capture );
				}
				break;
			}
		}

	}

} );


Object.defineProperties( Piece.prototype, {

	"coordinates": {

		get: function () {
			return {
				x: this.col - 1,
				y: this.line - 1
			};
		},

		set: function ( coo ) {
			this.col = coo.x + 1;
			this.line = coo.y + 1;
		}
	}
} );



function Move( piece = new Piece, finish = { x: 0, y: 0 }, grid ) {
	this.type = "move";
	this.piece = piece;
	this.pieceId = piece.id;
	this.source = piece.coordinates;
	this.finish = Object.assign( {}, finish);
	this.color = piece.color;
	this.grid = grid || piece.grid;
	this.possible = 'unknown';
}

Object.assign( Move.prototype, {

	isPossible: function () {

		if ( this.finish.x > 7 || this.finish.x < 0 || this.finish.y > 7 || this.finish.y < 0 ) {
			this.possible = false;
			return false;
		}
		if ( this.grid[this.finish.y][this.finish.x] ) {
			this.possible = false;
			return false;
		}
		this.possible = true;
		return true;

	}

} );



function Capture( piece = new Piece, finish = { x: 0, y: 0 }, grid ) {
	this.type = "capture";
	this.piece = piece;
	this.pieceId = piece.id;
	this.source = piece.coordinates;
	this.finish = Object.assign( {}, finish );
	this.color = piece.color;
	this.grid = grid;
	this.possible = 'unknown';
	this.target = 'unknown';
}

Object.assign( Capture.prototype, {

	isPossible: function () {

		if ( this.finish.x > 7 || this.finish.x < 0 || this.finish.y > 7 || this.finish.y < 0 ) {
			this.possible = false;
			return false;
		}
		if ( !this.grid[this.finish.y][this.finish.x] ) {
			this.possible = false;
			return false;
		}
		if ( this.grid[this.finish.y][this.finish.x].color === this.color ) {
			this.possible = false;
			return false;
		}
		this.target = this.grid[this.finish.y][this.finish.x];
		this.possible = true;
		return true;

	},



} );


//FUNCTIONS


$( document ).ready( function () {

	document.body.appendChild( game.DOMgrid );
	game.start();

	

} );



//VARIABLES GLOBALES
var game = {

	DOMgrid: ( () => {

		function addBlank( grid ) {

			let newPixel = document.createElement( "div" );
			$( newPixel ).css( "background-color", "white" );
			grid.appendChild( newPixel );

		}

		function addNumber( grid, number ) {

			let newPixel = document.createElement( "div" );
			$( newPixel ).addClass( "pixel number" ).css( "background-color", "white" ).text( number.toString() );
			grid.appendChild( newPixel );

		}

		function addLettersLine( grid ) {

			//case vide:
			addBlank( grid );
			//8 cases:
			for ( var col = 0; col < 8; col++ ) {
				let newPixel = document.createElement( "div" );
				$( newPixel ).addClass( "pixel letter" ).css( "background-color", "white" ).text( String.fromCharCode( 65 + col ) );
				grid.appendChild( newPixel );
			}
			//case vide:
			addBlank( grid );

		}

		var newGrid = document.createElement( "div" );
		newGrid.className = "grid";

		let px = 0;

		//première ligne : 8 lettres + 2 vides.
		addLettersLine( newGrid );

		//8 lignes de 8 cases + 2 fois le numéro de la case au début et fin.
		for ( var line = 8; line >= 1; line-- ) {
			//numéro:
			addNumber( newGrid, line );
			//8 cases:
			for ( var col = 1; col <= 8; col++ ) {
				let newPixel = document.createElement( "div" );
				$( newPixel ).addClass( "pixel square" )
				newGrid.appendChild( newPixel );
				if ( ( col ^ line ) % 2 ) {
					$( newPixel ).css( "background-color", "#D2CC9F" );
				}
				else {
					$( newPixel ).css( "background-color", "#493018" );
				}
				$( newPixel ).prop( "id", `${line}_${col}` );
				px++;

			}
			//numéro:
			addNumber( newGrid, line );
		}
		//dernière ligne: 8 lettres + 2 vides.
		addLettersLine( newGrid );


		return newGrid;

	} )(),

	gridMatrix: []

};

{
	let line = [];
	line.length = 8;
	line.fill( 0 );

	game.gridMatrix.length = 8;
	for ( let x = 0; x < 8; x++ ) {
		game.gridMatrix[x] = line.slice();
	}
}

game.players = {
	white: new Player( game, 'white' ),
	black: new Player( game, 'black' )
}

game.players.white.opponent = game.players.black;

Object.assign( game, {

	start: function () {
		game.displayPieces();
		game.players.white.playing = true;
	},

	displayPieces: function () {

		for ( let y = 0; y < 8; y++ ) {
			for ( let x = 0; x < 8; x++ ) {
				if ( this.gridMatrix[y][x] ) {
					let piece = this.gridMatrix[y][x];
					this.getDomElem( piece.line, piece.col ).append( piece.img );
                }
            }
        }

	},

	getDomElem: function ( line, col ) {
		return $( `#${line}_${col}` )
	},

	moveImgHandler: function ( e ) {

		//ici faire un Event listener pour enlever les cases jaunes et les listeners.
		let moves = e.data.actions.moves;
		let captures = e.data.actions.captures;
		let game = e.data.player.game;
		let piece = e.data.piece;
		let pixels = e.data.pixels;
		let player = e.data.player;

		//on empêche le joueur de cliquer sur plusieurs pièces à la fois.
		player.stopHandlingClick()

		

		game.colorPixels( pixels.moves, "yellow" );
		game.colorPixels( pixels.captures, "red" );

		for ( let id = 0; id < moves.length; id++ ) {
			game.getDomElem( moves[id].finish.y + 1, moves[id].finish.x + 1 ).css( "background-color", "yellow" ).click( Object.assign( { move: moves[id] }, e.data ), function ( e ) {
				e.data.player.movePiece( e.data.move );
				//ici enlever les cases jaunes ou faire un Event pour
				game.resetPixels( pixels.moves );
				game.resetPixels( pixels.captures );
			} );
		}

		for ( let id = 0; id < captures.length; id++ ) {
			game.getDomElem( captures[id].finish.y + 1, captures[id].finish.x + 1 ).css( "background-color", "red" ).click( Object.assign( { capture: captures[id] }, e.data ), function ( e ) {
				e.data.player.capturePiece( e.data.capture );
				//ici enlever les cases jaunes ou faire un Event pour
				game.resetPixels( pixels.moves );
				game.resetPixels( pixels.captures );
			} );
		}


		//si on reclique sur l'image, on revient comme avant.
		$( e.data.domElement ).one( "click", e.data, function ( e ) {
			game.resetPixels( e.data.pixels.moves );
			game.resetPixels( e.data.pixels.captures );
			e.data.player.startHandlingClick();

		} );

	},

	colorPixels: function ( pixels, color ) {

		for ( let i = 0; i < pixels.length; i++ ) {
			this.colorPixel( pixels[i], color );
		}

	},

	resetPixels: function ( pixels ) {

		for ( let i = 0; i < pixels.length; i++ ) {
			let pixel = pixels[i];
			if ( ( pixel.col ^ pixel.line ) % 2 ) {
				this.colorPixel( pixel, "#D2CC9F" );
			}
			else {
				this.colorPixel( pixel, "#493018" );
			}

			this.getDomElem( pixel.line, pixel.col ).off();

		}

	},

	colorPixel: function ( pixel, color ) {

		this.getDomElem( pixel.line, pixel.col ).css( "background-color", color );

	},

	getMatrixCopy(copiedMatrix) {

		newMatrix = [];
		newMatrix.length = 8;

		for ( let y = 0; y < copiedMatrix.length; y++ ) {
			for ( let x = 0; x < copiedMatrix[y].length; x++ ) {
				let content = copiedMatrix[y][x];
				if ( typeof content == 'object' ) {
					content = Object.assign
				}
			}
			
		}

		let line = [];
		line.length = 8;
		line.fill( 0 );
		
		

	},

	checkmate: function (winner, looser) {

	},

	stalemate: function () {

    }

} );


var allKnightMvments = [];

{
	let Mvment1 = [1, -1];
	let Mvment2 = [2, -2];
	for ( let i = 0; i < 2; i++ ) {
		for ( let j = 0; j < 2; j++ ) {
			allKnightMvments.push(
				{
					x: Mvment1[i],
					y: Mvment2[j]
				},
				{
					x: Mvment2[j],
					y: Mvment1[i]
				} );
		}
	}
}