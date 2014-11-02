$(function(){
  // TODO: Multiple Chess Sets

  var $spaces = $("table#chess td");
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
    $spaces.data('validmove', 'no');
    $spaces.removeClass('possible_move impossible_move');
  }

  $spaces.click(function(){
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

  var exists = function($space){
    return true;
    // return !!$space;
  }

  var maximum_move_distances = [-8, -7, -6, -5, -4, -3, -2, -1,
                                1, 2, 3, 4, 5, 6, 7, 8];
  function showQueenMoves($queen){
    // Movement Rules:
    // Can move any number of spaces in any direction
    _.each(maximum_move_distances, function(distance){
      var x = distance;
      var y = distance;
      markMoveValidIf(spaceRelativeTo($queen, x, y), exists);
      markMoveValidIf(spaceRelativeTo($queen, x, -y), exists);
    });
    // No jumping (TODO)
    // Capture Rules:
    // Standard (TODO)
    // combination_seeds = [-8, -7, -6, -5, -4, -3, -2, -1, 0];
    // _.each(combination_seeds, function(x){
    //   _.each(combination_seeds, function(y){
    //     markMoveValidIf(spaceRelativeTo($queen, x, y), exists);
    //   });
    // });
  }

  function showKingMoves($king){
    // Movement Rules:
    // Can move one space in any direction
    valid_combinations = [
      [-1, 1],  [0, 1],  [1, 1],
      [-1, 0],           [1, 0],
      [-1, -1], [0, -1], [1, -1]];
    _.each(valid_combinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      markMoveValidIf(spaceRelativeTo($king, x, y), exists);
    });
    // Castling: :( (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showRookMoves($rook){
    // Movement Rules:
    // Can move any number of spaces in the cardinal directions
    _.each(maximum_move_distances, function(distance){
      var x = distance;
      var y = distance;
      markMoveValidIf(spaceRelativeTo($rook, x, 0), exists);
      markMoveValidIf(spaceRelativeTo($rook, 0, y), exists);
    });
    // No jumping (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showBishopMoves($bishop){
    // Movement Rules:
    // Can move any number of spaces in the diagonal directions
    _.each(maximum_move_distances, function(distance){
      var x = distance;
      var y = distance;
      markMoveValidIf(spaceRelativeTo($bishop, x, y), exists);
      markMoveValidIf(spaceRelativeTo($bishop, x, -y), exists);
    });
    // No jumping (TODO)
    // Capture Rules:
    // Standard (TODO)
  }

  function showKnightMoves($knight){
    // Movement Rules:
    // Can move to any square that is either two spaces x and one space y away, or is one space x away and two spaces away
    valid_combinations = [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2],  [1, 2],
      [2, -1],  [2, 1]
    ];
    _.each(valid_combinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      markMoveValidIf(spaceRelativeTo($knight, x, y), exists);
    });

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
