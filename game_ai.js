/* global GAMEBOARD */
var AI = {
  worseThanWorstPossibleScore: -10000,
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
  schedulePlayerMove: function () {
    // choose a move
    var i, bestMove, curMove;
    var savedPlayerPosition = {
      x: GAMEBOARD.player.x,
      y: GAMEBOARD.player.y
    }
    var bestScoreSoFar = AI.worseThanWorstPossibleScore;
    for (i = 0; i < AI.moveList.length; i++) {

    }
    // enqueue the move
    GAMEBOARD.player.nextMove.dx = dx;
    GAMEBOARD.player.nextMove.dy = dy;
    GAMEBOARD.player.nextMove.wantMove = true;
    GAMEBOARD.player.enqueuePlayerMove();
  },
  init: function () {
    console.log('AI initialized');
  }
};

// patch game engine;
AI.gbAllowPlayerToMove = GAMEBOARD.allowPlayerToMove;
GAMEBOARD.allowPlayerToMove = function (allow) {
  AI.gbAllowPlayerToMove(allow);
  if (allow) {
    AI.schedulePlayerMove();
  }
}
$(AI.init);
