var GAMEBOARD = {
  sizeX: 25,
  sizeY: 10,
  turnDelay: 1000,
  pieces: {
    head: null,
    tail: null
  },
  pieceWasTaken: false,
  viewLow: 0,
  viewHigh: 7,
  viewHeight: 8,
  viewLeft: 5,
  viewRight: 19,
  viewWidth: 15,
  score: 0,
  scoreChart: {
    perTurn: 0,
    perRow: 50,
    perPiece: {
      'bishop': 300,
      'knight': 500,
      'rook': 500,
      'queen': 1000,
      'pawn': 100
    }
  },
  pieceReplacementExpectancy: 0.9,
  gamePlan: {
    curValues: [0, 0, 0, 0, 0, 0],
    curStep: [0, 0, 0, 0, 0, 0],
    curStepRow: 0,
    curStepN: 0,

    /* eslint-disable no-multi-spaces */
    steps: [
      [10, 50, 0, 0, 0, 0],
      [30, 70, 0, 0, 0, 0],
      [20, 60, 5, 0, 0, 0],
      [20, 80, 0, 0, 0, 0],
      [10, 80, 0, 0, 0, 0],
      [20, 65, 0, 5, 0, 0],
      [10, 75, 0, 0, 0, 0],
      [20, 70, 0, 0, 4, 0],
      [10, 75, 0, 0, 0, 0],
      [20, 70, 0, 0, 0, 2],
      [10, 80, 0, 0, 0, 0],
      [200, 90, 5, 5, 3, 1]
    ],
    /* eslint-enable no-multi-spaces */
    legend: {
      'expectancy': 1,
      'bishop': 2,
      'knight': 3,
      'rook': 4,
      'queen': 5
    },
    getParam: function (column, row) {
      if (row <= this.curStepRow) {
        // reinit values
        this.curValues = [0, 0, 0, 0, 0, 0];
        this.curStep = this.steps[0];
        this.curStepRow = 0;
        this.curStepN = 0;
      }
      var adjRow = row - this.curStepRow;
      while (adjRow > this.curStep[0]) {
        if (this.curStepN === this.steps.length - 1) {
          // we are at the end of the game plan - return the last value of the game plan for the rest of the game
          return this.curStep[column];
        }
        this.curStepRow += this.curStep[0];
        adjRow -= this.curStep[0];
        this.curValues = this.curStep;
        this.curStepN += 1;
        this.curStep = this.steps[this.curStepN];
      }
      // interpolate value
      return this.curValues[column] + (this.curStep[column] - this.curValues[column]) * (adjRow / this.curStep[0]);
    },
    getTypeFreq: function (row, type) {
      return this.getParam(this.legend[type], row) / 100;
    },
    getPieceExpectancy: function (row) {
      return this.getParam(1, row) / 100;
    }
  },
  playerCannotMove: true,
  allowPlayerToMove: function (allow) {
    this.playerCannotMove = !allow;
    VIEWER.displayPlayerMove(allow);
  },
  playerMovedBack: false,
  addjustMod: function (val, mod) {
    return (val + mod) % mod;
  },
  addX: function (x, dx) {
    return this.addjustMod(x + dx, this.sizeX);
  },
  addY: function (y, dy) {
    return this.addjustMod(y + dy, this.sizeY);
  },
  isVisible: function (piece) {
    // console.log("viewLeft: "+GAMEBOARD.viewLeft);
    // if ((GAMEBOARD.addX(piece.x, -GAMEBOARD.viewLeft) < GAMEBOARD.viewWidth) && (GAMEBOARD.addY(piece.y, -GAMEBOARD.viewLow) < GAMEBOARD.viewHeight)) {
    //   piece.$view.css('border', '2px solid red');
    // } else {
    //   piece.$view.css('border', '');
    // }
    return (GAMEBOARD.addX(piece.x, -GAMEBOARD.viewLeft) < GAMEBOARD.viewWidth) && (GAMEBOARD.addY(piece.y, -GAMEBOARD.viewLow) < GAMEBOARD.viewHeight);
  },
  initGame: function () {
    var i;
    GAMEBOARD.initBoard();
    GAMEBOARD.allowPlayerToMove(true);
    GAMEBOARD.piecesCanMove = true;
    GAMEBOARD.piecesWantMove = false;
    GAMEBOARD.player.nextMove.wantMove = false;
    GAMEBOARD.maxRow = 0;
    GAMEBOARD.turn = 0;
    GAMEBOARD.score = 0;

    // add pieces
    for (i = 0; i < GAMEBOARD.sizeY; i++) {
      this.createRow(i);
    }
    // GAMEBOARD.maxRow = 0; // kind of a hack because createRow increases it
  },
  startGame: function () {
    console.log('game started');
    // this.playerInterval=setInterval(function(){GAMEBOARD.player.makeMove()}, GAMEBOARD.turnDelay);
    setTimeout(function () {
      GAMEBOARD.pieceInterval = setInterval(function () { GAMEBOARD.enqueuePiecesTurn() }, GAMEBOARD.turnDelay);
    }, GAMEBOARD.turnDelay / 2);
  },
  gameOver: function () {
    // delete intervals
    clearInterval(this.playerInterval);
    clearInterval(this.pieceInterval);
  },
  letPiecesMove: function () {
    GAMEBOARD.piecesCanMove = true;
    if (GAMEBOARD.piecesWantMove) {
      GAMEBOARD.enqueuePiecesTurn();
    }
  },
  letPlayerMove: function () {
    GAMEBOARD.allowPlayerToMove(true);
    if (GAMEBOARD.playerWantsMove()) {
      GAMEBOARD.player.enqueuePlayerMove();
    }
  },
  playerWantsMove: function () {
    return GAMEBOARD.player.nextMove.wantMove;
  },
  enqueuePiecesTurn: function () {
    var newPiece;
    if (GAMEBOARD.piecesCanMove) {
      try {
        GAMEBOARD.allowPlayerToMove(false);
        GAMEBOARD.piecesWantMove = false;
        GAMEBOARD.turn++;
        GAMEBOARD.score += GAMEBOARD.scoreChart.perTurn;
        VIEWER.updateScoreboard();
        // first check if any piece can take player
        var nextPiece = GAMEBOARD.pieces.head;
        while (nextPiece) {
          nextPiece.takePlayerIfPossible_generic();
          nextPiece = nextPiece.next;
        }
        // then move pieces
        nextPiece = GAMEBOARD.pieces.head;
        while (nextPiece) {
          nextPiece.move();
          nextPiece = nextPiece.next;
        }
        // then add new pieces if needed
        if (GAMEBOARD.pieceWasTaken) {
          newPiece = GAMEBOARD.createPiece(GAMEBOARD.player.y, GAMEBOARD.pieceReplacementExpectancy);
          GAMEBOARD.pieceWasTaken = false;
          if (newPiece) {
            VIEWER.flyInPiece(newPiece);
          }
        }
        if (GAMEBOARD.playerMovedBack) {
          newPiece = GAMEBOARD.createPiece(GAMEBOARD.addY(GAMEBOARD.player.y, GAMEBOARD.playerMovedBack), 1);
          GAMEBOARD.playerMovedBack = false;
          if (newPiece) {
            VIEWER.flyInPiece(newPiece);
          }
        }
        VIEWER.afterAnimDone(GAMEBOARD.letPlayerMove);
      } catch (e) {
        if (e.message === 'Game Over') {
          GAMEBOARD.gameOver();
          VIEWER.gameOver(e.piece);
        }
      }
    } else {
      GAMEBOARD.piecesWantMove = true;
    }
  },
  piecePrototype: {
    takePlayerIfPossible_generic: function () {
      var GameOver = function (piece) {
        return {
          message: 'Game Over',
          piece: piece
        }
      }
      if (GAMEBOARD.isVisible(this) && this.type.canTakePlayer(this)) {
        // this.type.animatePlayerDeath(this);
        throw GameOver(this);
      }
    },
    move: function () {
      var oldx, oldy;
      oldx = this.x;
      oldy = this.y;
      if (this.type.move_if_possible(this)) {
        GAMEBOARD.grid[oldx][oldy] = null;
        GAMEBOARD.grid[this.x][this.y] = this;
        VIEWER.movePiece(this, oldx, oldy);
      }
    }
  },
  piecesTypes: [],  // this has to be initialized in init ;(

  pawn: {
    prob: function (row) {
      return 1;
    },
    move_if_possible: function (piece) {
      if ((GAMEBOARD.turn + piece.y) % 2 === 0) {
        return false;
      }
      var newx = (piece.x + GAMEBOARD.sizeX - 1) % GAMEBOARD.sizeX;
      if (GAMEBOARD.grid[newx][piece.y] !== null) {
        return false;
      } else {
        piece.x = newx;
      }
      return true;
    },
    canTakePlayer (piece) {
      // ---- removed: so that pawns take on every turn even if they don't move. Otherwise the game is easily beaten.
      // if ((GAMEBOARD.turn + piece.y) % 2 === 0) {
      //     return false;
      // }
      if (GAMEBOARD.addX(piece.x, -GAMEBOARD.player.x) === 1) {
        if (GAMEBOARD.addY(piece.y, -GAMEBOARD.player.y) === 1) {
          return true;
        }
        // TODO: eat up
        if (GAMEBOARD.addY(-piece.y, GAMEBOARD.player.y) === 1) {
          return true;
        }
      }
      return false;
    },
    animatePlayerDeath: function (piece) {
      // TODO
    },
    $image: $("<img src='images/bpawn.png'>"),
    name: 'pawn'
  },

  bishop: {
    prob: function (row) {
      return GAMEBOARD.gamePlan.getTypeFreq(row, 'bishop');
    },
    move_if_possible: function (piece) {
      var weCrossedLowView = function (newy, dy) {
        return GAMEBOARD.addY(newy, (1 - dy) / 2) === GAMEBOARD.viewLow;
      }
      var dy = piece.dy || ((GAMEBOARD.turn + piece.y) % 2 === 0 ? 1 : -1);
      var newx = (piece.x + GAMEBOARD.sizeX - 1) % GAMEBOARD.sizeX;
      var newy = GAMEBOARD.addY(piece.y, dy);
      if ((GAMEBOARD.grid[newx][newy] !== null) || weCrossedLowView(newy, dy)) {
        // can't move there - try move the other way
        dy = -dy;
        newy = GAMEBOARD.addY(piece.y, dy);
        if ((GAMEBOARD.grid[newx][newy] !== null) || weCrossedLowView(newy, dy)) {
          // can't move there either - stay
          return false;
        }
      }
      piece.dy = dy;
      piece.x = newx;
      piece.y = newy;
      return true;
    },
    canTakePlayer (piece) {
      // recalculate coords relative to viewLeft,viewLow
      var x1 = GAMEBOARD.addX(piece.x, -GAMEBOARD.viewLeft);
      var y1 = GAMEBOARD.addY(piece.y, -GAMEBOARD.viewLow);
      var x2 = GAMEBOARD.addX(GAMEBOARD.player.x, -GAMEBOARD.viewLeft);
      var y2 = GAMEBOARD.addY(GAMEBOARD.player.y, -GAMEBOARD.viewLow);
      // check if piece and player on the same diagonal
      var dx = x2 - x1;
      var dy = y2 - y1;
      if (Math.abs(dx) !== Math.abs(dy)) {
        // console.log("  " + dx + "!==" + dy);
        return false;
      }
      // check if anything is between them
      var i;
      var x = piece.x;
      var y = piece.y;
      var signDy = Math.sign(dy);
      var signDx = Math.sign(dx);
      for (i = 1; i < Math.abs(dx); i++) {
        x = GAMEBOARD.addX(x, signDx);
        y = GAMEBOARD.addY(y, signDy);
        if (GAMEBOARD.grid[x][y] !== null) {
          return false;
        }
      }
      return true;
    },
    animatePlayerDeath: function (piece) {
      // TODO
    },
    $image: $("<img src='images/bbishop.png'>"),
    name: 'bishop'
  },

  knight: {
    prob: function (row) {
      return GAMEBOARD.gamePlan.getTypeFreq(row, 'knight');
    },
    moveList: [
      { dx: -2,
        dy: -1
      },
      { dx: -2,
        dy: 1
      },
      { dx: -1,
        dy: 2
      },
      { dx: -1,
        dy: -2
      },
      // we ain't using the moves below to move the piece,
      // but will take them into account to test if the piece can take the player
      { dx: 2,
        dy: -1
      },
      { dx: 2,
        dy: 1
      },
      { dx: 1,
        dy: 2
      },
      { dx: 1,
        dy: -2
      }
    ],
    moveOrder: [
      [1, 3, 2],
      [0, 2, 3],
      [1, 0, 3],
      [0, 1, 2]
    ],
    move_if_possible: function (piece) {
      var weCrossedLowView = function (oldy, dy) {
        var maxy = Math.max(oldy, oldy + dy);
        return GAMEBOARD.addY(maxy, -GAMEBOARD.viewLow) <= 1;
      }
      var doMove = function (move) {
        if (weCrossedLowView(piece.y, move.dy)) {
          return false;
        }
        var newx = GAMEBOARD.addX(piece.x, move.dx);
        var newy = GAMEBOARD.addY(piece.y, move.dy);
        if (GAMEBOARD.grid[newx][newy] !== null) {
          return false;
        }
        piece.x = newx;
        piece.y = newy;
        return true;
      };
      var i, moveOrder;
      var moveIndex = piece.moveIndex || 0;
      if (doMove(this.moveList[moveIndex])) {
        return true;
      } else {
        moveOrder = this.moveOrder[moveIndex];
        for (i = 0; i < moveOrder.length; i++) {
          if (doMove(this.moveList[moveOrder[i]])) {
            piece.moveIndex = moveOrder[i];
            return true;
          }
        }
        return false;
      }
    },
    canTakePlayer (piece) {
      // since only invisible knights can take the player through view borders,
      // we do not need to check it here - we do not allow invisible pieces take the player anyway
      var dx = Math.abs(GAMEBOARD.addX(piece.x, -GAMEBOARD.viewLeft) - GAMEBOARD.addX(GAMEBOARD.player.x, -GAMEBOARD.viewLeft));
      var dy = Math.abs(GAMEBOARD.addY(piece.y, -GAMEBOARD.viewLow) - GAMEBOARD.addY(GAMEBOARD.player.y, -GAMEBOARD.viewLow));
      var maxD = Math.max(dx, dy);
      var minD = Math.min(dx, dy);
      return (minD === 1 && maxD === 2);
    },
    animatePlayerDeath: function (piece) {
      // TODO
    },
    $image: $("<img src='images/bknight.png'>"),
    name: 'knight'
  },

  rook: {
    prob: function (row) {
      return GAMEBOARD.gamePlan.getTypeFreq(row, 'rook');
    },
    move_if_possible: function (piece) {
      var doMove = function (x, y) {
        if (GAMEBOARD.grid[x][y] !== null) {
          return false;
        } else {
          piece.x = x;
          piece.y = y;
          return true;
        }
      }
      // first try to move forward
      if (doMove(GAMEBOARD.addX(piece.x, -1), piece.y)) {
        return true;
      }
      // then try to move down
      // but only if it won't cross the lower view border
      if (piece.y !== GAMEBOARD.viewLow && doMove(piece.x, GAMEBOARD.addY(piece.y, -1))) {
        return true;
      }
      // then try to move up
      // but only if it won't cross the lower view border
      var newy = GAMEBOARD.addY(piece.y, 1);
      if (newy !== GAMEBOARD.viewLow && doMove(piece.x, newy)) {
        return true;
      }
      // then give up
      return false;
    },
    canTakePlayer (piece) {
      var x1, x2, y1, y2, i, x, y;
      // case 1: same x
      if (piece.x === GAMEBOARD.player.x) {
        // recalculate coords relative to viewLeft,viewLow
        y1 = GAMEBOARD.addY(piece.y, -GAMEBOARD.viewLow);
        y2 = GAMEBOARD.addY(GAMEBOARD.player.y, -GAMEBOARD.viewLow);
        // check if anything is between them
        x = piece.x;
        y = GAMEBOARD.addY(Math.min(y1, y2), GAMEBOARD.viewLow);
        for (i = 1; i < Math.abs(y1 - y2); i++) {
          y = GAMEBOARD.addY(y, 1);
          if (GAMEBOARD.grid[x][y] !== null) {
            return false;
          }
        }
        // so, nothing is between them...
        return true;
      }
      // case 2: same y
      if (piece.y === GAMEBOARD.player.y) {
        // recalculate coords relative to viewLeft,viewLow
        x1 = GAMEBOARD.addX(piece.x, -GAMEBOARD.viewLeft);
        x2 = GAMEBOARD.addX(GAMEBOARD.player.x, -GAMEBOARD.viewLeft);
        // check if anything is between them
        x = GAMEBOARD.addX(Math.min(x1, x2), GAMEBOARD.viewLeft);
        y = piece.y;
        for (i = 1; i < Math.abs(x1 - x2); i++) {
          x = GAMEBOARD.addX(x, 1);
          if (GAMEBOARD.grid[x][y] !== null) {
            return false;
          }
        }
        // so, nothing is between them...
        return true;
      }
      // case 3: neither
      return false;
    },
    animatePlayerDeath: function (piece) {
      // TODO
    },
    $image: $("<img src='images/brook.png'>"),
    name: 'rook'
  },

  queen: {
    prob: function (row) {
      return GAMEBOARD.gamePlan.getTypeFreq(row, 'queen');
    },
    move_if_possible: function (piece) {
      var doMove = function (x, y) {
        if (GAMEBOARD.grid[x][y] !== null) {
          return false;
        } else {
          piece.x = x;
          piece.y = y;
          return true;
        }
      }
      var newy;
      // first try to move forward
      if (doMove(GAMEBOARD.addX(piece.x, -1), piece.y)) {
        return true;
      }
      // then try to move down-forward
      // but only if it won't cross the lower view border
      if (piece.y !== GAMEBOARD.viewLow && doMove(GAMEBOARD.addX(piece.x, -1), GAMEBOARD.addY(piece.y, -1))) {
        return true;
      }
      // then try to move up-forward
      // but only if it won't cross the lower view border
      newy = GAMEBOARD.addY(piece.y, 1);
      if (newy !== GAMEBOARD.viewLow && doMove(GAMEBOARD.addX(piece.x, -1), newy)) {
        return true;
      }
      // then try to move down
      // but only if it won't cross the lower view border
      if (piece.y !== GAMEBOARD.viewLow && doMove(piece.x, GAMEBOARD.addY(piece.y, -1))) {
        return true;
      }
      // then try to move up
      // but only if it won't cross the lower view border
      newy = GAMEBOARD.addY(piece.y, 1);
      if (newy !== GAMEBOARD.viewLow && doMove(piece.x, newy)) {
        return true;
      }
      // then give up
      return false;
    },
    canTakePlayer (piece) {
      // either take as a rook
      if (GAMEBOARD.rook.canTakePlayer(piece)) {
        return true;
      }
      // or as a bishop
      return GAMEBOARD.bishop.canTakePlayer(piece);
    },
    animatePlayerDeath: function (piece) {
      // TODO
    },
    $image: $("<img src='images/bqueen.png'>"),
    name: 'queen'
  },

  pieceExpectancy: function (row) {
    return GAMEBOARD.gamePlan.getPieceExpectancy(row);
  },
  decidePieceType: function (piece) {
    var i, t, tprob;
    var rnd = Math.random();
    for (i = 0; i < GAMEBOARD.piecesTypes.length; i++) {
      t = GAMEBOARD.piecesTypes[i];
      tprob = t.prob(GAMEBOARD.maxRow);
      if (rnd > tprob) {
        // go go check other piece types
        rnd -= tprob;
      } else {
        piece.type = t;
        return;
      }
    }
    piece.type = GAMEBOARD.pawn;
  },
  createPiece: function (forRow, prob) {
    var x;
    var newPiece;
    // randomly generate a piece until we give up or get one that can be on the board
    do {
      if (Math.random() > prob) {
        return false;
      }
      x = Math.floor(Math.random() * GAMEBOARD.sizeX);
    } while (GAMEBOARD.grid[x][forRow] !== null);
    newPiece = Object.create(GAMEBOARD.piecePrototype);
    newPiece.x = x;
    newPiece.y = forRow;
    GAMEBOARD.decidePieceType(newPiece);
    GAMEBOARD.addPiece2Board(newPiece);
    return newPiece;
  },
  createPieceAndShow: function (forRow, prob) {
    var newPiece = GAMEBOARD.createPiece(forRow, prob);
    if (!newPiece) return false;
    VIEWER.showPiece(newPiece);
    return true;
  },
  createRow: function (row) {
    while (GAMEBOARD.createPieceAndShow(row, GAMEBOARD.pieceExpectancy(GAMEBOARD.maxRow))) {
      // so far createPieceAndShow does all the work
    };
    GAMEBOARD.maxRow++;
  },
  addPiece2Board: function (newPiece) {
    // add the piece to the list
    newPiece.prev = GAMEBOARD.pieces.tail;
    newPiece.next = null;
    if (GAMEBOARD.pieces.tail) {
      GAMEBOARD.pieces.tail.next = newPiece;
      GAMEBOARD.pieces.tail = newPiece;
    } else {
      GAMEBOARD.pieces.head = newPiece;
      GAMEBOARD.pieces.tail = newPiece;
    }
    // add the piece to the board grid
    GAMEBOARD.grid[newPiece.x][newPiece.y] = newPiece;
  },
  removePiece: function (piece) {
    // TODO: if piece is destroyed it should be removed from view
    //      now it is removed only when it is taken
    // remove piece from list
    if (piece.next) {
      piece.next.prev = piece.prev;
    } else {
      this.pieces.tail = piece.prev;
    }
    if (piece.prev) {
      piece.prev.next = piece.next;
    } else {
      this.pieces.head = piece.next;
    }
    // remove piece from grid
    GAMEBOARD.grid[piece.x][piece.y] = null;
    // TODO: recreate piece
  },
  destroyPiece: function (piece) {
    VIEWER.removePiece(piece);
    this.removePiece(piece);
  },
  playerTakes: function (dx, dy) {
    GAMEBOARD.pieceWasTaken = true;
    var piece = GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y];
    // update score
    GAMEBOARD.score += GAMEBOARD.scoreChart.perPiece[piece.type.name];
    // first call viewer while we have reference to a piece
    VIEWER.playerTakes(dx, dy);
    // then remove the piece
    GAMEBOARD.removePiece(piece);
    GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = GAMEBOARD.player;
  },
  playerMoves: function (dx, dy) {
    VIEWER.playerMoves(dx, dy);
    GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = GAMEBOARD.player;
  },
  player: {
    x: 12,
    y: 2,
    $movePlaceholders: $('<div></div>')
      .addClass('player movePlaceholder'),
    nextMove: {
      wantMove: false,
      dx: 0,
      dy: 0
    },
    enqueuePlayerMove: function () {
      if (GAMEBOARD.playerCannotMove) {
        return false;
      }
      var nextMove = GAMEBOARD.player.nextMove;
      var dx, dy;
      if (nextMove.wantMove) {
        GAMEBOARD.piecesCanMove = false;
        nextMove.wantMove = false;
        dx = GAMEBOARD.player.nextMove.dx;
        dy = GAMEBOARD.player.nextMove.dy;
        // remove player from grid
        GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = null;
        // calculate new coordinates
        GAMEBOARD.player.x = GAMEBOARD.addX(GAMEBOARD.player.x, dx);
        GAMEBOARD.player.y = GAMEBOARD.addY(GAMEBOARD.player.y, dy);
        // check if player takes a piece
        if (GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] !== null) {
          GAMEBOARD.playerTakes(dx, dy);
        } else {
          // player does not take but just moves
          GAMEBOARD.playerMoves(dx, dy);
        }
        GAMEBOARD.allowPlayerToMove(false);
        VIEWER.afterAnimDone(function () { GAMEBOARD.adjustBoardAfterPlayerMove(dx, dy) }); // it must also let pieces move after it finished
      }
    },
    type: {
      $image: $("<img src='images/wknight.png'>")
        .addClass('player'),
      moveList: [
        { dx: 2,
          dy: 1
        },
        { dx: 1,
          dy: 2
        },
        { dx: -1,
          dy: 2
        },
        { dx: -2,
          dy: 1
        },
        { dx: -2,
          dy: -1
        },
        { dx: -1,
          dy: -2
        },
        { dx: 1,
          dy: -2
        },
        { dx: 2,
          dy: -1
        }
      ],
      moveMaker: function (i) {
        var dx = this.moveList[i].dx;
        var dy = this.moveList[i].dy;

        return function () {
          GAMEBOARD.player.nextMove.dx = dx;
          GAMEBOARD.player.nextMove.dy = dy;
          GAMEBOARD.player.nextMove.wantMove = true;
          GAMEBOARD.player.enqueuePlayerMove();
        }
      },
      name: 'player'
    }
  },
  adjustBoardAfterPlayerMove: function (dx, dy) {
    // called during player's move
    // must let pieces move after finished
    var adjDy;
    var i, row, x;
    // did the player move back?
    if (dy < 0) {
      GAMEBOARD.playerMovedBack = -dy;
    }
    this.viewLeft = this.addX(this.viewLeft, dx);
    this.viewRight = this.addX(this.viewRight, dx);
    // y axis is harder: only move if player is more than 2 squares ahead
    adjDy = this.addY(this.player.y, -this.viewLow);
    if (adjDy > 2) {
      dy = adjDy - 2;
      this.viewLow = this.addY(this.viewLow, dy);
      this.viewHigh = this.addY(this.viewHigh, dy);
    } else {
      dy = 0;
    }
    VIEWER.adjustBoardAfterPlayerMove(dx, dy);
    VIEWER.afterAnimDone(function () {
      // recreate rows and update score
      for (i = dy; i > 0; i--) {
        GAMEBOARD.score += GAMEBOARD.scoreChart.perRow;
        row = GAMEBOARD.addY(GAMEBOARD.viewLow, -i);
        // delete pieces in row
        for (x = 0; x < GAMEBOARD.sizeX; x++) {
          if (GAMEBOARD.grid[x][row]) {
            GAMEBOARD.destroyPiece(GAMEBOARD.grid[x][row]);
          }
        }
        // recreate row
        GAMEBOARD.createRow(row);
      }
      // allow pieces to move
      GAMEBOARD.letPiecesMove();
    });
  },
  initBoard: function () {
    var x, y;
    var g = [];
    for (x = 0; x < GAMEBOARD.sizeX; x++) {
      g.push([]);
      for (y = 0; y < GAMEBOARD.sizeY; y++) {
        g[x].push(null);
      }
    }
    GAMEBOARD.piecesTypes = [
      GAMEBOARD.bishop,
      GAMEBOARD.knight,
      GAMEBOARD.rook,
      GAMEBOARD.queen,
      GAMEBOARD.pawn   // pawn must be last
    ];
    GAMEBOARD.grid = g;
    GAMEBOARD.player.x = 12;
    GAMEBOARD.player.y = 2;
    // also add player to the grid
    GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = GAMEBOARD.player;
    this.pieces = {
      head: null,
      tail: null
    };
    GAMEBOARD.viewLow = 0;
    GAMEBOARD.viewHigh = 7;
    GAMEBOARD.viewLeft = 5;
    GAMEBOARD.viewRight = 19;
  }
};

var VIEWER = {
  pieceAnimOpt: {
    'duration': 200,
    'easing': 'swing',
    'queue': false
  },
  playerAnimOpt: {
    'duration': 50,
    'easing': 'swing',
    'queue': false
  },
  boardAnimOpt: {
    'duration': 150,
    'easing': 'swing',
    'queue': false
  },
  endAnimOpt1: {
    'duration': 1000,
    'easing': 'easeInBounce',
    'queue': false
  },
  endAnimOpt2: {
    'duration': 3000,
    'easing': 'swing',
    'queue': false
  },
  endAnimOpt3: {
    'duration': 1500,
    'easing': 'swing',
    'queue': true
  },
  backdrops: {
    i: 4,
    j: 2,
    x: 10,
    y: 10
  },
  adjustBoardSize: function () {
    // calculate size of square
    var availableX, availableY;
    availableX = parseFloat(VIEWER.$gamewindow.width());
    availableY = parseFloat($(window).height());
    VIEWER.squareSize = Math.floor(Math.min(availableX / GAMEBOARD.viewWidth, availableY / GAMEBOARD.viewHeight) / 1.5);
    // set sizes of board
    VIEWER.$gamewindow.css({ 'width': GAMEBOARD.viewWidth * VIEWER.squareSize,
      'height': GAMEBOARD.viewHeight * VIEWER.squareSize
    });
    VIEWER.$gameboard.css({
      'width': GAMEBOARD.sizeX * VIEWER.squareSize,
      'height': GAMEBOARD.sizeY * VIEWER.squareSize,
      'left': 0,
      'bottom': 0
    });
    this.maxJumpToAnimate = 7 * this.squareSize;
  },
  viewX: function (x) {
    return GAMEBOARD.addX(x, -GAMEBOARD.viewLeft) * VIEWER.squareSize;
  },
  viewY: function (y) {
    return GAMEBOARD.addY(y, -GAMEBOARD.viewLow) * VIEWER.squareSize;
  },
  updateScoreboard: function () {
    var pad = function (n, width, z) {
      z = z || '0';
      n = n + '';
      return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    VIEWER.$infoTurn.text(pad(GAMEBOARD.turn, 5));
    VIEWER.$infoRow.text(pad(GAMEBOARD.maxRow - 10, 5));
    VIEWER.$infoScore.text(pad(GAMEBOARD.score, 7));
  },
  showSprite: function ($proto, x, y) {
    var $sprite = $proto.clone();
    x = (x + GAMEBOARD.sizeX) % GAMEBOARD.sizeX;
    y = (y + GAMEBOARD.sizeY) % GAMEBOARD.sizeY;
    $sprite.css({
      'position': 'absolute',
      // 'opacity': '0.5',
      'width': VIEWER.squareSize,
      'height': VIEWER.squareSize,
      'left': VIEWER.viewX(x),
      'bottom': VIEWER.viewY(y)
    });
    VIEWER.$gameboard.append($sprite);
    return $sprite;
  },
  redrawPiece: function (piece) {
    piece.$view.css({
      'left': VIEWER.viewX(piece.x),
      'bottom': VIEWER.viewY(piece.y)
    });
  },
  repairView: function () {
    // buggy - maybe if the animation is not done
    var x, y;
    for (x = 0; x < GAMEBOARD.sizeX; x++) {
      for (y = 0; y < GAMEBOARD.sizeY; y++) {
        if (GAMEBOARD.grid[x][y]) {
          this.redrawPiece(GAMEBOARD.grid[x][y]);
        }
      }
    }
  },
  showPiece: function (piece) {
    piece.$view = VIEWER.showSprite(piece.type.$image, piece.x, piece.y);
  },
  flyInPiece: function (piece) {
    piece.$view = VIEWER.showSprite(piece.type.$image, (GAMEBOARD.viewLeft + GAMEBOARD.viewWidth / 2), GAMEBOARD.viewHigh + 1);
    piece.$view.animate({
      'left': VIEWER.viewX(piece.x),
      'bottom': VIEWER.viewY(piece.y)
    }, this.pieceAnimOpt);
  },
  removePiece: function (piece) {
    piece.$view.remove();
  },
  movePiece: function (piece, oldx, oldy) {
    // TODO: don't animate hidden piece
    // if piece is hidden
    var x, y;
    var $view = piece.$view;
    x = VIEWER.viewX(piece.x);
    y = VIEWER.viewY(piece.y);
    // don't animate jumps
    if (Math.abs(x - parseInt($view.css('left'))) > this.maxJumpToAnimate || Math.abs(y - parseInt($view.css('bottom'))) > this.maxJumpToAnimate) {
      // no animation
      $view.css({
        'left': x,
        'bottom': y
      });
    } else {
      $view.animate({ 'left': x,
        'bottom': y}, this.pieceAnimOpt);
    }
  },
  showPlayer: function () {
    var i;
    var $placeholder;
    VIEWER.showPiece(GAMEBOARD.player);
    var moveList = GAMEBOARD.player.type.moveList;
    for (i = 0; i < moveList.length; i++) {
      $placeholder = VIEWER.showSprite(GAMEBOARD.player.$movePlaceholders, GAMEBOARD.player.x + moveList[i].dx, GAMEBOARD.player.y + moveList[i].dy);
      $placeholder.click(GAMEBOARD.player.type.moveMaker(i));
    }
  },
  playerMoves: function (dx, dy) {
    $('.player').animate({ 'left': '+=' + dx * VIEWER.squareSize,
      'bottom': '+=' + dy * VIEWER.squareSize}, this.playerAnimOpt);
    GAMEBOARD.player.$view.css({
      'left': VIEWER.viewX(GAMEBOARD.player.x),
      'bottom': VIEWER.viewY(GAMEBOARD.player.y)
    });
  },
  playerTakes: function (dx, dy) {
    VIEWER.playerMoves(dx, dy);
    VIEWER.removePiece(GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]);
  },
  afterAnimDone: function (callback) {
    this.$gameboard.children().promise().done(callback);
  },
  adjustBoardAfterPlayerMove: function (dx, dy) {
    this.afterAnimDone(
      function () {
        VIEWER.$gameboard.children().animate({
          'left': '-=' + dx * VIEWER.squareSize,
          'bottom': '-=' + dy * VIEWER.squareSize
        }, this.boardAnimOpt);
        VIEWER.afterAnimDone(function () {
          VIEWER.$backdrops.each(function (i, e) {
            var left, bottom;
            e = $(e);
            left = parseInt(e.css('left'));
            bottom = parseInt(e.css('bottom'));
            if (left < VIEWER.backdrops.leftTrigger) {
              e.css('left', '+=' + VIEWER.backdrops.additiveX);
            } else if (left > VIEWER.backdrops.rightTrigger) {
              e.css('left', '-=' + VIEWER.backdrops.additiveX);
            }
            if (bottom < VIEWER.backdrops.bottomTrigger) {
              e.css('bottom', '+=' + VIEWER.backdrops.additiveY);
            }
          });
        });
      }
    )
    // redraw all out of bound elements (?)
  },
  startGame: function () {
    GAMEBOARD.startGame();
  },
  gameOver: function (piece) {
    // VIEWER.stopAllAnim(); - will inline for now
    VIEWER.$gamewindow.find().stop();
    var x1, x2, y1, y2, y3;
    x1 = VIEWER.viewX(piece.x);
    x2 = VIEWER.viewX(GAMEBOARD.player.x) - VIEWER.squareSize / 2;
    y1 = VIEWER.viewY(piece.y);
    y2 = VIEWER.viewY(GAMEBOARD.player.y);
    y3 = Math.abs(y2 - y1) / 2 + VIEWER.squareSize + Math.max(y1, y2);
    y2 -= VIEWER.squareSize / 2;
    piece.$view.css('z-index', 100);
    piece.$view.animate({'bottom': y3}, VIEWER.endAnimOpt3);
    piece.$view.animate({'bottom': y2}, VIEWER.endAnimOpt3);
    piece.$view.animate({
      'width': '+=' + VIEWER.squareSize,
      'height': '+=' + VIEWER.squareSize
    }, VIEWER.endAnimOpt1);
    piece.$view.animate({'left': x2}, VIEWER.endAnimOpt2);
    // TODO
    VIEWER.afterAnimDone(function () {
      alert('Game Over');
      piece.$view.animate({
        'left': x1 - VIEWER.squareSize / 2,
        'bottom': y1 - VIEWER.squareSize / 2
      }, VIEWER.endAnimOpt2);
    });
  },
  displayPlayerMove: function (bool) {
    if (bool) {
      this.$gamewindow.css('border-color', 'white');
    } else {
      this.$gamewindow.css('border-color', 'black');
    }
  },
  init: function () {
    var i, j, shiftX, $backdropProto;
    // create elements
    VIEWER.$infoTurn = $('#info-turn');
    VIEWER.$infoRow = $('#info-row');
    VIEWER.$infoScore = $('#info-score');
    VIEWER.$gamewindow = $('#gamewindow');

    VIEWER.$gamewindow.css({ // 'width':'100%',
      // 'height': (100*GAMEBOARD.sizeY/GAMEBOARD.sizeX).toString()+'%',
      // 'height': '50%',
      'background-color': 'yellow'
    });

    VIEWER.$gameboard = $('<div id="gameboard"></div>')
      .hide();
    VIEWER.$gamewindow.text('')
      .append(VIEWER.$gameboard);

    // calculate square size and set elements' sizes
    VIEWER.adjustBoardSize();
    // generate and append backdrops
    VIEWER.backdrops.leftTrigger = (-2 * VIEWER.backdrops.x) * VIEWER.squareSize; // to compare with css "left"
    VIEWER.backdrops.rightTrigger = (GAMEBOARD.viewWidth + VIEWER.backdrops.x) * VIEWER.squareSize; // to compare with css "left"
    VIEWER.backdrops.bottomTrigger = -VIEWER.backdrops.y * VIEWER.squareSize; // to compare with css "bottom"
    VIEWER.backdrops.additiveX = VIEWER.backdrops.x * VIEWER.backdrops.i * VIEWER.squareSize; // +/- when moving backdrops
    VIEWER.backdrops.additiveY = VIEWER.backdrops.y * VIEWER.backdrops.j * VIEWER.squareSize; // +/- when moving backdrops
    shiftX = GAMEBOARD.viewLeft - Math.floor((VIEWER.backdrops.i * VIEWER.backdrops.x - GAMEBOARD.viewWidth) / 2);
    $backdropProto = $('<div class="backdrop"></div>').css({
      'width': VIEWER.backdrops.x * VIEWER.squareSize,
      'height': VIEWER.backdrops.y * VIEWER.squareSize,
      'background-size': (VIEWER.squareSize * 2).toString() + 'px ' + (VIEWER.squareSize * 2).toString() + 'px'
    });
    for (i = 0; i < VIEWER.backdrops.i; i++) {
      for (j = 0; j < VIEWER.backdrops.j; j++) {
        VIEWER.$gameboard.append($backdropProto.clone().css({
          'left': (shiftX + i * VIEWER.backdrops.x) * VIEWER.squareSize,
          'bottom': j * VIEWER.backdrops.y * VIEWER.squareSize
        }));
      }
    }
    VIEWER.$backdrops = VIEWER.$gameboard.find('.backdrop');
    // init game
    GAMEBOARD.initGame();
    // show elements
    VIEWER.showPlayer();
    VIEWER.$gameboard.show();
    VIEWER.startGame();
  }
};

$(VIEWER.init);
