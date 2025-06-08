const vW = 1440; // Window.innerWidth;
const vH = 900; // Window.innerHeight;

class Point {
    x
    y

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Rectangle {
    lx
    ty
    rx
    by

    x
    y
    w
    h

    tl
    tr
    bl
    br

    static fromCorners(lx, ty, rx, by) {
        return new Rectangle(lx, ty, rx, by);
    }

    static fromOriginAndDimensions(x, y, w, h) {
        return new Rectangle(x, y, x + w, y + h);
    }

    constructor(lx, ty, rx, by) {
        // system 1
        this.lx = lx;
        this.ty = ty;
        this.rx = rx;
        this.by = by;

        // system 2
        this.x = lx;
        this.y = ty;
        this.w = rx - lx;
        this.h = by - ty;

        // system 3
        this._calculateCorners();
    }

    updateOrigin(lx, ty) {
        this.lx = lx;
        this.ty = ty;
        this.rx = lx + this.w;
        this.by = ty + this.h;

        this.x = lx;
        this.y = ty;

        this._calculateCorners();
    }

    origin() {
        return this.tl;
    }

    _calculateCorners() {
        this.tl = new Point(this.lx, this.ty);
        this.tr = new Point(this.rx, this.ty);
        this.bl = new Point(this.lx, this.by);
        this.br = new Point(this.rx, this.by);
    }

    corners() {
        return [this.tl, this.tr, this.bl, this.br];
    }

    centre() {
        return new Point(this.x + (this.w / 2), this.y + (this.h / 2));
    }

    pointCollides(p, xOffset, yOffset) {
        if (typeof xOffset === 'undefined') {
            xOffset = 0;
        }

        if (typeof yOffset === 'undefined') {
            yOffset = 0;
        }

        return [
            this.lx <= (p.x + xOffset),
            this.rx >= (p.x + xOffset),
            this.ty <= (p.y + yOffset),
            this.by >= (p.y + yOffset)
        ].every(Boolean);
    }

    rectCollides(r2) {
        for (let corner of r2.corners()) {
            if (this.pointCollides(corner)) {
                return true;
            }
        }

        return false;
    }
}

class Item {
    name
    rect

    constructor(name, rect) {
        this.name = name;
        this.rect = rect;
    }

    getImageURL() {
        return `assets/items/tinified/${this.name}.png`;
    }
}

class Customer {
    rect
    desire
    state // 0 = shopping, 1 = satisfied, 2 = angry
    movedir
    patience

    constructor(rect, desire) {
        this.rect = rect;
        this.desire = desire;
        this.state = 0;
        this.movedir = null;
        this.patience = maxPatience;
    }

    give = (carrying) => {
        if (! this.desire || (this.desire.name === carrying.name)) {
            this.state = 1;
        } else {
            this.state = 2;
        }
        this.leaveReview();
    }

    getReview = () => {
        // angry = 1-star review
        if (this.state === 2) {
            return 1;

        } else {
            // if patience is in top 10%, 5-star
            // if it's in the bottom 10%, 1-star
            // otherwise linear scale

            if (this.patience >= (0.9 * maxPatience)) {
                return 5;
            } else if (this.patience < (0.1 * maxPatience)) {
                return 1;
            } else {
                return 1 + Math.round(((this.patience / maxPatience) * 4) * 10) / 10;
            }
        }
    }

    leaveReview = () => {
        reviews.push(this.getReview());
        console.log(`Review left: ${this.getReview()}`);
    }

    updatePatience = () => {
        if (this.state === 0) {
            this.patience -= patienceDrainRate;
            if (this.patience <= 0) {
                this.state = 2;
                this.leaveReview();
            }
        }
    }

    move = () => {
        if (this.state === 0) {
            this.moveRandomly();
        } else if ((this.state === 1) || (this.state === 2)) {
            // 1 or 2
            this.moveTowardsExit();
        }
    }

    moveTowardsExit = () => {
        let yAmplitude = Random.integer(2, 4);
        let yShift = Random.choice([yAmplitude * customerSpeed, -yAmplitude * customerSpeed]);

        let xAmplitude = Random.integer(5, 9);
        let xShift;
        if (this.rect.centre().x > (vW / 2)) {
            xShift = xAmplitude * customerSpeed;
        } else {
            xShift = -xAmplitude * customerSpeed;
        }

        this.rect.updateOrigin(this.rect.x + xShift, this.rect.y - yShift);
        if (this.rect.x > vW) {
            JSTools.removeFromArray(customers, this);
        }
    }

    moveRandomly = () => {
        // Randomize possible directions
        let possibleDirections = [...directions];
        Random.shuffle(possibleDirections);

        // Move the customer's actual direction to the front of the list so they try that first
        JSTools.removeFromArray(possibleDirections, this.movedir);
        possibleDirections.splice(0, 0, this.movedir);

        // Try all the directions
        let x, y, rectCollider;
        for (let md of possibleDirections) {
            [x, y] = getXYFromMoveDirection(md, this.rect.lx, this.rect.ty);
            rectCollider = Rectangle.fromOriginAndDimensions(x, y, customerSize, customerSize);

            if (canMoveHere(rectCollider, this.rect)) {
                this.rect.updateOrigin(x, y);
                this.movedir = md;
                return;
            }
        }
    }

    draw = () => {
        ctxCustomers.drawImage(imgCustomer, this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    }

    highlight = () => {
        ctxCustomers.beginPath();
        ctxCustomers.arc(this.rect.centre().x, this.rect.centre().y, customerSize / 2, 0, 2 * Math.PI);
        ctxCustomers.lineWidth = 4;
        ctxCustomers.strokeStyle = "white";
        ctxCustomers.stroke();
    }
}

const items = [
    new Item('broccoli', Rectangle.fromCorners(820, 525, 955, 595)),
    new Item('cabbage', Rectangle.fromCorners(685, 420, 820, 490)),
    new Item('cauliflower', Rectangle.fromCorners(415, 420, 550, 490)),
    new Item('corn', Rectangle.fromCorners(820, 420, 955, 490)),
    new Item('cucumber', Rectangle.fromCorners(550, 525, 685, 595)),
    new Item('eggplant', Rectangle.fromCorners(415, 525, 550, 595)),
    new Item('eggs', Rectangle.fromCorners(75, 395, 235, 550)),
    new Item('mushroom', Rectangle.fromCorners(550, 420, 685, 490)),
    new Item('potato', Rectangle.fromCorners(65, 165, 160, 265)),
    new Item('tomato', Rectangle.fromCorners(685, 525, 820, 595)),
    new Item('yam', Rectangle.fromCorners(160, 165, 255, 265)),
    new Item('turnip', Rectangle.fromCorners(855, 190, 970, 245)),
    new Item('pumpkin', Rectangle.fromCorners(715, 195, 785, 250)),
    new Item('radish', Rectangle.fromCorners(450, 185, 525, 250)),
    new Item('onion', Rectangle.fromCorners(780, 735, 850, 780)),
    new Item('pepper', Rectangle.fromCorners(385, 725, 460, 790)),
    new Item('garlic', Rectangle.fromCorners(590, 730, 655, 785)),
    new Item('carrot', Rectangle.fromCorners(580, 180, 655, 255)),
];

var customers = [];

const trashRect = Rectangle.fromCorners(1350, 800, 1400, 880);

const obstaclesFixed = [
    Rectangle.fromCorners(70, 70, 265, 260),
    Rectangle.fromCorners(290, 115, 365, 265),
    Rectangle.fromCorners(404, 80, 975, 305),
    Rectangle.fromCorners(65, 380, 235, 840),
    Rectangle.fromCorners(405, 425, 960, 650),
    Rectangle.fromCorners(360, 735, 980, 840),
    Rectangle.fromCorners(1115, 555, 1230, 840),
    trashRect
];

const directions = [
    'N', 'E', 'S', 'W',
    'NE', 'NW', 'SE', 'SW',
    'NNE', 'NNW', 'SSE', 'SSW',
    'ENE', 'WNW', 'ESE', 'WSW'
];

const helloSound = new Audio(src = "assets/hello-87032.mp3")

const margin = 10;
const customerSize = 72;
const customerSpeed = 2;
const maxCustomers = 100;
const maxPatience = 1_800;
const patienceDrainRate = 1; // per frame
const minDesireChance = 33;
const maxDesireChance = 70;
const desireChanceIncrement = 1;

const customerSpawnRate = 1_000;
const refreshRate = 1_000 / 60;

const canvasBG = $('#gameCanvas1').get(0);
const ctxBG = canvasBG.getContext('2d');

const canvasCustomers = $('#gameCanvas2').get(0);
const ctxCustomers = canvasCustomers.getContext('2d');

const canvasStore = $('#gameCanvas3').get(0);
const ctxStore = canvasStore.getContext('2d');

const imgBG = new Image();
imgBG.src = 'assets/Store-Floor.png';
imgBG.width = vW;
imgBG.height = vH;

const imgStore = new Image();
imgStore.src = 'assets/StoreItems.png';
imgStore.width = vW;
imgStore.height = vH;

const imgTrash = new Image();
imgTrash.src = 'assets/trash.png';
imgTrash.width = 50;
imgTrash.height = 80;

const imgCustomer = new Image();
imgCustomer.src = 'assets/customer.png';
imgCustomer.width = 200;
imgCustomer.height = 200;

const backgroundMusic = new Audio(
    "assets/music.mp3"
); // Music by Krzysztof Szymanski sourced from Pixaby
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let musicLastVolume = backgroundMusic.volume;
let musicIsMuted = false;

const hide = (el) => {
    el.addClass('hide');
};
const show = (el) => {
    el.removeClass('hide');
};

const openGameScreen = () => {
    hide($('#startScreen'));
    show($('#gameScreen'));

    ctxBG.drawImage(imgBG, 0, 0, vW, vH);
    ctxStore.drawImage(imgStore, 0, 0, vW, vH);
    ctxStore.drawImage(imgTrash, 1350, 800, 60, 80);
    spawnInterval = setInterval(spawnCustomer, customerSpawnRate);
    refreshInterval = setInterval(updateGame, refreshRate);
};

const getLiveObstacles = () => {
    let obstacles = [...obstaclesFixed];
    for (let c of customers) {
        obstacles.push(c.rect);
    }
    return obstacles;
}

const canMoveHere = (rc, ignoreRect) => {
    return [
        rc.lx > margin,
        rc.ty > margin,
        rc.lx < (vW - (rc.rx - rc.lx) - margin),
        rc.by < (vH - (rc.by - rc.ty) - margin),
        !hasAnyCollision(rc, ignoreRect)
    ].every(Boolean);
}

const hasAnyCollision = (rectCollider, rectIgnore) => {
    // Tiny optimization
    let ignoreMode = (typeof rectIgnore !== 'undefined');

    for (let r2 of getLiveObstacles()) {

        // Skip a rectangle being ignored
        if (ignoreMode && (JSON.stringify(r2) === JSON.stringify(rectIgnore))) {
            continue;
        }

        // Check collision
        if (r2.rectCollides(rectCollider)) {
            return true;
        }
    }

    return false;
};

const spawnCustomer = () => {
    if (customers.length >= maxCustomers) {
        return;
    }

    let nAttempts = 0;

    let x = Random.integer(margin + 5, vW - (customerSize * 2) - margin);
    let y = Random.integer(margin + 5, vH - (customerSize * 2) - margin - 5);
    let r = Rectangle.fromOriginAndDimensions(x, y, customerSize, customerSize);

    while ((nAttempts < 10) && (hasAnyCollision(r))) {
        x = Random.integer(margin + 5, vW - (customerSize * 2) - margin - 5);
        y = Random.integer(margin + 5, vH - (customerSize * 2) - margin - 5);
        r = Rectangle.fromOriginAndDimensions(x, y, customerSize, customerSize);
        nAttempts++;
    }

    if (nAttempts < 10) {
        let c = new Customer(r);
        c.movedir = Random.choice(directions);
        customers.push(c);
    }
}

const getXYFromMoveDirection = (md, x, y) => {
    if (md === 'E') {
        return [x + customerSpeed, y];
    } else if (md === 'W') {
        return [x - customerSpeed, y];
    } else if (md === 'N') {
        return [x, y - customerSpeed];
    } else if (md === 'S') {
        return [x, y + customerSpeed];

    } else if (md === 'NE') {
        return [x + customerSpeed, y - customerSpeed];
    } else if (md === 'NW') {
        return [x - customerSpeed, y - customerSpeed];
    } else if (md === 'SE') {
        return [x + customerSpeed, y + customerSpeed];
    } else if (md === 'SW') {
        return [x - customerSpeed, y + customerSpeed];

    } else if (md === 'NNE') {
        return [x + customerSpeed / 2, y - customerSpeed];
    } else if (md === 'NNW') {
        return [x - customerSpeed / 2, y - customerSpeed];
    } else if (md === 'SSE') {
        return [x + customerSpeed / 2, y + customerSpeed];
    } else if (md === 'SSW') {
        return [x - customerSpeed / 2, y + customerSpeed];
    } else if (md === 'ENE') {
        return [x + customerSpeed, y - customerSpeed / 2];
    } else if (md === 'WNW') {
        return [x - customerSpeed, y - customerSpeed / 2];
    } else if (md === 'ESE') {
        return [x + customerSpeed, y + customerSpeed / 2];
    } else if (md === 'WSW') {
        return [x - customerSpeed, y + customerSpeed / 2];
    }
}

const calculateStore = () => {
}

const updateGame = () => {
    for (let customer of customers) {
        customer.updatePatience();
        customer.move();
    }

    drawGame();
}

const drawGame = () => {
    ctxCustomers.clearRect(0, 0, vW, vH);
    for (let c of customers) {
        c.draw();
    }
}

function getMousePosOnCanvas(canvas, e) {
    let rect = canvas.getBoundingClientRect();
    return new Point(e.clientX - rect.left, e.clientY - rect.top);
}

function pointingAtItem(p) {
    for (let item of items) {
        if (item.rect.pointCollides(p)) {
            return item;
        }
    }
}

function pointingAtCustomer(p) {
    for (let c of customers) {
        if (c.rect.pointCollides(p)) {
            return c;
        }
    }
}

function pointingAtTrash(p) {
    return trashRect.pointCollides((p));
}

function setCursor(url, xOffset, yOffset) {
    $('#gameCanvas3').css('cursor', `url("${url}") ${xOffset} ${yOffset}, pointer`);
}

function resetCursor() {
    $('#gameCanvas3').css('cursor', 'auto');
}

function handleCanvasMouseMove(e) {
    let p = getMousePosOnCanvas(e.target, e);

    if (!carrying) {
        if (pointingAtItem(p)) {
            setCursor("assets/pluck.png", 28, 20);
        } else {
            resetCursor();
        }

    } else {
        let c = pointingAtCustomer(p);
        if (c) {
            c.highlight();
        } else if (pointingAtTrash(p)) {
            setCursor("assets/trashbag.png", 32, 30);
        } else {
            setCursor(carrying.getImageURL(), 0, 0);
        }
    }
}

function handleCanvasMousedown(e) {
    let p = getMousePosOnCanvas(e.target, e);
    if (!carrying) {
        if (pointingAtItem(p)) {
            setCursor("assets/pluck.png", 28, 20);
        } else {
            resetCursor();
        }

    } else {
        if (pointingAtTrash(p)) {
            setCursor("assets/trashbag.png", 32, 30);
        } else {
            setCursor(carrying.getImageURL(), 0, 0);
        }
    }
}

function handleCanvasMouseup(e) {
    let p = getMousePosOnCanvas(e.target, e);
    if (!carrying) {
        let item = pointingAtItem(p);
        if (item) {
            setCursor(item.getImageURL(), 0, 0);
            carrying = item;
        }

    } else {
        let c = pointingAtCustomer(p);
        if (c) {
            c.give(carrying);
            carrying = null;
            resetCursor();

        } else if (pointingAtTrash(p)) {
            carrying = null;
            resetCursor();
        }
    }
}

const useMusic = () => {
    backgroundMusic.play();
};

const handleVolumeUpdate = (e) => {
    let value = parseInt(e.target.value);
    $('#volume-display').text(value);
    backgroundMusic.volume = value / 100;
    musicLastVolume = value / 100;
}

const toggleMuteMusic = () => {
    if (musicIsMuted) {
        musicIsMuted = false;
        backgroundMusic.volume = musicLastVolume;
        $('#muteSound').text('Mute');
    } else {
        musicIsMuted = true;
        backgroundMusic.volume = 0;
        $('#muteSound').text('Unmute');
    }
}

//Runs the code

const bind = () => {
    $("#play-button").click(useMusic)
    $('#muteSound').click(toggleMuteMusic);
    $("#play-button").click(openGameScreen);

    $('#volume').change(handleVolumeUpdate);

    $('#gameCanvas3').mousemove(handleCanvasMouseMove);
    $('#gameCanvas3').mousedown(handleCanvasMousedown);
    $('#gameCanvas3').mouseup(handleCanvasMouseup);
}

const init = () => {
    bind();
}

// intervals
var spawnInterval;
var refreshInterval;

// mutable game variables
var carrying = null;
var reviews = [];
var desireChance = minDesireChance;

$(document).ready(init);
