$(function(){
  // TODO: Multiple Chess Sets

  var $selected_piece;

  $('.piece').click(function(event){
    // TODO: Track player turns and reflect the next player in the UI.
    $selected_piece = $(this);
    resetValidMoves();
    select($selected_piece);
    showValidMovesFor($selected_piece);
    // Prevent triggering the click handler for moving a piece:
    event.stopPropagation();
  });

  function resetValidMoves(){
    // Reset previous valid moves.
    $('.selected').removeClass('selected');
    $("table#chess td").data('validmove', 'no');
    $("table#chess td").removeClass('possible_move','impossible_move');
  }

  $('table#chess td').click(function(){
    var $space = $(this);
    moveTo($selected_piece, $space);
    $selected_piece = null;
  });

  function moveTo($piece, $space){
    // TODO: Enforce movement rules
    // TODO: Capture of pieces
    // TODO: Check and Checkmate
    $space.append($piece);
    resetValidMoves();
  }

  function select($piece){
    $piece.addClass('selected');
  }

  function showValidMovesFor($piece){
    // Apply the appropriate rules to determine valid moves:
    switch($piece.data('piece')){
      case 'queen':
        showQueenMoves($piece);
        break;
      case 'king':
        showKingMoves($piece);
        break;
      case 'rook':
        showRookMoves($piece);
        break;
      case 'bishop':
        showBishopMoves($piece);
        break;
      case 'knight':
        showKnightMoves($piece);
        break;
      case 'pawn':
        showPawnMoves($piece);
        break;
    }
  }

  var isUnoccupied = function($space){
    return !$space.find('.piece').length;
  }

  function showQueenMoves($queen){
    // Movement Rules:
    // Can move any number of spaces in any direction (TODO)
    // No jumping (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showKingMoves($king){
    // Movement Rules:
    // Can move one space in any direction (TODO)
    // Castling: :( (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showRookMoves($rook){
    // Movement Rules:
    // Can move any number of spaces in the cardinal directions (TODO)
    // No jumping (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showBishopMoves($bishop){
    // Movement Rules:
    // Can move any number of spaces in the diagonal directions (TODO)
    // No jumping (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showKnightMoves($knight){
    // Movement Rules:
    // Can move to any square that is either two spaces x and one space y away, or is one space x away and two spaces y away (TODO)
    // Jumping is encouraged (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showPawnMoves($pawn){
    // Movement Rules:
    // * Can move one square forward, to an unoccupied square (TODO)
    markMoveValidIf(spaceRelativeTo($pawn, 0, 1), isUnoccupied);
    // * On first move, it can move two squares forward, if both are unoccupied (TODO)
    // No jumping (TODO)

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
});
