$( document ).ready( function () {

	document.body.appendChild( game.DOMgrid );
	game.start();

} );




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

	gridMatrix:[]

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

Object.assign( game, {

	start: function () {
		game.players.white.displayOnGrid();
		game.players.black.displayOnGrid()
	},

	getDomElem: function ( line, col ) {
		return $( `#${line}_${col}` )
	}

})


//CLASSES

function Player( grid, color = 'white' ) {

	this.grid = grid;

	this.color = color;

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
			let pawn = new Piece( 'pawn', line, col, this.color, this.piecesList.length );
			this.piecesObj.pawns.push( pawn );
			this.piecesList.push( pawn );
			this.grid[line - 1][col - 1] = pawn;

		}

		line = color === 'white' ? 1 : 8;

		let rook1 = new Piece( 'rook', line, 1, this.color, this.piecesList.length );
		this.grid[line - 1][0] = rook1;
		let rook2 = new Piece( 'rook', line, 8, this.color, this.piecesList.length + 1 );
		this.grid[line - 1][7] = rook2;
		this.piecesObj.rooks.push( rook1, rook2 );
		this.piecesList.push( rook1, rook2 );

		let knight1 = new Piece( 'knight', line, 2, this.color, this.piecesList.length );
		this.grid[line - 1][1] = knight1;
		let knight2 = new Piece( 'knight', line, 7, this.color, this.piecesList.length + 1 );
		this.grid[line - 1][6] = knight2;
		this.piecesObj.knights.push( knight1, knight2 );
		this.piecesList.push( knight1, knight2 );

		let bishop1 = new Piece( 'bishop', line, 3, this.color, this.piecesList.length );
		this.grid[line - 1][2] = bishop1;
		let bishop2 = new Piece( 'bishop', line, 6, this.color, this.piecesList.length + 1 );
		this.grid[line - 1][5] = bishop2;
		this.piecesObj.bishops.push( bishop1, bishop2 );
		this.piecesList.push( bishop1, bishop2 );

		let queen = new Piece( 'queen', line, 4, this.color, this.piecesList.length );
		this.grid[line - 1][3] = queen;
		this.piecesObj.queen = queen;
		this.piecesList.push( queen );

		let king = new Piece( 'king', line, 5, this.color, this.piecesList.length );
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

	}

} );





function Piece( type = 'pawn', line = 1, col = 1, color = "white", id = 'null' ) {

	this.id = id
	this.type = type;
	this.line = line;
	this.col = col;
	this.color = color;
	this.alive = true;

	this.img = $( document.createElement( 'img' ) ).prop( 'src', `DATA/img/pieces/${color[0]}/${this.type}.png` ).addClass('piece');

}

Object.assign( Piece.prototype, {

	move: function ( line, col ) {

		this.line = line;
		this.col = col;

	}

} );




//FUNCTIONS


