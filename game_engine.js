var GAMEBOARD = {
    sizeX: 24,
    sizeY: 10,
    turnDelay:3000,
    pieces: {
        head: null,
        tail: null,
    },
    addjustMod: function(val,mod) {
        return (val+mod)%mod;
    },
    addX: function(x,dx){
        return this.addjustMod(x+dx,this.sizeX);
    },
    addY: function(y,dy){
        return this.addjustMod(y+dy,this.sizeY);
    },
    initGame: function() {
        var i;
        var newPiece;
        GAMEBOARD.initBoard();
        
        GAMEBOARD.maxRow=0;
        GAMEBOARD.turn=0;

        // add pieces
        for (i=0;i<GAMEBOARD.sizeY;i++) {
            //console.log(" ---- row="+i);
            while(GAMEBOARD.createPiece(i)){
                // so far createPiece does all the work
                //console.log("piece created");
            };
            GAMEBOARD.maxRow++;
        }
    },
    startGame: function() {
        console.log('game started');
        this.playerInterval=setInterval(function(){GAMEBOARD.player.makeMove()}, GAMEBOARD.turnDelay);
        setTimeout(function(){
            GAMEBOARD.pieceInterval=setInterval(function(){GAMEBOARD.movePieces()},GAMEBOARD.turnDelay);
        },GAMEBOARD.turnDelay/2);
    },
    gameOver: function() {
        //delete intervals
        clearInterval(this.playerInterval);
        clearInterval(this.pieceInterval);
    },
    movePieces: function() {
        try {
            GAMEBOARD.turn++;
            console.log('pieces move');
            var nextPiece=GAMEBOARD.pieces.head;
            while(nextPiece) {
                nextPiece.move();
                //console.log('here');
                nextPiece=nextPiece.next;
            }
        } catch (e) {
            if (e==='Game Over') {
                GAMEBOARD.gameOver();
                VIEWER.gameOver();
            }
        }
    },
    piecePrototype: {
        move: function() {
            if (this.type.canTakePlayer(this)) {
                //TODO: gameover
                this.type.animatePlayerDeath(this);
                throw "Game Over";
            }
            var oldx,oldy;
            oldx=this.x;
            oldy=this.y;
            if (this.type.move_if_possible(this)) {
                GAMEBOARD.grid[oldx][oldy]=null;
                GAMEBOARD.grid[this.x][this.y]=this;
                VIEWER.movePiece(this,oldx,oldy);
            }
        }
    },
    pieceExpectancy: function() {
        return 0.8;
    },
    decidePieceType: function(piece) {
        var rnd = Math.random();
        piece.type=GAMEBOARD.pawn;
    },
    pawn: {
        move_if_possible: function(piece) {
            if ((GAMEBOARD.turn+piece.y)%2===0) {
                return false;
            }
            var newx=(piece.x+GAMEBOARD.sizeX-1)%GAMEBOARD.sizeX;
            if (GAMEBOARD.grid[newx][piece.y]!==null) {
                return false;
            } else {
                piece.x=newx;
            }
            return true;
       },
       canTakePlayer(piece) {
            if ((GAMEBOARD.turn+piece.y)%2) {
                return false;
            }
            if (GAMEBOARD.addX(piece.x,-GAMEBOARD.player.x)===1) {
                if (GAMEBOARD.addY(piece.y,-GAMEBOARD.player.y)===1 ) {
                    return true;
                }
                //TODO: eat up
                if (GAMEBOARD.addY(-piece.y,GAMEBOARD.player.y)===1 ) {
                    return true;
                }
            }
            return false;
       },
       animatePlayerDeath: function(piece) {
            // TODO
       },
       $image: $("<img src='images/wpawn.png'>"),
       name: 'pawn'
    },
    playerTakes: function(dx,dy) {
        var piece=GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y];
        // first call viewer while we have reference to a piece
        VIEWER.playerTakes(dx,dy);
        // then remove the piece
        GAMEBOARD.removePiece(piece);
        GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]=GAMEBOARD.player;
    },
    playerMoves: function(dx,dy) {
        VIEWER.playerMoves(dx,dy);
        GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]=GAMEBOARD.player;
    },
    player: {
        $movePlaceholders: $('<div></div>')
                .addClass('player movePlaceholder'),
        nextMove: {
            set: false,
            dx: 0,
            dy: 0
        },
        makeMove: function() {
            console.log('player moves');
            var nextMove=GAMEBOARD.player.nextMove;
            var dx, dy;
            if(nextMove.set) {
                nextMove.set=false;
                dx=GAMEBOARD.player.nextMove.dx;
                dy=GAMEBOARD.player.nextMove.dy;
                // remove player from grid
                GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]=null;
                // calculate new coordinates
                GAMEBOARD.player.x=GAMEBOARD.addX(GAMEBOARD.player.x,dx);
                GAMEBOARD.player.y=GAMEBOARD.addY(GAMEBOARD.player.y,dy);
                // check if player takes a piece
                if(GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]!==null) {
                    console.log("player takes "+GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y].type.name);
                    GAMEBOARD.playerTakes(dx,dy);
                    
                } else {
                    // player does not take but just moves
                    GAMEBOARD.playerMoves(dx,dy);
                }
            }
        },
        
        type : {
            $image: $("<img src='images/bknight.png'>")
                .addClass('player'),
            moveList: [
                {   dx: 2,
                    dy: 1
                },
                {   dx: 1,
                    dy: 2
                },
                {   dx: -1,
                    dy: 2
                },
                {   dx: -2,
                    dy: 1
                },
                {   dx: -2,
                    dy: -1
                },
                {   dx: -1,
                    dy: -2
                },
                {   dx: 1,
                    dy: -2
                },
                {   dx: 2,
                    dy: -1
                }
            ],
            moveMaker: function(i) {
                var dx=this.moveList[i].dx;
                var dy=this.moveList[i].dy;
                
                return function() {
                    GAMEBOARD.player.nextMove.dx=dx;
                    GAMEBOARD.player.nextMove.dy=dy;
                    GAMEBOARD.player.nextMove.set=true;
                    console.log('player will move to '+dx+','+dy);
                }
            },
            name: 'knight'
        }
    },
    createPiece: function(forRow){
        var x;
        var newPiece;
        // randomly generate a piece until we give up or get one that can be on the board
        do {
            if(Math.random()>GAMEBOARD.pieceExpectancy()) {
                return false;
            }
            x=Math.floor(Math.random()*GAMEBOARD.sizeX);
            //console.log("x="+x);
        } while(GAMEBOARD.grid[x][forRow]!==null);
        newPiece=Object.create(GAMEBOARD.piecePrototype);
        newPiece.x=x;
        newPiece.y=forRow;
        GAMEBOARD.decidePieceType(newPiece);
        // add the piece to the list
        newPiece.prev=GAMEBOARD.pieces.tail;
        newPiece.next=null;
        if (GAMEBOARD.pieces.tail) {
            GAMEBOARD.pieces.tail.next=newPiece;
            GAMEBOARD.pieces.tail=newPiece;
        } else {
            GAMEBOARD.pieces.head=newPiece;
            GAMEBOARD.pieces.tail=newPiece;
        }
        // add the piece to the board grid
        GAMEBOARD.grid[x][forRow]=newPiece;
        // add the piece to the view
        VIEWER.showPiece(newPiece);
        return true;
    },
    removePiece: function(piece) {
        console.log('removing piece');
        //TODO: if piece is destroyed it should be removed from view
        //      now it is removed only when it is taken
        // remove piece from list
        if (piece.next) {
            piece.next.prev=piece.prev;
        } else {
            pieces.tail=piece.prev;
        }
        if (piece.prev) {
            piece.prev.next=piece.next;
        } else {
            piece.head=piece.next;
        }
        //remove piece from grid
        GAMEBOARD.grid[piece.x][piece.y]=null;
        //TODO: recreate piece
    },
    
    initBoard: function() {
        var x,y;
        var g = [];
        for (x=0;x<GAMEBOARD.sizeX;x++) {
            g.push([]);
            for(y=0;y<GAMEBOARD.sizeY;y++) {
                g[x].push(null);
            }
        }
        GAMEBOARD.grid=g;
        GAMEBOARD.player.x= 12;
        GAMEBOARD.player.y= 2;           
        // also add player to the grid
        GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]=GAMEBOARD.player;
        pieces = {
            head: null,
            tail: null,
        };
        GAMEBOARD.viewLow=0;
        GAMEBOARD.viewHigh=8;
        GAMEBOARD.viewLeft=5;
        GAMEBOARD.viewRight=19;
    }
};

var VIEWER = {
    adjustBoardSize: function() {
        // calculate size of square
        var availableX, availableY;
        availableX=parseFloat(VIEWER.$gamewindow.width());
        availableY=parseFloat($(window).height());
        VIEWER.squareSize=Math.floor(Math.min(availableX/GAMEBOARD.sizeX,availableY/GAMEBOARD.sizeY)/2);
        // set sizes of board
        VIEWER.$gamewindow.css({ 'width': GAMEBOARD.sizeX*VIEWER.squareSize,
                                 'height': GAMEBOARD.sizeY*VIEWER.squareSize
                               });
        VIEWER.$gameboard.css({ 'width': GAMEBOARD.sizeX*VIEWER.squareSize,
                                'height': GAMEBOARD.sizeY*VIEWER.squareSize,
                                'background-size': (VIEWER.squareSize*2).toString()+'px '+(VIEWER.squareSize*2).toString()+'px'
                              });
        // set pieces
    },
    showSprite: function($proto, x, y) {
        var $sprite=$proto.clone();
        x=(x+GAMEBOARD.sizeX)%GAMEBOARD.sizeX;
        y=(y+GAMEBOARD.sizeY)%GAMEBOARD.sizeY;
        $sprite.css({
            'position': 'absolute',
            //'opacity': '0.5',
            'width': VIEWER.squareSize,
            'height': VIEWER.squareSize,
            'left': x*VIEWER.squareSize,
            'bottom': y*VIEWER.squareSize
        });
        VIEWER.$gameboard.append($sprite);
        return $sprite;
    },
    showPiece: function(piece) {
        piece.$view=VIEWER.showSprite(piece.type.$image,piece.x,piece.y);
        
    },
    removePiece: function(piece) {
        piece.$view.remove();
    },
    movePiece: function(piece,oldx,oldy) {
        piece.$view.css({ 'left' : piece.x*VIEWER.squareSize,
                          'bottom': piece.y*VIEWER.squareSize});
    },
    showPlayer: function() {
        var i;
        var $placeholder;
        VIEWER.showPiece(GAMEBOARD.player);
        var moveList=GAMEBOARD.player.type.moveList;
        for(i=0;i<moveList.length; i++) {
            $placeholder=VIEWER.showSprite(GAMEBOARD.player.$movePlaceholders,GAMEBOARD.player.x+moveList[i].dx,GAMEBOARD.player.y+moveList[i].dy);
            $placeholder.click(GAMEBOARD.player.type.moveMaker(i));
        }

    },
    playerMoves: function(dx, dy) {
        $('.player').css({ 'left' : '+='+dx*VIEWER.squareSize,
                           'bottom': '+='+dy*VIEWER.squareSize});
        
    },
    playerTakes: function(dx,dy) {
        console.log('viewer playerTakes: '+dx+","+dy);
        VIEWER.playerMoves(dx,dy);
        VIEWER.removePiece(GAMEBOARD.grid[GAMEBOARD.player.x][GAMEBOARD.player.y]);
    },
    
    startGame: function() {
        GAMEBOARD.startGame();
    },
    gameOver: function() {
        //TODO
        alert("Game Over");
    },
    init: function() {
        // create elements
        VIEWER.$gamewindow=$('#gamewindow');
        
        VIEWER.$gamewindow.css({ //'width':'100%',
                                 //'height': (100*GAMEBOARD.sizeY/GAMEBOARD.sizeX).toString()+'%',
                                 //'height': '50%',
                                 'background-color':'yellow' 
                               });
        

        VIEWER.$gameboard=$('<div id="gameboard"></div>')
            .hide();
        VIEWER.$gamewindow.text('')
            .append(VIEWER.$gameboard);

        // calculate square size and set elements' sizes
        VIEWER.adjustBoardSize();
        // init game
        GAMEBOARD.initGame();
        // show elements
        VIEWER.showPlayer();
        VIEWER.$gameboard.show();                     
        VIEWER.startGame();
    }
};

$(VIEWER.init);