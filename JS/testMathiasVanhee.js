$( document ).ready( function () {

	document.body.appendChild( DOMgridExample );

} );



var DOMgridExample = ( () => {
	
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

} )();


//CLASSES

function Player() {

}

function Piece( line = 1, col = 1, color = "white" ) {
	this.line = line;
	this.col = col;
	this.color = color;
}

Object.assign( Piece.prototype, {

	move: function ( line, col ) {

		this.line = line;
		this.col = col;


	}

} );

 

function Pawn( line = 1, col = 1, color = "white" ) {

	Piece.call( this, line, col, color );

	this.type = 'Pawn';

	this.img = $( document.createElement( 'img' ) ).prop( 'src', `DATA/img/pieces/${color[0]}/pawn.png` );

}

Pawn.prototype = Object.assign( Object.create( Piece.prototype ), {

	constructor: Pawn,

	move: function ( line, col ) {

		Piece.prototype.move.call( this, line, col );

	}

} );

//FUNCTIONS
function getDomElem( line, col ) {
	return $( `#${line}_${col}`)
}
