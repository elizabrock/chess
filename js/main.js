$(function(){
  // TODO: Player cannot make a move that puts their king in check
  // TODO: Check and Checkmate
  // TODO: (In Class) Animate piece movement

  var currentPlayer = 'white';
  var $captureBox = $("#captured");
  var $currentPlayerSpan = $("#current-player");
  var $lastPieceMoved;
  var $pieceChooser = $('#piece-promotion');
  var $selectedPiece;
  var $spaces = $("table#chess td");

  //
  // Event Handlers:
  //

  // TODO: (In Class) Remember the chosen chess set ;)
  $("#set-picker").on('change', function(){
    $spaces.css('font-family', this.value);
  });

  $('.piece').on('click', function(event){
    // Prevent triggering the $spaces click handler:
    event.stopPropagation();
    var $this_piece = $(this);
    capture($this_piece) || select($this_piece);
  });

  $spaces.on('click', function(){
    if(!$selectedPiece){
      return;
    }
    var $space = $(this);
    moveTo($selectedPiece, $space);
    $selectedPiece = null;
  });

  //
  // Basic Actions:
  //

  function capture($piece, shouldSkipValidation){
    if(!$selectedPiece || $selectedPiece === $piece){
      return false;
    }
    if(moveTo($selectedPiece, $piece.closest('td'), shouldSkipValidation)){
      $piece.off('click');
      $captureBox.append($piece);
      return true;
    } else {
      return false;
    }
  }

  function moveTo($piece, $space, shouldSkipValidation){
    // Only allow movement to a valid space
    if(!shouldSkipValidation && $space.attr('data-validmove') !== 'possible'){
      return false;
    }
    var moveNumber = $piece.attr('data-hasmoved') || 0;
    $piece.attr('data-hasmoved', 1 + moveNumber);
    $space.append($piece);
    $lastPieceMoved = $piece;
    resetValidMoves();
    captureEnPassantIfNecessary($piece, $space);
    castleIfNecessary($piece);
    promoteIfNecessary($piece);
    checkForCheck();
    switchPlayer();
    return true;
  }

  function select($piece){
    if(currentPlayer === player($piece)){
      resetValidMoves();
      $selectedPiece = $piece;
      markSpacesValid(validMovesFor($piece));
      $piece.addClass('selected');
    }
  }

  function switchPlayer(){
    currentPlayer = (currentPlayer === 'white') ? 'black' : 'white';
    $currentPlayerSpan.text(currentPlayer);
  }

  //
  // Special Rules:
  //

  function castleIfNecessary($piece){
    // If the piece is a king, on it's first move, next to a Castle
    if($piece.attr('data-piece') === 'king' && $piece.attr('data-hasmoved') === '1'){
      var $leftRook = spaceRelativeTo($piece, -2, 0).find(".piece[data-piece='rook'][data-player='"+currentPlayer+"']");
      if(!!$leftRook.length && hasNotMoved($leftRook)){
        moveTo($leftRook, spaceRelativeTo($leftRook, 3, 0), true);
        switchPlayer(); // To reverse the automatic player switching on moves.
      }
      var $rightRook = spaceRelativeTo($piece, 1, 0).find(".piece[data-piece='rook'][data-player='"+currentPlayer+"']");
      if(!!$rightRook.length && hasNotMoved($rightRook)){
        moveTo($rightRook, spaceRelativeTo($rightRook, -2, 0), true);
        switchPlayer(); // To reverse the automatic player switching on moves.
      }
    }
  }

  function captureEnPassantIfNecessary($piece, $space){
    // If the piece is a pawn, with a pawn to the left of it that has only moved once
    if($piece.attr('data-piece') === 'pawn' && !!spaceRelativeTo($piece, 0, 3)){
      var $pawn = spaceRelativeTo($piece, 0, -1).find(".piece[data-piece='pawn'][data-player='"+enemy(player($piece))+"']");
      if(!!$pawn && $pawn.attr("data-hasmoved") === "1"){
        $selectedPiece = $piece;
        capture($pawn, true);
        moveTo($piece, $space, true);
      }
    }
  }

  function checkForCheck(){
    var $kings = $("table .piece[data-piece='king']");
    $kings.attr('data-checked', 'false');
    var $piecesInPlay = $("table .piece");
    $kings.each(function(index, king){
      var $king = $(king);
      if( _.any($piecesInPlay, function(piece){ return canCapture($(piece), $king) })){
        $king.attr('data-checked', 'true');
        return true;
      }
    });
    return false;
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

  //
  // Movement Validation:
  //

  function resetValidMoves(){
    // Reset previous valid moves.
    if(!!$selectedPiece){
      $selectedPiece.removeClass('selected');
    }
    $selectedPiece = null;
    $spaces.attr('data-validmove', 'no');
    $spaces.removeClass('possible impossible');
  }

  function validMovesFor($piece){
    // Apply the appropriate rules to determine valid moves:
    var validMoves;
    switch($piece.attr('data-piece')){
      case 'queen':
        validMoves = movesForQueen($piece);
        break;
      case 'king':
        validMoves = movesForKing($piece);
        break;
      case 'rook':
        validMoves = movesForRook($piece);
        break;
      case 'bishop':
        validMoves = movesForBishop($piece);
        break;
      case 'knight':
        validMoves = movesForKnight($piece);
        break;
      case 'pawn':
        validMoves = movesForPawn($piece);
        break;
    }
    return validMoves;
  }

  //
  // Movement Validation Helpers:
  //

  var canCapture = function($piece, $victim){
    var $victimSpace = $victim.closest('td');
    var validMoves = validMovesFor($piece);
    return _.any(validMoves, function($space){
      return $space.is($victimSpace);
    });
  }

  var cannotMovePast = function($space, $piece){
    var pieceInPlay = $space.find(".piece").length;
    return !!pieceInPlay;
  }

  function enemy(ofPlayer){
    return (ofPlayer === 'white')? 'black' : 'white';
  }

  function player($piece){
    return $piece.attr('data-player');
  }

  var hasNotMoved = function($piece){
    return !($piece.attr('data-hasmoved') >= 1)
  }

  var isEnemySpace = function($space, player){
    return !!$space.find(".piece[data-player='"+enemy(player)+"']").length;
  }

  var isUnoccupied = function($space){
    return !$space.find('.piece').length;
  }

  var isNotMyPiece = function($space, player){
    return !$space.find(".piece[data-player='" + player + "']").length;
  }

  var isEnemyPawnThatHasMovedOnce = function($space, player){
    var $pawn = $space.find(".piece[data-piece='pawn'][data-player='"+enemy(player)+"']");
    var justMoved = $pawn.is($lastPieceMoved);
    var wasFirstMove = $pawn.attr('data-hasmoved') === "1";
    return !!$pawn && justMoved && wasFirstMove;
  }

  var maximum_move_distances = [1, 2, 3, 4, 5, 6, 7, 8];

  function cardinalMoves($piece){
    var validMoves = [];
    _.detect(maximum_move_distances, function(x){
      var $space = spaceRelativeTo($piece, x, 0);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    _.detect(maximum_move_distances, function(x){
      var $space = spaceRelativeTo($piece, -x, 0);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    _.detect(maximum_move_distances, function(y){
      var $space = spaceRelativeTo($piece, 0, y);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    _.detect(maximum_move_distances, function(y){
      var $space = spaceRelativeTo($piece, 0, -y);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    return validMoves;
  }

  function diagonalMoves($piece){
    var validMoves = [];
    _.detect(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, -distance, distance);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    _.detect(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, -distance, -distance);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    _.detect(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, distance, distance);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    _.detect(maximum_move_distances, function(distance){
      var $space = spaceRelativeTo($piece, distance, -distance);
      if(isNotMyPiece($space, player($piece))){
        validMoves.push($space);
      }
      return cannotMovePast($space);
    });
    return validMoves;
  }

  function movesForQueen($queen){
    // Can move any number of spaces in any direction
    return cardinalMoves($queen).concat(diagonalMoves($queen));
  }

  function movesForKing($king){
    var validMoves = [];
    // Can move one space in any direction
    validCombinations = [
      [-1, 1],  [0, 1],  [1, 1],
      [-1, 0],           [1, 0],
      [-1, -1], [0, -1], [1, -1]];
    _.each(validCombinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      var $piece = spaceRelativeTo($king, x, y);
      if(isNotMyPiece($piece, player($king))){
        validMoves.push($piece);
      }
    });
    // Castling
    // TODO: The King can't pass through a square that is under attack.
    // TODO: The king may not castle into check, out of check, or through check.
    var $rook = spaceRelativeTo($king, 3, 0).find(".piece[data-piece='rook']");
    var $castleSpace = spaceRelativeTo($king, 2, 0);
    var inBetweenSpaces = [spaceRelativeTo($king, 1, 0), $castleSpace];
    if(hasNotMoved($king) && hasNotMoved($rook) && _.all(inBetweenSpaces, isUnoccupied)){
      validMoves.push($castleSpace);
    }

    var $rook = spaceRelativeTo($king, -4, 0).find(".piece[data-piece='rook']");
    var $castleSpace = spaceRelativeTo($king, -2, 0);
    var inBetweenSpaces = [spaceRelativeTo($king, -1, 0), $castleSpace, spaceRelativeTo($king, -2, 0)];
    if(hasNotMoved($king) && hasNotMoved($rook) && _.all(inBetweenSpaces, isUnoccupied)){
      validMoves.push($castleSpace);
    }
    return validMoves;
  }

  function movesForRook($rook){
    // Can move any number of spaces in the cardinal directions
    return cardinalMoves($rook);
  }

  function movesForBishop($bishop){
    // Can move any number of spaces in the diagonal directions
    return diagonalMoves($bishop);
  }

  function movesForKnight($knight){
    // Can move to any square that is either two spaces x and one space y away, or is one space x away and two spaces away
    var possibleCombinations = [
      spaceRelativeTo($knight, -2, -1),
      spaceRelativeTo($knight, -2,  1),
      spaceRelativeTo($knight, -1, -2),
      spaceRelativeTo($knight, -1,  2),
      spaceRelativeTo($knight,  1, -2),
      spaceRelativeTo($knight,  1,  2),
      spaceRelativeTo($knight,  2, -1),
      spaceRelativeTo($knight,  2,  1)
    ];
    return _.filter(possibleCombinations, function($space){
      return isNotMyPiece($space, player($knight));
    });
  }

  function movesForPawn($pawn){
    var validMoves = [];

    // Can move one square forward, to an unoccupied square
    var $oneSpaceForward = spaceRelativeTo($pawn, 0, 1);
    if(isUnoccupied($oneSpaceForward)){
      validMoves.push($oneSpaceForward);
    }

    // On the first move only, the pawn can move two squares forward, if both are unoccupied
    var $twoSpacesForward = spaceRelativeTo($pawn, 0, 2);
    if(hasNotMoved($pawn) && isUnoccupied($oneSpaceForward) && isUnoccupied($twoSpacesForward)){
      validMoves.push($twoSpacesForward);
    }

    // Pawns capture forward diagonally
    validCombinations = [[-1, 1], [1, 1]];
    _.each(validCombinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      var $space = spaceRelativeTo($pawn, x, y);
      if(isEnemySpace($space, player($pawn))){
        validMoves.push($space);
      }
    });

    // En passant
    validCombinations = [[-1, 0], [1, 0]];
    _.each(validCombinations, function(combination){
      var x = combination[0];
      var y = combination[1];
      var eligibleEnPassantSpace = !!spaceRelativeTo($pawn, 0, 3)[0];
      var enemyPawnPassed = isEnemyPawnThatHasMovedOnce(spaceRelativeTo($pawn, x, y), player($pawn));
      var $passantSpace = spaceRelativeTo($pawn, x, 1);
      if(eligibleEnPassantSpace && enemyPawnPassed && isUnoccupied($passantSpace)){
        validMoves.push($passantSpace);
      }
    });
    return validMoves;
  }

  function markSpacesValid(spaces){
    spaces.forEach(function(space){
      space.attr('data-validmove', 'possible');
      space.addClass('possible');
    });
  }

  //
  // Dom Traversal:
  //

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
    if(player($piece) === 'black'){
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
