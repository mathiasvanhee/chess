//CLASSES

function Player( grid, color = 'white' ) {

	this.grid = grid;

	this.color = color;

	if ( this.color === 'white' ) {
		this.playing = true;
	}
	else {
		this.playing = false;
	}

	this.piecesObj = {

		pawns: [],

		rooks: [],

		knights: [],

		bishops: [],

		queen: null,

		king: null
	};

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

Object.assign( Player.prototype, {

	displayOnGrid: function () {

		for ( let id = 0; id < this.piecesList.length; id++ ) {
			let piece = this.piecesList[id];
			game.getDomElem( piece.line, piece.col ).append( piece.img );
		}

	},

	findAllMoves: function () {

		//on ne regarde pas ici si le roi est sous contrôle.

		let moves = [];
		let captures = [];

		//pawns: deplacement vers l'avant et prise de diagonale-avant:
		let pawns = this.piecesObj.pawns;
		for ( let id = 0; id < pawns.length; id++ ) {

			let pawn = pawns[id];
			if ( !pawn.alive ) continue;

			//déplacement vers l'avant:
			let finish = Object.assign( {} , pawn.coordinates );
			finish.y += this.color === 'white' ? 1 : -1;
			let move = new Move( pawn, finish, this.grid );
			if ( move.isPossible() ) {
				moves.push( move );
			}

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
				let finish = Object.assign( {} , knight.coordinates );
				finish.x += allKnightMvments[i].x
				finish.y += allKnightMvments[i].y
				knight.checkAttackMove( finish, moves, captures, this.grid )
			}

		}


		//bishops:
		let bishops = this.piecesObj.bishops;
		for ( let id = 0; id < bishops.length; id++ ) {

			let bishop = bishops[id];

			bishop.addLinearMoves( +1, +1, moves, captures );
			bishop.addLinearMoves( +1, -1, moves, captures );
			bishop.addLinearMoves( -1, +1, moves, captures );
			bishop.addLinearMoves( -1, -1, moves, captures );

		}

		//queen:
		let queen = this.piecesObj.queen;
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

		move.piece.coordinates = Object.assign( {}, move.finish );
		this.grid[move.source.y][move.source.x] = 0;
		this.grid[move.source.y][move.source.x] = move.piece;
		this.playing = false;
		this.opponent.playing = true;
		//faire un event pour bouger les images sur l'échiquier.

	},

	capturePiece: function ( capture = new Capture ) {

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

		let move = new Move( this, finish, this.grid );

		if ( move.isPossible() ) {
			moves.push( move );
		}

		else {
			let capture = new Capture( this, finish, this.grid );
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
		dist = 0;
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



function Move( piece = new Piece, finish = { x: 0, y: 0}, grid ) {
	this.piece = piece;
	this.pieceId = piece.id;
	this.source = piece.coordinates;
	this.finish = finish;
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
	this.piece = piece;
	this.pieceId = piece.id;
	this.source = piece.coordinates;
	this.finish = finish;
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
			$( newPixel ).addClass( "pixel" ).css( "background-color", "white" ).text( number.toString() );
			grid.appendChild( newPixel );

		}

		function addLettersLine( grid ) {

			//case vide:
			addBlank( grid );
			//8 cases:
			for ( var col = 0; col < 8; col++ ) {
				let newPixel = document.createElement( "div" );
				$( newPixel ).addClass( "pixel" ).css( "background-color", "white" ).text( String.fromCharCode( 65 + col ) );
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
				$( newPixel ).addClass( "pixel" )
				newGrid.appendChild( newPixel );
				if ( ( col ^ line ) % 2 ) {
					$( newPixel ).css( "background-color", "#DCDCDC" );
				}
				else {
					$( newPixel ).css( "background-color", "#493E2E" );
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
	white: new Player( game.gridMatrix, 'white' ),
	black: new Player( game.gridMatrix, 'black' )
}

game.players.white.opponent = game.players.black;

Object.assign( game, {

	start: function () {
		game.players.white.displayOnGrid();
		game.players.black.displayOnGrid()
	},

	getDomElem: function ( line, col ) {
		return $( `#${line}_${col}` )
	}

} )


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