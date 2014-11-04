$(function(){
  // TODO: Player cannot make a move that puts their king in check
  // TODO: Check and Checkmate

  var $spaces = $("table#chess td");
  var $captureBox = $("#captured");
  var $pieceChooser = $('#piece-promotion');
  var $lastPieceMoved;
  // TODO: Rename this:
  var $selected_piece;

  // Chess Set Picker
  // TODO: Remember the choosen chess set ;)
  $("#set-picker").on('change', function(){
    $spaces.css('font-family', this.value);
  });

  $('.piece').on('click', function(event){
    // TODO: Track player turns and reflect the next player in the UI.
    // Prevent triggering the click handler for moving a piece:
    event.stopPropagation();
    var $this_piece = $(this);
    capture($this_piece) || select($this_piece);
  });

  $spaces.on('click', function(){
    if(!$selected_piece){
      return;
    }
    var $space = $(this);
    moveTo($selected_piece, $space);
    $selected_piece = null;
  });

  function capture($piece){
    if(!$selected_piece || $selected_piece === $piece){
      return false;
    }
    if(moveTo($selected_piece, $piece.closest('td'))){
      // TODO: Move the rook along with the king, when castling
      $piece.off('click');
      $captureBox.append($piece);
      return true;
    } else {
      return false;
    }
  }

  function moveTo($piece, $space){
    // Only allow movement to a valid space
    if($space.attr('data-validmove') !== 'possible'){
      return false;
    }
    var moveNumber = $piece.attr('hasmoved') || 0;
    $piece.attr('hasmoved', moveNumber + 1);
    $space.append($piece);
    $lastPieceMoved = $piece;
    resetValidMoves();
    promoteIfNecessary($piece);
    return true;
  }

  function promoteIfNecessary($piece){
    // If the piece is a pawn and there are no more spaces in front of it.
    if($piece.attr('data-piece') === 'pawn' && !spaceRelativeTo($piece, 0, 1).length){
      var piecePosition = $piece[0].getBoundingClientRect();
      $("#underlay").show();
      $pieceChooser.css({top: (piecePosition.bottom - 24), left: (piecePosition.right - 24)});
      var $pieces = $pieceChooser.find('.piece')
      $pieces.on('click', function(){
        $pieces.off('click');
        var $newPiece = $(this);
        $piece.attr('data-piece', $newPiece.data('piece'));
        $pieceChooser.css({bottom: 0, left: 0})
        $("#underlay").hide();
      });
    }
  }

  function select($piece){
    resetValidMoves();
    $selected_piece = $piece;
    showValidMovesFor($piece);
    $piece.addClass('selected');
  }

  function resetValidMoves(){
    // Reset previous valid moves.
    if(!!$selected_piece){
      $selected_piece.removeClass('selected');
    }
    $selected_piece = null;
    $spaces.attr('data-validmove', 'no');
    $spaces.removeClass('possible impossible');
  }

  function showValidMovesFor($piece){
    // Apply the appropriate rules to determine valid moves:
    switch($piece.attr('data-piece')){
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

  var cannotMovePast = function($space, $piece){
    var pieceInPlay = $space.find(".piece").length;
    return !!pieceInPlay;
  }

  var hasNotMoved = function($piece){
    return !($piece.attr('hasmoved') >= 1)
  }

  var isEnemySpace = function($space){
    //TODO: I've hardcoded black and white here.
    return !!$space.find(".piece[data-player='black']").length;
  }

  var isUnoccupied = function($space){
    return !$space.find('.piece').length;
  }

  var isNotMyPiece = function($space){
    //TODO: I've hardcoded black and white here.
    return !$space.find(".piece[data-player='white']").length;
  }

  var isEnemyPawnThatHasMovedOnce = function($space){
    //TODO: I've hardcoded black and white here.
    var $pawn = $space.find(".piece[data-piece='pawn'][data-player='black']");
    var justMoved = $pawn.is($lastPieceMoved);
    var wasFirstMove = $pawn.attr('hasmoved') === "1";
    return !!$pawn && justMoved && wasFirstMove;
  }

  var maximum_move_distances = [1, 2, 3, 4, 5, 6, 7, 8];

  function showCardinalMoves($piece){
    _.find(maximum_move_distances, function(x){
      var $space = spaceRelativeTo($piece, x, 0);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
    _.find(maximum_move_distances, function(x){
      var $space = spaceRelativeTo($piece, -x, 0);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
    _.find(maximum_move_distances, function(y){
      var $space = spaceRelativeTo($piece, 0, y);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
    _.find(maximum_move_distances, function(y){
      var $space = spaceRelativeTo($piece, 0, -y);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
  }

  function showDiagonalMoves($piece){
    _.find(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, -distance, distance);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
    _.find(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, -distance, -distance);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
    _.find(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, distance, distance);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
    _.find(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, distance, -distance);
      markMoveValidIf($space, isNotMyPiece);
      return cannotMovePast($space);
    });
  }

  function showQueenMoves($queen){
    // Can move any number of spaces in any direction
    showCardinalMoves($queen);
    showDiagonalMoves($queen);
  }

  function showKingMoves($king){
    // Can move one space in any direction
    valid_combinations = [
      [-1, 1],  [0, 1],  [1, 1],
      [-1, 0],           [1, 0],
      [-1, -1], [0, -1], [1, -1]];
    _.each(valid_combinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      markMoveValidIf(spaceRelativeTo($king, x, y), isNotMyPiece);
    });
    // Castling
    // TODO: The King can't pass through a square that is under attack.
    // TODO: The king may not castle into check, out of check, or through check.
    var $rook = spaceRelativeTo($king, 3, 0).find(".piece[data-piece='rook']");
    var inBetweenSpaces = [spaceRelativeTo($king, 1, 0) , spaceRelativeTo($king, 2, 0)];
    if(hasNotMoved($king) && hasNotMoved($rook) && _.all(inBetweenSpaces, isUnoccupied)){
      markMoveValidIf(spaceRelativeTo($king, 2, 0), isUnoccupied);
    }
    var $rook = spaceRelativeTo($king, -4, 0).find(".piece[data-piece='rook']");
    var inBetweenSpaces = [spaceRelativeTo($king, -1, 0) , spaceRelativeTo($king, -2, 0) , spaceRelativeTo($king, -3, 0)];
    if(hasNotMoved($king) && hasNotMoved($rook) && _.all(inBetweenSpaces, isUnoccupied)){
      markMoveValidIf(spaceRelativeTo($king, -3, 0), isUnoccupied);
    }
  }

  function showRookMoves($rook){
    // Can move any number of spaces in the cardinal directions
    showCardinalMoves($rook);
  }

  function showBishopMoves($bishop){
    // Can move any number of spaces in the diagonal directions
    showDiagonalMoves($bishop);
  }

  function showKnightMoves($knight){
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
      markMoveValidIf(spaceRelativeTo($knight, x, y), isNotMyPiece);
    });
  }

  function showPawnMoves($pawn){
    // Can move one square forward, to an unoccupied square
    var oneSpaceForward = spaceRelativeTo($pawn, 0, 1);
    markMoveValidIf(oneSpaceForward, isUnoccupied);
    // On the first move only, the pawn can move two squares forward, if both are unoccupied
    if(hasNotMoved($pawn) && isUnoccupied(oneSpaceForward)){
      markMoveValidIf(spaceRelativeTo($pawn, 0, 2), isUnoccupied);
    }
    // Pawns capture forward diagonally
    valid_combinations = [[-1, 1], [1, 1]];
    _.each(valid_combinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      var $space = spaceRelativeTo($pawn, x, y);
      if(isEnemySpace($space)){
        markMoveValidIf(spaceRelativeTo($pawn, x, y), isEnemySpace);
      }
    });

    // En passant
    valid_combinations = [[-1, 0], [1, 0]];
    _.each(valid_combinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      // TODO: This falsely allows the capture of pawns that moved one space,
      // when it should only work for pawns that moved two spaces.
      markMoveValidIf(spaceRelativeTo($pawn, x, y), isEnemyPawnThatHasMovedOnce);
    });
  }

  // Calling this predicateFunction is redundant,
  // but I want to be super clear about what this is.
  function markMoveValidIf($space, predicateFunction){
    if(predicateFunction($space)){
      $space.attr('data-validmove', 'possible');
      $space.addClass('possible');
    } else {
      $space.attr('data-validmove', 'impossible');
      $space.addClass('impossible');
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
