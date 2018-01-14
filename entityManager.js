/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


"use strict";


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/

var entityManager = {

// "PRIVATE" DATA

_aliens   : [],
_bullets : [],
_ships   : [],
_enemyShips : [],
_alienbullets : [],
_walls   : [],
_Lives   : [],


_bShowAliens : true,
// Keeps track of whether aliens should turn around or not.
_turnAliensNext : false,
// When to increase alien's speed (when their numbers dwindle).
_accelWhen : 12,
_accelHowOften : 5,
_lastAccel : 5,
// "PRIVATE" METHODS

_generateAliens : function() {
    var i,
        NUM_ROWS = 5,
		NUM_COLUMNS = 12,
		initialCX = 80,
		initialCY = 100,
		xInterval = 40,
		yInterval = 40;

	// The last row of each type of alien
	var alien3Boundary = 1 + g_level;
	var alien2Boundary = 3;

	// Adjustments based on level
	if(g_level > 1) {
		alien3Boundary -= 1;
		alien2Boundary += 1;
	}
	if(g_level > 3) {
		alien3Boundary -= 1;
		alien2Boundary += 1;
	}
	
	// Where the aliens are initialized based on the above parameters
	for (i = 0; i < NUM_ROWS; ++i) {
		for (var j = 0; j < NUM_COLUMNS; j++) {
			var nextCX = initialCX + (xInterval * j);
			var nextCY = initialCY + (yInterval * i);
			if(i < alien3Boundary) this.generateAlien({
								cx : nextCX,
								cy : nextCY,
								sprite : g_sprites.alien3});
			else if(i >= alien3Boundary && i < alien2Boundary)
							    this.generateAlien({
								cx : nextCX,
								cy : nextCY,
								sprite : g_sprites.alien2});
			else this.generateAlien({
					cx : nextCX,
					cy : nextCY});
		}
    }
},
_generateWalls : function() {
  var i,
      NUM_ROWS = 3,
  NUM_COLUMNS = 3,
  initialCX = 57,
  initialCY = 400,
  xInterval = 30,
  yInterval = 20;

  for (i = 0; i < NUM_ROWS; ++i) {
  for (var j = 0; j < NUM_COLUMNS; j++) {
    var nextCX = initialCX + (xInterval * j);
    var nextCY = initialCY + (yInterval * i);
    this.generateWalls({
    cx : nextCX,
    cy : nextCY});

    this.generateWalls({
    cx : nextCX+200,
    cy : nextCY});

    this.generateWalls({
    cx : nextCX+400,
    cy : nextCY});
  }
}
},


_generateEnemyShip : function() {
    var enemyShips = [g_sprites.enemyship, g_sprites.enemyship3, g_sprites.enemyship2];
    entityManager.generateEnemyShip({
        cx : 1200,
        cy : 50,

        sprite: enemyShips[g_enemyShip_no]
    });
},

_generateLives : function() {
  var i,
  NUM_LIVES = 3,
  initialCX = 20,
  xInterval = 40;
  for (i=0; i<NUM_LIVES; ++i){
    var nextCX = initialCX + (xInterval*i);
    this.generateLives({
      cx : nextCX,
      cy : g_canvas.height-20
    });
  }
},

_forEachOf: function(aCategory, fn) {
    for (var i = 0; i < aCategory.length; ++i) {
        fn.call(aCategory[i]);
    }
},

// Tell all the aliens it's time to turn around
_turnAliensAround: function() {
	this._forEachOf(this._aliens, Alien.prototype.turnAround);
	this._turnAliensNext = false;
},

// PUBLIC METHODS

// A special return value, used by other objects,
// to request the blessed release of death!
//
KILL_ME_NOW : -1,

// When aliens pass these X coordinates they need to
// turn around.
ALIEN_TURN_MAX : 580,
ALIEN_TURN_MIN : 20,

// Some things must be deferred until after initial construction
// i.e. thing which need `this` to be defined.
//
deferredSetup : function () {

    this._categories = [this._aliens, this._bullets, this._ships, this._enemyShips, this._alienbullets, this._walls, this._Lives];

},

init: function() {
    this._generateAliens();
    this._generateEnemyShip();

    //this._generateShip();
    this._generateWalls();
    this._generateLives();

},

fireBullet: function(cx, cy, velX, velY, rotation, forf) {
    this._bullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
        friendOrFoe : forf,
        rotation : rotation
    }));
},

fireSpreadBullet: function(cx, cy, velX, velY, rotation, forf) {
    this._bullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
        friendOrFoe : forf,
        rotation : rotation,
        sprite : g_sprites.spreadbullet
    }));
},

fireSniperBullet: function(cx, cy, velX, velY, rotation, forf) {
    this._bullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
        friendOrFoe : forf,
        rotation : rotation,
        sprite : g_sprites.sniperbullet
    }));
},

fireEnemyBullet: function(cx, cy, velX, velY, rotation, forf) {
    this._alienbullets.push(new Bullet({
        cx   : cx,
        cy   : cy,
        velX : velX,
        velY : velY,
        friendOrFoe : forf,
        rotation : rotation,
        sprite : g_sprites.enemybullet
    }));
},

generateAlien : function(descr) {
    this._aliens.push(new Alien(descr));
},

generateEnemyShip: function(descr) {
    this._enemyShips.push(new EnemyShip(descr));
},

generateShip : function(descr) {
    this._ships.push(new SpaceShip(descr));
},
generateWalls : function(descr) {
      this._walls.push(new defenceWall(descr));

},

generateLives : function(descr) {
      this._Lives.push(new Lives(descr));
},

resetShips: function() {
    this._forEachOf(this._ships, SpaceShip.prototype.reset);
},

resetEnemyShips: function() {
    this._forEachOf(this._enemyShips, EnemyShip.prototype.reset);
},

resetLives: function(){
    this._forEachOf(this._Lives, Lives.prototype.reset);
},

haltShips: function() {
    this._forEachOf(this._ships, SpaceShip.prototype.halt);
},

resetGame: function() {
	if(this._aliens.length > 0) this.removeAliens();
	if(this._bullets.length > 0) this.removeBullets();
	if(this._alienbullets.length > 0) this.removeAlienBullets();
    if(this._enemyShips.length > 0) this.removeEnemyShips();
	if(this._Lives.length > 0) this.removeLives();
    this._generateEnemyShip();
	this._generateAliens();
	this._generateWalls();
	this._generateLives();
	this._lastAccel = 5;
	this.resetShips();
  //this.resetLives();
},

removeAliens: function() {
	for (var i = 0; i < this._aliens.length; i++) {
		spatialManager.unregister(this._aliens[i]);
	}
	this._aliens.splice(0, this._aliens.length);
},

removeBullets: function() {
	for (var i = 0; i < this._bullets.length; i++) {
		spatialManager.unregister(this._bullets[i]);
	}
	this._bullets.splice(0, this._bullets.length);
},

removeAlienBullets: function() {
	for (var i = 0; i < this._alienbullets.length; i++) {
		spatialManager.unregister(this._alienbullets[i]);
	}
	this._alienbullets.splice(0, this._alienbullets.length);
},

removeEnemyShips: function() {
    for (var i = 0; i < this._enemyShips.length; i++) {
        spatialManager.unregister(this._enemyShips[i]);
    }
    this._enemyShips.splice(0, this._enemyShips.length);
},

removeLives: function() {
	for (var i = 0; i < this._Lives.length; i++) {
		spatialManager.unregister(this._Lives[i]);
	}
	this._Lives.splice(0, this._Lives.length);
},
	
toggleAliens: function() {
    this._bShowAliens = !this._bShowAliens;
},

// You guessed it, make the aliens turn around. More specifically:
// The entity manager notes that it's time to tell the aliens to turn around.
turnAliensNextUpdate: function() {
	this._turnAliensNext = true;
},

accelAliens: function(accelLevel) {
	var speedModifier = 1 + (accelLevel / this._accelHowOften);
	for (var i = 0; i < this._aliens.length; i++) {
		this._aliens[i].setSpeedModifier(speedModifier);
	}
},

update: function(du) {

	if (g_gameOver) {
		return;
	}

    if (g_victory) {
        return;
    }

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];
        var i = 0;

        while (i < aCategory.length) {

            var status = aCategory[i].update(du);

            if (status === this.KILL_ME_NOW) {
                // remove the dead guy, and shuffle the others down to
                // prevent a confusing gap from appearing in the array
                aCategory.splice(i,1);
            }
            else {
                ++i;
            }
        }
    }

	// Check whether you need to speed up the aliens.
	var maybeAccel = Math.ceil(this._aliens.length / this._accelWhen);
	if (maybeAccel <= 4 && maybeAccel < this._lastAccel) {
		this.accelAliens(this._accelHowOften - maybeAccel);
		this._lastAccel = maybeAccel;
	}

	if (this._turnAliensNext) this._turnAliensAround();

  if (this._aliens.length === 0) g_victory = true;
},

render: function(ctx) {

    var debugX = 10, debugY = 100;

    for (var c = 0; c < this._categories.length; ++c) {

        var aCategory = this._categories[c];

        if (!this._bShowAliens &&
            aCategory == this._aliens)
            continue;

        for (var i = 0; i < aCategory.length; ++i) {

            aCategory[i].render(ctx);
            //debug.text(".", debugX + i * 10, debugY);

        }
        debugY += 10;
    }
}

}

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
