document.addEventListener('DOMContentLoaded', function(){
  game = new Game(); 
  view = new View({boardElement: document.getElementById('board'), scoreElement: document.getElementById('score'), newGameButton: document.getElementById('new-game-button')});
  controller = new Controller(game, view);
  view.controller = controller;
  controller.start();
});

//test boards:
// no moves:
// [[2,4,8,16],[16,8,4,2],[2,4,8,16],[16,8,4,2]]
//
// one move:
// [[2,4,8,16],[32,64,128,256],[512,1024,512,2],[2,4,8,0]]
//
// 2048 on next move:
// [[2,4,8,16],[32,64,128,256],[1024,1024,512,2],[2,4,8,0]]
//
// all of the numbers
// [[2,4,8,16],[32,64,128,256],[1024,2048,4096,8192],[0,0,0,0]]

function Controller(game, view) {
   this.game = game;
   this.view = view;
}

Controller.prototype.moveTiles = function(direction) {
  if (!this.game.over) {
    this.game.moveTiles(direction);
    this.view.drawBoard(this.game);
  }
  if (this.game.got2048()) {
    this.view.alertGameWon();
  }
  if (this.game.isOver()) {
    this.view.alertGameOver();
  }
  if (!this.game.over) {
    setTimeout(function() { 
      this.game.spawn(); 
      this.view.drawBoard(this.game);
      this.controller.saveGame();
    }, 100);
  }
};

Controller.prototype.start = function() {
  this.view.drawBoard(this.game);
};

Controller.prototype.newGame = function() {
  if(typeof(Storage) !== "undefined") {
    localStorage.removeItem("board");
    localStorage.removeItem("score");
    localStorage.removeItem("won");
  } else {
    // no local storage support
  }
  location.reload();
};

Controller.prototype.saveGame = function() {
  if(typeof(Storage) !== "undefined") {
    localStorage.board = JSON.stringify(this.game.board);
    localStorage.score = JSON.stringify(this.game.score);
    localStorage.won = JSON.stringify(this.game.won);
  } else {
  // no local storage support
  }
};

function Game(board) {
  if (board) {
    this.board = board;
  } else { 
    this.board = this.generateStartingBoard();
  }
  this.score = this.generateStartingScore();
  this.previousBoard = [];
  this.won = this.generateWonStatus();
  this.over = false;
}

Game.prototype.generateStartingScore = function() {
  if (this.savedScore()) {
    return this.savedScore();
  } else {
    return 0;
  }
};

Game.prototype.savedScore = function() {
  if (localStorage.score) {
    return parseInt(localStorage.score);
  } else {
    return undefined;
  }
};

Game.prototype.savedBoard = function() {
  if (localStorage.board) {
    return JSON.parse(localStorage.board);
  } else {
    return undefined;
  }
};

Game.prototype.generateWonStatus = function() {
  if (this.savedWonStatus()) {
    return this.savedWonStatus();
  } else {
    return false;
  }
};

Game.prototype.savedWonStatus = function() {
  if (localStorage.won) {
    return JSON.parse(localStorage.won);
  } else {
    return undefined;
  }
};

Game.prototype.generateStartingBoard = function(){
  var generatedBoard, boardCoordinates, spawnValues = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4];

  if (this.savedBoard()) {
    return this.savedBoard();
  }
  
  generatedBoard = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  boardCoordinates = [];
  
  for (var k = 0; k < generatedBoard.length; k++) {
    for (var m = 0; m < generatedBoard[k].length; m++) {
      boardCoordinates.push([k,m]);
    }
  }
  shuffle(boardCoordinates);
  shuffle(spawnValues);

  generatedBoard[boardCoordinates[0][0]][boardCoordinates[0][1]] = spawnValues[0];
  generatedBoard[boardCoordinates[1][0]][boardCoordinates[1][1]] = spawnValues[1];

  return generatedBoard;
};

Game.prototype.moveTiles = function(direction){
  this.savePreviousBoard();

  if (direction === "left"){
    this.mergeTilesLeft();
  }
  if (direction === "right"){
    this.reverseBoard();
    this.mergeTilesLeft();
    this.reverseBoard();
  }  
  if (direction === "up"){
    this.transposeBoard();
    this.mergeTilesLeft();
    this.transposeBoard();
  }  
  if (direction === "down"){
    this.transposeBoard();
    this.reverseBoard();
    this.mergeTilesLeft();
    this.reverseBoard();
    this.transposeBoard();
  }  
};

Game.prototype.savePreviousBoard = function() {
  this.previousBoard = JSON.parse(JSON.stringify(this.board));
};

Game.prototype.mergeTilesLeft = function(){
  var newRow, board = this.board;
  this.removeBoardPadding();
  for(var i = 0; i < board.length; i++) {
    newRow = [];
    if (board[i].length > 1){
      if (board[i].length === 2){
        if (board[i][0] === board[i][1]){
          newRow.push(board[i][0] * 2);
          this.score += board[i][0] * 2;
        } else {
          newRow = board[i];
        }
      } else if (board[i].length === 3) {
        if (board[i][0] === board[i][1]){
          newRow.push(board[i][0] * 2, board[i][2]);
          this.score += board[i][0] * 2;
        } else if (board[i][1] === board[i][2]){
          newRow.push(board[i][0], board[i][1] * 2);
          this.score += board[i][1] * 2;
        } else {
          newRow = board[i];
        }
      } else if (board[i].length === 4){
        if (board[i][0] === board[i][1]){
          newRow.push(board[i][0] * 2);
          this.score += board[i][0] * 2;
          if (board[i][2] === board[i][3]){
            newRow.push(board[i][2] * 2);
            this.score += board[i][2] * 2;
          } else {
            newRow.push(board[i][2], board[i][3]);
          }
        } else if (board[i][1] === board[i][2]){
          newRow.push(board[i][0], board[i][1] * 2, board[i][3]);
          this.score += board[i][1] * 2;
        } else if (board[i][2] === board[i][3]){
          newRow.push(board[i][0], board[i][1], board[i][2] * 2);
          this.score += board[i][2] * 2;
        } else {
          newRow = board[i];
        }
      }
      this.board[i] = newRow;
    }
  } 
  this.padBoard();
};

Game.prototype.reverseBoard = function(){
  for(var i = 0; i < this.board.length; i++) {
    this.board[i].reverse();
  }
};

Game.prototype.transposeBoard = function() {
  var board = this.board;
  var transposedArray = board[0].map(function(col, i) {
    return board.map(function(row) { 
      return row[i];
    });
  });
  this.board = transposedArray; 
};
    
Game.prototype.removeBoardPadding = function(){
  for(var i = 0; i < this.board.length; i++) {
    for(var j = this.board[i].length - 1; j >= 0; j--) {
      if(this.board[i][j] === 0) {
         this.board[i].splice(j, 1);
      }
    }
  }
};

Game.prototype.padBoard = function(){
  for(var i = 0; i < this.board.length; i++) {
    while (this.board[i].length < 4){
      this.board[i].push(0); 
    }
  }
};

Game.prototype.spawn = function(){
  var emptyTileCoordinates = [];
  if (this.board.equals(this.previousBoard)){
    return;
  }
  if (this.isBoardFull()) {
    return;
  }
  for(var i = 0; i < this.board.length; i++) {
    for(var j = 0; j < this.board[i].length; j++) {
      if (this.board[i][j] === 0){
        emptyTileCoordinates.push([i, j]);
      }
    }
  }
  shuffle(emptyTileCoordinates);
  this.board[emptyTileCoordinates[0][0]][emptyTileCoordinates[0][1]] = shuffle([2,2,2,2,2,2,2,2,2,4])[0];
};

Game.prototype.isBoardFull = function() {
  for (var i = 0; i < this.board.length; i++) {
    if (this.board[i].includes(0)){
      return false;
    }
  }
  return true;
};

Game.prototype.got2048 = function() {
  if (!this.won) {
    for(var i = 0; i < this.board.length; i++) {
      if (this.board[i].includes(2048)) {
        this.won = true;
        return true;
      }
    }
  }
  return false;
};

Game.prototype.isOver = function(){
  if (this.isBoardFull() && !this.over){
    for(var i = 0; i < this.board.length-1; i++) {
      for(var j = 0; j < this.board[i].length; j++){
        if (this.board[i][j] === this.board[i+1][j]){
          return false;
        }  
      }
    }
    for(var m = 0; m < this.board.length; m++) {
      for(var n = 0; n < this.board[m].length-1; n++){
        if (this.board[m][n] === this.board[m][n+1]){
          return false;
        }  
      }
    }
    this.over = true;
    return true;
  } else {
    return false;
  }
};

Array.prototype.equals = function (array) {
  if (!array) {
    return false;
  }
  if (this.length != array.length) {
    return false;
  }

  for (var i = 0, l=this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i])) {
        return false;       
      }
    } else if (this[i] != array[i]) { 
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;   
    }           
  }       
  return true;
};

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function View(args) {
  args = args || {};
  this.boardElement = args.boardElement;
  this.scoreElement = args.scoreElement;
  this.newGameButton = args.newGameButton;
  this.setupHandlers();
}

View.prototype.drawBoard = function(game){
  var board = game.board;
  var score = game.score;
  var boardHTML = "";
  var scoreHTML = score.toString();
  for(var i = 0; i < board.length; i++) {
    boardHTML += '<tr>';
      for(var j = 0; j < board[i].length; j++) {
        boardHTML += '<td id="val';
        boardHTML += board[i][j].toString(); 
        boardHTML +=  '">';
        if (board[i][j] !== 0){
          boardHTML += board[i][j].toString();
        }
        boardHTML += '</td>';
      }
    boardHTML += '</tr>';
  }
  this.boardElement.innerHTML = boardHTML;
  this.scoreElement.innerHTML = scoreHTML;
};

View.prototype.setupHandlers = function() {  
  document.addEventListener('keyup', function(event){
    switch (event.which) {
      case 37:
        this.controller.moveTiles('left');
        break;
      case 38:
        this.controller.moveTiles('up');
        break;
      case 39:
        this.controller.moveTiles('right');
        break;
      case 40:
        this.controller.moveTiles('down');
        break;
    }
  }.bind(this));

  this.newGameButton.addEventListener('click', function(event){
    this.controller.newGame();
  }.bind(this));
};

View.prototype.alertGameOver = function() {
  return alert("Game over! No more moves are possible. Try again? Click the New Game button!");
};

View.prototype.alertGameWon = function() {
  return alert("YOU GOT 2048! YOU WON!");
};

