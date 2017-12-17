

describe("Test suit", function() {


  it('should assert that 1+1=2', function() {
    expect(1+1).toEqual(2);
  });
});

describe("GAMEBOARD.createPiece", function() {

  beforeEach(function() {
    VIEWER.showPiece = function() {console.log('showning a piece')};
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


// describe("Player", function() {
//   var player;
//   var song;

//   beforeEach(function() {
//     player = new Player();
//     song = new Song();
//   });

//   it("should be able to play a Song", function() {
//     player.play(song);
//     expect(player.currentlyPlayingSong).toEqual(song);

//     //demonstrates use of custom matcher
//     expect(player).toBePlaying(song);
//   });

//   describe("when song has been paused", function() {
//     beforeEach(function() {
//       player.play(song);
//       player.pause();
//     });

//     it("should indicate that the song is currently paused", function() {
//       expect(player.isPlaying).toBeFalsy();

//       // demonstrates use of 'not' with a custom matcher
//       expect(player).not.toBePlaying(song);
//     });

//     it("should be possible to resume", function() {
//       player.resume();
//       expect(player.isPlaying).toBeTruthy();
//       expect(player.currentlyPlayingSong).toEqual(song);
//     });
//   });

//   // demonstrates use of spies to intercept and test method calls
//   it("tells the current song if the user has made it a favorite", function() {
//     spyOn(song, 'persistFavoriteStatus');

//     player.play(song);
//     player.makeFavorite();

//     expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
//   });

//   //demonstrates use of expected exceptions
//   describe("#resume", function() {
//     it("should throw an exception if song is already playing", function() {
//       player.play(song);

//       expect(function() {
//         player.resume();
//       }).toThrowError("song is already playing");
//     });
//   });
// });
