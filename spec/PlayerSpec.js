/* eslint-disable */

describe("Test suit", function() {


  it('should assert that 1+1=2', function() {
    expect(1+1).toEqual(2);
  });
});

describe('GAMEBOARD: helper functions', function () {

  beforeEach(function () {
    //VIEWER.showPiece = function(piece) {console.log('showing a piece'+ piece)};
    //GAMEBOARD.createRow = function () {}; // let's have no pieces
    GAMEBOARD.initBoard();
  });

  it('implements addX properly', function () {
    expect(GAMEBOARD.addX(1, 1)).toEqual(2);
    expect(GAMEBOARD.addX(1,-1)).toEqual(0);
    expect(GAMEBOARD.addX(1,GAMEBOARD.sizeX-1)).toEqual(0);
    expect(GAMEBOARD.addX(0,0)).toEqual(0);
    expect(GAMEBOARD.addX(25,0)).toEqual(0);
    expect(GAMEBOARD.addX(0,-24)).toEqual(1);
    expect(GAMEBOARD.addX(0,-25)).toEqual(0);
    var i, j;
    for (i=1; i<GAMEBOARD.sizeX; i++) {
      for (j=1; j<GAMEBOARD.sizeX; j++) {
        expect(GAMEBOARD.addX(GAMEBOARD.addX(j,-i),i)).toEqual(j);
      }
      
    }
  });
  
});

describe('GAMEBOARD: gamePlan', function () {

  beforeEach(function () {
    //VIEWER.showPiece = function(piece) {console.log('showing a piece'+ piece)};
    //GAMEBOARD.createRow = function () {}; // let's have no pieces
    GAMEBOARD.initBoard();
    GAMEBOARD.gamePlan.steps = [
      [10, 0,   0, 0, 0, 0], 
      [40, 0.7, 0, 0, 0, 0], // 50
      [20, 0.7, 5, 0, 0, 0], // 70
      [20, 0.8, 0, 0, 0, 0], // 90
      [10, 0.8, 0, 0, 0, 0], //100
      [20, 0.7, 0, 5, 0, 0], //120
      [10, 0.7, 0, 0, 0, 0], //130
      [20, 0.7, 0, 0, 4, 0], //150
      [10, 0.7, 0, 0, 0, 0], //160
      [20, 0.7, 0, 0, 0, 2], //180
      [10, 0.7, 0, 0, 0, 0], //190
      [200, 0.9, 5, 5, 3, 1] //390
    ];
  });


  it('getPieceExpectancy: works with zero correctly', function () {
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(0)).toEqual(0);
    GAMEBOARD.gamePlan.getPieceExpectancy(1000);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(0)).toEqual(0);
    
  });

  it('getPieceExpectancy: works forward correctly', function () {
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(1)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(10)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(50)).toEqual(0.7);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(70)).toEqual(0.7);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(90)).toEqual(0.8);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(120)).toEqual(0.7);
  });

  it('getPieceExpectancy: works backward correctly', function () {
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(120)).toEqual(0.7);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(90)).toEqual(0.8);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(70)).toEqual(0.7);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(50)).toEqual(0.7);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(10)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(1)).toEqual(0);
    
  });
  
  it('getPieceExpectancy: interpolates correctly', function () {
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(1)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(2)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(5)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(9)).toEqual(0);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(70)).toEqual(0.7);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(80)).toEqual(0.75);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(90)).toEqual(0.8);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(110)).toEqual(0.75);
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(120)).toEqual(0.7);
  });

  it('getPieceExpectancy: manages infinity correctly', function () {
    expect(GAMEBOARD.gamePlan.getPieceExpectancy(1120)).toEqual(0.9);
  });

  it('getTypeFreq: also works correctly', function () {
    expect(GAMEBOARD.gamePlan.getTypeFreq(50,'bishop')).toEqual(0);
    expect(GAMEBOARD.gamePlan.getTypeFreq(70,'bishop')).toEqual(5);
    expect(GAMEBOARD.gamePlan.getTypeFreq(54,'bishop')).toEqual(1);
    expect(GAMEBOARD.gamePlan.getTypeFreq(130,'bishop')).toEqual(0);
    expect(GAMEBOARD.gamePlan.getTypeFreq(1170,'bishop')).toEqual(5);
    expect(GAMEBOARD.gamePlan.getTypeFreq(1170,'knight')).toEqual(5);
    expect(GAMEBOARD.gamePlan.getTypeFreq(1170,'rook')).toEqual(3);
    expect(GAMEBOARD.gamePlan.getTypeFreq(1170,'queen')).toEqual(1);
  });


});

describe("GAMEBOARD.createPiece", function() {

  beforeEach(function() {
    VIEWER.showPiece = function() { 
      // console.log('showing a piece in GAMEBOARD.createPiece');
    };
    VIEWER.displayPlayerMove = function () {

    };
  });

  it('adds created pieces to grid and pieces list', function() {
    GAMEBOARD.initGame();
    var nP_inG=0, nP_inL=0;
    var pp,x,y;
    // check if pieces in list are also in grid
    pp=GAMEBOARD.pieces.head;
    while (pp) {
      nP_inL++;
      expect(GAMEBOARD.grid[pp.x][pp.y]).toEqual(pp);
      console.log("pp loop"+nP_inL);
      pp=pp.next;
    }
    // check if number of pieces in grid equal to number of pieces in list
    for (x=0;x<GAMEBOARD.sizeX;x++) {
      for (y=0;y<GAMEBOARD.sizeY;y++) {
        if (GAMEBOARD.grid[x][y]) {
          nP_inG++;
        }
      }
    }
    expect(nP_inG).toEqual(nP_inL+1);
  });

});

describe('GAMEBOARD: player movement', function () {

  beforeEach(function () {
    VIEWER.showPiece = function(piece) {console.log('showing a piece'+ piece)};
    GAMEBOARD.createRow = function () {}; // let's have no pieces
    GAMEBOARD.initGame();
  });

  it('properly updates view variables', function () {
    expect(0).toEqual(0);
  })
});


