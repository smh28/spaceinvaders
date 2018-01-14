// ====
// ALIEN
// ====

"use strict";

var shootingRate = 10;

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Alien(descr) {

    // Common inherited setup logic from Entity
    this.setup(descr);

	this.velX = 1;
	this._turnAroundNext = false;

	this._speedModifier = 1;
	
	// Which part of the spritesheet to use
	this._row = 0;
	this._column = 0;
	
	// The general delay between switching stances and the time until the next switch,
	// Initialized with a slight random adjustment.
	this.SWITCH_STANCE = 50;
	this.untilNextStance = 50 + Math.random() * 8;

    // Default sprite, if not otherwise specified
    this.sprite = this.sprite || g_sprites.alien;

};

Alien.prototype = new Entity();

Alien.prototype.KEY_FIRE   = ' '.charCodeAt(0);
Alien.prototype.rotation = 0;
Alien.prototype.cx = 100;
Alien.prototype.cy = 200;
Alien.prototype.velX = 0;
Alien.prototype.velY = 0;
Alien.prototype.launchVel = 2;
Alien.prototype.friendOrFoe = true;

Alien.prototype.update = function (du) {

    // Unregister and check for death

	spatialManager.unregister(this);

	//if(this.cy > g_canvas.height - (this.sprite.height / 2))

	this.fireAlienBullet();

	if(this._isDeadNow) return entityManager.KILL_ME_NOW;
	
	if(this.cy > 530 - (this.sprite.height / 2)) {
		g_gameOver = true;
		return;
	}
	
	// Amount moved is based on the current level, and speed modifier.
	var levelToSpeed = g_level / 5;
	if(this._turnAroundNext) {
		this.velX = -this.velX;
		this.cx += (this.velX + (levelToSpeed * this.velX)) * this._speedModifier * du;
		this.cy += 5;
		this._turnAroundNext = false;
		if(this._row === 1) this._row = 0;
		else this._row = 1;
	}
	else {
		this.cx += (this.velX + (levelToSpeed * this.velX)) * this._speedModifier * du;
		if(this.cx > entityManager.ALIEN_TURN_MAX ||
		   this.cx < entityManager.ALIEN_TURN_MIN) {
			entityManager.turnAliensNextUpdate();
		}
	}
	
	// Updates the time until the next stance, switches if appropriate
	// Updates the next interval if it switches stances, with slight random value
	// added or substracted, so they mostly don't go completely out of synch.
	// Use speed-related modifiers to adjust stance switching as well.
	
	this.untilNextStance -= du; 
	if(this.untilNextStance < 0) {
		if (this._column === 0) {
			this._column = 1;
			this.untilNextStance = (this.SWITCH_STANCE - Math.random() * 8) 
								   / (this._speedModifier * (1 + levelToSpeed));
		}
		else {
			this._column = 0;
			this.untilNextStance = (this.SWITCH_STANCE + Math.random() * 8) 
								   / (this._speedModifier * (1 + levelToSpeed));
		}
	}
	
	// (Re-)Register

	spatialManager.register(this);
};

Alien.prototype.getRadius = function () {
    return (this.sprite.width / 2);
};

Alien.prototype.evaporateSound = new Audio(
  "sounds/alienEvaporate.ogg");

Alien.prototype.takeBulletHit = function () {

    this.kill();

    this.evaporateSound.play();

    //update score
    g_score += g_score_enemies * this.whatAlienAmI();
};

// For when we implement shooting aliens
Alien.prototype.fireAlienBullet = function () {
  var enemy = getFiringEnemy();
  if (enemy == null) {
    return;
  }

  if (entityManager._alienbullets.length < TEMPALIENMAGAZINE) {
    var dX = +Math.sin(Math.PI);
    var dY = -Math.cos(Math.PI);
    var launchDist = this.getRadius() * 1.2;

    var relVel = this.launchVel;
    var relVelX = dX * relVel;
    var relVelY = dY * relVel;

    entityManager.fireEnemyBullet(
       enemy.cx + dX * launchDist, enemy.cy + dY * launchDist,
       relVelX, relVelY,
       enemy.rotation, true);
  }
};

Alien.prototype.turnAround = function () {
	this._turnAroundNext = true;
};

Alien.prototype.setSpeedModifier = function (newSpeedModifier) {
	this._speedModifier = newSpeedModifier;
};

Alien.prototype.whatAlienAmI = function () {
	if (this.sprite === g_sprites.alien2) return 2;
	else if (this.sprite === g_sprites.alien3) return 3;
	else return 1;
};

Alien.prototype.render = function (ctx) {
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, 0, this._row, this._column
    );
};


function getFiringEnemy(){
  // næst handle undefined enemys
  return  entityManager._aliens[Math.floor((Math.random() * entityManager._aliens.length) + 0)];
};
