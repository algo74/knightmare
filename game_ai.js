/* global GAMEBOARD VIEWER */
var AI = {
  worseThanWorstPossibleScore: -100000,
  costOfBeingTaken: -50000,
  moveList: [
    { dx: -1,
      dy: 2
    },
    { dx: 1,
      dy: 2
    },
    { dx: 2,
      dy: 1
    },
    { dx: -2,
      dy: 1
    },
    { dx: 0,
      dy: 0
    },
    { dx: 2,
      dy: -1
    },
    { dx: -2,
      dy: -1
    },
    { dx: -1,
      dy: -2
    },
    { dx: 1,
      dy: -2
    }
  ],
  playerWillBeTaken: function () {
    try {
      // check if any piece can take player
      var nextPiece = GAMEBOARD.pieces.head;
      while (nextPiece) {
        nextPiece.takePlayerIfPossible_generic();
        nextPiece = nextPiece.next;
      }
      return false;
    } catch (e) {
      if (e.message === 'Game Over') {
        return true;
      }
    }
  },
  schedulePlayerMove: function () {
    // console.log('  inside AI scheduler');
    var i, bestMove, curMove, curScore, savedPiece;
    // save things that will be changed
    var savedPosition = {
      playerX: GAMEBOARD.player.x,
      playerY: GAMEBOARD.player.y,
      viewLow: GAMEBOARD.viewLow,
      viewHigh: GAMEBOARD.viewHigh,
      viewLeft: GAMEBOARD.viewLeft,
      viewRight: GAMEBOARD.viewRight,
      lastBoardShiftX: GAMEBOARD.lastBoardShift.dx,
      lastBoardShiftY: GAMEBOARD.lastBoardShift.dy
    };
    GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = null;
    // choose a move
    var bestScoreSoFar = AI.worseThanWorstPossibleScore;
    for (i = 0; i < AI.moveList.length; i++) {
      curMove = AI.moveList[i];
      // make move
      if (GAMEBOARD.playerMoveAllowed(curMove.dx, curMove.dy)) {
        GAMEBOARD.player.x = GAMEBOARD.addX(GAMEBOARD.player.x, curMove.dx);
        GAMEBOARD.player.y = GAMEBOARD.addY(GAMEBOARD.player.y, curMove.dy);
        savedPiece = GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y];
        GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = null;
        // calculate score
        if (savedPiece) {
          curScore = GAMEBOARD.scoreChart.perPiece[savedPiece.type.name];
        } else {
          curScore = 0;
        }
        curScore += 50 * curMove.dy;
        if (AI.playerWillBeTaken()) {
          curScore += AI.costOfBeingTaken;
        }
        // check score
        if (curScore > bestScoreSoFar) {
          bestScoreSoFar = curScore;
          bestMove = curMove;
        }
        // restore board
        GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = savedPiece;
        GAMEBOARD.player.x = savedPosition.playerX;
        GAMEBOARD.player.y = savedPosition.playerY;
        GAMEBOARD.viewLow = savedPosition.viewLow;
        GAMEBOARD.viewHigh = savedPosition.viewHigh;
        GAMEBOARD.viewLeft = savedPosition.viewLeft;
        GAMEBOARD.viewRight = savedPosition.viewRight;
        GAMEBOARD.lastBoardShift.dx = savedPosition.lastBoardShiftX;
        GAMEBOARD.lastBoardShift.dy = savedPosition.lastBoardShiftY;
      }
    }
    // put the player back
    GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y] = GAMEBOARD.player;
    // enqueue the move
    if (bestMove.dx !== 0) {
      GAMEBOARD.player.nextMove.dx = bestMove.dx;
      GAMEBOARD.player.nextMove.dy = bestMove.dy;
      GAMEBOARD.player.nextMove.wantMove = true;
      // console.log('  enqueueing the move ' + bestMove.dx + ',' + bestMove.dy);
      GAMEBOARD.player.enqueuePlayerMove();
    }
  },
  init: function () {
    AI.gbAllowPlayerToMove = GAMEBOARD.allowPlayerToMove;
    GAMEBOARD.allowPlayerToMove = function (allow) {
      AI.gbAllowPlayerToMove(allow);
      if (allow) {
        // console.log('trying to move player');
        setTimeout(AI.schedulePlayerMove, GAMEBOARD.turnDelay / 3);
      }
    }
    console.log('AI initialized');
  }
};

// patch game engine;

$(AI.init);
