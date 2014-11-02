$(function(){

  $('.piece').click(function(){
    var $piece = $(this)
    select($piece);
    showValidMovesFor($piece);
  });

  function select($piece){
    $('.selected').removeClass('selected');
    $piece.addClass('selected');
  }

  function showValidMovesFor($piece){
    // Reset previous valid moves.
    $("table#chess td").data('validmove', 'no');
    $("table#chess td").removeClass('possible_move','impossible_move');

    // Apply the appropriate rules to determine valid moves:
    if( $piece.data('piece') === 'pawn' ){
      showPawnMoves($piece);
    }
  }

  function spaceRelativeTo($piece, forwardx, forwardy){
    // Eliza's Movement Traversal Philosophy:
    // x <--->
    // x, y is relative to the piece's direction of movement
    // ..so, we'll have to reverse the coordinates for black pieces.

    // | -1, 2  | 0, 2  | 1, 2  |
    // | -1, 1  | 0, 1  | 1, 1  |
    // | -1, 0  | piece | 1, 0  |
    // | -1, -1 | 0, -1 | 1, -1 |

    var x = forwardx;
    var y = forwardy;

    // if piece is black, reverse the x and y to match reality
    if($piece.data('player') === 'black'){
      x = -1 * x;
      y = -1 * y;
    }

    var $currentSpace = $piece.closest('td');
    // Traverse x, to the correct column
    if( x === 0 ){ // Do nothing
    } else {
      var neighbors;
      if(x > 0){  // Go right
        neighbors = $currentSpace.nextAll('td');
      } else {    // Go left
        neighbors = $currentSpace.prevAll('td');
        x = -1 * x;
      }
      $currentSpace = $(neighbors[x-1]); // 0 indexed, so we have to offset
    }

    // Then traverse y, to the correct row
    if(y === 0){ // Do nothing
      return $currentSpace;
    }

    var neighbors;
    if( y > 0 ){ // Go forward
      neighbors = $currentSpace.parent().prevAll();
    } else {     // Go backward
      neighbors = $currentSpace.parent().nextAll();
      y = -1 * y;
    }
    var $correctRow = $(neighbors[y-1]); // 0 indexed, so we have to offset
    return $($correctRow.find('td')[$currentSpace.prevAll().length - 1]);
  }

  var isUnoccupied = function($space){
    return !$space.find('.piece').length;
  }

  function showPawnMoves($pawn){
    // Movement Rules:
    // * Can move one square forward, to an unoccupied square (TODO)
    markMoveValidIf(spaceRelativeTo($pawn, 0, 1), isUnoccupied);
    // * On first move, it can move two squares forward, if both are unoccupied (TODO)

    // Capture Rules:
    //  * Captures diagonally forward (TODO)
    //  * En passant (TODO)
  }

  // Calling this predicateFunction is redundant,
  // but I want to be super clear about what this is.
  function markMoveValidIf($space, predicateFunction){
    if(predicateFunction($space)){
      $space.data('validmove', 'possible');
      $space.addClass('possible_move');
    } else {
      $space.data('validmove', 'impossible');
      $space.addClass('impossible_move');
    }
  }
});
