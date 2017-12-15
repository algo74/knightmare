var GAMEBOARD = {
    sizeX: 24,
    sizeY: 10,
    initGame: function() {

    },

    init: function() {
        var x,y;
        var g = [];
        for (x=0;x<GAMEBOARD.sizeX;x++) {
            g.push([]);
            for(y=0;y<GAMEBOARD.sizeY;y++) {
                g[x].push(null);
            }
        }
        GAMEBOARD.grid=g;
        GAMEBOARD.playerX=12;
        GAMEBOARD.playerY=2;
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
        VIEWER.squareSize=Math.min(availableX/GAMEBOARD.sizeX,availableY/GAMEBOARD.sizeY);
        // set sizes
        VIEWER.$gamewindow.css({ 'width': GAMEBOARD.sizeX*VIEWER.squareSize,
                                 'height': GAMEBOARD.sizeY*VIEWER.squareSize
                               });
        VIEWER.$gameboard.css({ 'width': GAMEBOARD.sizeX*VIEWER.squareSize,
                                'height': GAMEBOARD.sizeY*VIEWER.squareSize,
                                'background-size': (VIEWER.squareSize*2).toString()+'px '+(VIEWER.squareSize*2).toString()+'px'
                              });
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

        // init game
        GAMEBOARD.initGame();
        // calculate square size and set elements' sizes
        VIEWER.adjustBoardSize();
        // show elements
        VIEWER.$gameboard.show();                     
        
    }
};

$(VIEWER.init);