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
    image

    constructor(name, rect) {
        this.name = name;
        this.rect = rect;
        this.createImage();
    }

    createImage() {
        this.image = new Image();
        this.image.src = this.getImageURL();
        this.image.width = 24;
        this.image.height = 24;
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
    patienceDrainRate
    speed
    slatedToDestroy;

    constructor(rect) {
        this.rect = rect;
        this.state = 0;
        this.movedir = null;

        this.patience = maxPatience;
        this.patienceDrainRate = patienceDrainRate; // locks it in place

        this.speed = customerSpeed;

        if (! Random.chance(desireChance)) {
            this.desire = null;
        } else {
            this.desire = Random.choice(items);
        }

        this.slatedToDestroy = false;
    }

    foodIsSuitable = () => {
        return ! this.desire || ! carrying || (this.desire.name === carrying.name);
    }

    give = () => {
        if (this.foodIsSuitable()) {
            this.state = 1;
            meowHappy.play();
            updateDifficulty();
        } else {
            this.state = 2;
            meowAngry.play();
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
                // return 1 + Math.round(((this.patience / maxPatience) * 4) * 10) / 10;
                return 1 + Math.round((this.patience / maxPatience) * 4);
            }
        }
    }

    leaveReview = () => {
        let review = this.getReview();
        reviews.push(review);
        reviewMarkers.push(new ReviewMarker(this.rect.x, this.rect.y, review));
    }

    updatePatience = () => {
        if (this.state === 0) {
            this.patience -= patienceDrainRate;
            if (this.patience <= 0) {
                this.state = 2;
                meowBored.play();
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
        let yShift = Random.choice([yAmplitude * minCustomerSpeed, -yAmplitude * minCustomerSpeed]);

        let xAmplitude = Random.integer(5, 9);
        let xShift;
        if (this.rect.centre().x > (vW / 2)) {
            xShift = xAmplitude * minCustomerSpeed;
        } else {
            xShift = -xAmplitude * minCustomerSpeed;
        }

        this.rect.updateOrigin(this.rect.x + xShift, this.rect.y - yShift);
        if ((this.rect.x > vW) || (this.rect.x < 0)) {
            this.slatedToDestroy = true;
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
            [x, y] = getXYFromMoveDirection(md, this.speed, this.rect.lx, this.rect.ty);
            rectCollider = Rectangle.fromOriginAndDimensions(x, y, customerSize, customerSize);

            if (canMoveHere(rectCollider, this.rect)) {
                this.rect.updateOrigin(x, y);
                this.movedir = md;
                return;
            }
        }
    }

    draw = () => {
        let img;
        if (this.state === 0) {
            img = imgCustomer;
        } else if (this.state === 1) {
            img = imgCustomerGlad;
        } else if (this.state === 2) {
            img = imgCustomerMad;
        }

        ctxCustomers.drawImage(img, this.rect.x, this.rect.y, this.rect.w, this.rect.h);

        if (!! this.desire) {
            this.drawDesire();
        }

        if (this.state === 0) {
            this.drawPatience();
        }
    }

    drawDesire = () => {
        let xD = this.rect.x + ((customerSize / 1.9))
        let yD = this.rect.y - (customerSize / 4);
        let wD = this.rect.w / 2;
        let hD = this.rect.h / 2;

        ctxCustomerInfo.beginPath();
        ctxCustomerInfo.fillStyle = "white";
        ctxCustomerInfo.arc(xD + (wD / 2), yD + (hD / 2), wD / 1.5, 0, 2 * Math.PI);
        ctxCustomerInfo.fill();

        ctxCustomerInfo.drawImage(this.desire.image, xD, yD, wD, hD);
    }

    drawPatience = () => {
        let pct = this.patience / maxPatience * 100;
        let w = JSTools.proportion(pct, this.rect.w);
        let x = this.rect.x + ((this.rect.w - w) / 2);

        if (pct > 66) {
            ctxCustomers.fillStyle = "green";
        } else if (pct > 33) {
            ctxCustomers.fillStyle = "orange";
        } else {
            ctxCustomers.fillStyle = "red";
        }

        ctxCustomers.fillRect(x, this.rect.by, w, 2);
    }

    highlight = () => {
        ctxCustomerInfo.beginPath();
        ctxCustomerInfo.arc(this.rect.centre().x, this.rect.centre().y, (customerSize / 2), 0, 2 * Math.PI);
        ctxCustomerInfo.lineWidth = 4;

        if (this.foodIsSuitable()) {
            ctxCustomerInfo.strokeStyle = "white";
        } else {
            ctxCustomerInfo.strokeStyle = "red";
        }

        ctxCustomerInfo.stroke();
    }
}

class ReviewMarker {
    x
    y
    value
    timeout
    slatedToDestroy

    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;

        this.slatedToDestroy = false;
        this.timeout = setTimeout(() => {
            this.slatedToDestroy = true;
            }, 1_000);
    }

    draw() {
        let text = `${this.value}⭐`;

        ctxUI.fillStyle = "white";
        ctxUI.fillRect(this.x - 5, this.y - 22, 50, 29);

        ctxUI.fillStyle = "black";
        ctxUI.font = "22px Segoe UI";
        ctxUI.fillText(text, this.x, this.y);
    }
}

var reviewMarkers = [];

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

const meowHappy = new Audio("");
const meowAngry = new Audio("");
const meowBored = new Audio("");

const canvasBG = $('#gameCanvas1').get(0);
const ctxBG = canvasBG.getContext('2d');

const canvasCustomers = $('#gameCanvas2').get(0);
const ctxCustomers = canvasCustomers.getContext('2d');

const canvasStore = $('#gameCanvas3').get(0);
const ctxStore = canvasStore.getContext('2d');

const canvasCustomerInfo = $('#gameCanvas4').get(0);
const ctxCustomerInfo = canvasCustomerInfo.getContext('2d');

const canvasUI = $('#gameCanvas5').get(0);
const ctxUI = canvasUI.getContext('2d');

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
imgCustomer.width = 500;
imgCustomer.height = 450;

const imgCustomerMad = new Image();
imgCustomerMad.src = 'assets/customer-mad.png';
imgCustomerMad.width = 500;
imgCustomerMad.height = 450;

const imgCustomerGlad = new Image();
imgCustomerGlad.src = 'assets/customer-glad.png';
imgCustomerGlad.width = 500;
imgCustomerGlad.height = 450;

const backgroundMusic = new Audio(
    "assets/music.mp3"
); // Music by Krzysztof Szymanski sourced from Pixaby
backgroundMusic.loop = true;

backgroundMusic.volume = 0.5;
meowHappy.volume = 0.5;
meowAngry.volume = 0.5;
meowBored.volume = 0.5;

let audioLastVolume = backgroundMusic.volume;

const hide = (el) => {
    el.addClass('hide');
};
const show = (el) => {
    el.removeClass('hide');
};

const hideMenus = () => {
    hide($('#welcomeMenu'));
    hide($('#instructions'));
    hide($('#settings'));
    hide($('#soundControl'));
}

const showInstructions = () => {
    hideMenus();
    show($('#instructions'));
}

const showWelcome = () => {
    hideMenus();
    show($('#welcomeMenu'));
}

const showSettings = () => {
    hideMenus();
    show($('#settings'));
}

const setStartValues = () => {
    customers.length = 0;
    reviewMarkers.length = 0;
    reviews.length = 0;
    carrying = null;

    desireChance = minDesireChance;
    customerSpeed = minCustomerSpeed;
    patienceDrainRate = minPatienceDrainRate; // per frame
    customerSpawnRate = slowestCustomerSpawnRate;
}

const startGame = () => {
    gameState = 1;

    hide($('#startScreen'));
    show($('#gameScreen'));

    show($('#play-button'));
    hide($('#pause-button'));
    hide($('#resume-button'));

    for (let ctx of [ctxStore, ctxBG, ctxCustomers, ctxCustomerInfo, ctxUI]) {
        ctx.clearRect(0, 0, vW, vH);
    }

    clearTimeout(spawnTimeout);
    clearInterval(refreshInterval);
    clearInterval(tickInterval);

    drawStaticElements();
    setStartValues();

    spawnTimeout = setTimeout(spawnCustomer, customerSpawnRate);
    refreshInterval = setInterval(updateGame, refreshRate);

    if ($('#timedMode').prop('checked')) {
        remainingSeconds = $('#timeAllowed').val();
        tickInterval = setInterval(tick, 1_000);
    }
};

const pauseGame = () => {
    if (gameState === 1) {
        gameState = 2;
    }

    hide($('#gameScreen'));
    show($('#startScreen'));

    hide($('#play-button'));
    show($('#resume-button'));
    show($('#restart-button'));

    clearTimeout(spawnTimeout);
    clearInterval(refreshInterval);
    clearInterval(tickInterval);
}

const resumeGame = () => {
    if (gameState === 2) {
        gameState = 1;
    }

    hide($('#startScreen'));
    show($('#gameScreen'));

    show($('#play-button'));
    hide($('#resume-button'));
    hide($('#restart-button'));

    drawStaticElements();

    spawnTimeout = setTimeout(spawnCustomer, customerSpawnRate);
    refreshInterval = setInterval(updateGame, refreshRate);

    if ($('#timedMode').prop('checked')) {
        tickInterval = setInterval(tick, 1_000);
    }
}

function restartGame() {
    startGame();
}

function stopGame() {
    gameState = 3;

    clearTimeout(spawnTimeout);
    // clearInterval(refreshInterval);
    clearInterval(tickInterval);
}

function exitGame() {
    hide($('#gameScreen'));
    show($('#startScreen'));

    show($('#play-button'));
    hide($('#resume-button'));
    hide($('#restart-button'));
}

function tick() {
    if (gameState === 1) {
        remainingSeconds -= 1;
        if (remainingSeconds === 0) {
            stopGame();
        }
    }
}

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
    if (gameState !== 1) {
        return;
    }

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

    // Manually set the next one so that we can change the interval
    spawnTimeout = setTimeout(spawnCustomer, customerSpawnRate);
}

const getXYFromMoveDirection = (md, speed, x, y) => {
    if (md === 'E') {
        return [x + speed, y];
    } else if (md === 'W') {
        return [x - speed, y];
    } else if (md === 'N') {
        return [x, y - speed];
    } else if (md === 'S') {
        return [x, y + speed];

    } else if (md === 'NE') {
        return [x + speed, y - speed];
    } else if (md === 'NW') {
        return [x - speed, y - speed];
    } else if (md === 'SE') {
        return [x + speed, y + speed];
    } else if (md === 'SW') {
        return [x - speed, y + speed];

    } else if (md === 'NNE') {
        return [x + speed / 2, y - speed];
    } else if (md === 'NNW') {
        return [x - speed / 2, y - speed];
    } else if (md === 'SSE') {
        return [x + speed / 2, y + speed];
    } else if (md === 'SSW') {
        return [x - speed / 2, y + speed];
    } else if (md === 'ENE') {
        return [x + speed, y - speed / 2];
    } else if (md === 'WNW') {
        return [x - speed, y - speed / 2];
    } else if (md === 'ESE') {
        return [x + speed, y + speed / 2];
    } else if (md === 'WSW') {
        return [x - speed, y + speed / 2];
    }
}

const formatNumber = (n) => {
    n = n.toString();
    if (n.length === 1) {
        n += ".0";
    }
    return n;
}

const formatScore = () => {
    let avg = 0;

    if (reviews.length > 0) {
        for (let r of reviews) {
            avg += r;
        }
        avg /= reviews.length;
        avg = Math.round(avg * 10) / 10;
    }

    avg = formatNumber(avg);

    return `${avg} ⭐ (${reviews.length})`;
}

const drawTimer = () => {
    if (! $('#timedMode').prop('checked')) {
        return;
    }

    let text = `${remainingSeconds} SECONDS`;

    ctxUI.fillStyle = "black";
    ctxUI.fillRect(1300, 50, 150, 50);

    ctxUI.fillStyle = "white";
    ctxUI.font = "22px quokka";
    ctxUI.fillText(text, 1310, 80);
}

const drawUI = () => {
    ctxUI.clearRect(0, 0, vW, vH);
    drawReviewMarkers();
    drawScore();
    drawPaused();
    drawEnded();
    drawTimer();
}

const drawStaticElements = () => {
    ctxBG.drawImage(imgBG, 0, 0, vW, vH);
    ctxStore.drawImage(imgStore, 0, 0, vW, vH);
    ctxStore.drawImage(imgTrash, 1350, 800, 60, 80);
}

const drawReviewMarkers = () => {
    for (let rm of reviewMarkers) {
        rm.draw();
    }
}

const drawScore = () => {
    let text = formatScore();

    ctxUI.fillStyle = "black";
    ctxUI.fillRect(1300, 0, 150, 50);

    ctxUI.fillStyle = "white";
    ctxUI.font = "22px quokka";
    ctxUI.fillText(text, 1310, 30);
}

const drawPaused = () => {
    if (gameState === 2) {
        ctxUI.fillStyle = "black";
        ctxUI.fillRect(560, 350, 250, 60);

        ctxUI.fillStyle = "white";
        ctxUI.font = "60px quokka";
        ctxUI.fillText("PAUSED", 590, 396);
    }
}

const drawEnded = () => {
    if (gameState === 3) {
        ctxUI.fillStyle = "black";
        ctxUI.fillRect(550, 350, 280, 60);

        ctxUI.fillStyle = "white";
        ctxUI.font = "60px quokka";
        ctxUI.fillText("FINISHED", 580, 396);

        ctxUI.fillStyle = "black";
        ctxUI.fillRect(440, 660, 500, 60);

        ctxUI.fillStyle = "white";
        ctxUI.font = "60px quokka";
        ctxUI.fillText("SPACE/ESC TO QUIT", 460, 707);
    }
}

const updateDifficulty = () => {
    // increase desire chance
    if (desireChance < maxDesireChance) {
        desireChance += desireChanceIncrement;
    }

    // increase customer speed
    if (customerSpeed < maxCustomerSpeed) {
        customerSpeed += customerSpeedIncrement;
    }

    // increase patience drain rate
    if (patienceDrainRate < maxPatienceDrainRate) {
        patienceDrainRate += patienceDrainRateIncrement;
    }

    // increase customer spawn rate
    // Note that it is reversed... it approaches the "maximum"
    if (customerSpawnRate > fastestCustomerSpawnRate) {
        customerSpawnRate -= customerSpawnRateIncrement;
    }
}

const cleanupCustomers = () => {
    JSTools.filterArrayInPlace(customers, function(e) {
        return ! e.slatedToDestroy;
    });
}

const cleanupReviewMarkers = () => {
    JSTools.filterArrayInPlace(reviewMarkers, function(e) {
        return ! e.slatedToDestroy;
    });
}

const updateGame = () => {

    if (gameState === 1) {
        cleanupCustomers();
        cleanupReviewMarkers();

        for (let customer of customers) {
            customer.updatePatience();
            customer.move();
        }
    }

    drawGame();
    drawUI();
    updateCursor();
}

const drawGame = () => {
    ctxCustomers.clearRect(0, 0, vW, vH);
    ctxCustomerInfo.clearRect(0, 0, vW, vH);
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
    $('#gameCanvas5').css('cursor', `url("${url}") ${xOffset} ${yOffset}, pointer`);
}

function resetCursor() {
    $('#gameCanvas5').css('cursor', 'auto');
}

function updateCursor() {
    let p = lastSeenMousePos;
    if (! p) { return; }
    if (gameState !== 1) {
        return;
    }

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
            setCursor(carrying.getImageURL(), 24, 24);
        }
    }
}

function handleCanvasMouseMove(e) {
    lastSeenMousePos = getMousePosOnCanvas(e.target, e);
    updateCursor();
}

function handleCanvasMouseup(e) {
    if (gameState !== 1) {
        return;
    }

    let p = getMousePosOnCanvas(e.target, e);
    if (!carrying) {
        let item = pointingAtItem(p);
        if (item) {
            setCursor(item.getImageURL(), 24, 24);
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

const startMusic = () => {
    if (! musicStarted) {
        musicStarted = true;
        backgroundMusic.play();
    }
};

const handleVolumeUpdate = (e) => {
    let value = parseInt(e.target.value);
    $('#volume-display').text(value);

    backgroundMusic.volume = value / 100;
    meowHappy.volume = value / 100;
    meowAngry.volume = value / 100;
    meowBored.volume = value / 100;
    audioLastVolume = value / 100;
}

const toggleMuteMusic = (e) => {
    if ($(e.target).prop('checked')) {

        backgroundMusic.volume = 0;
        meowHappy.volume = 0;
        meowAngry.volume = 0;
        meowBored.volume = 0;
        $('#volume').val(0);
        $('#volume-display').text(0);
        $('#volume').prop('disabled', true);

    } else {

        backgroundMusic.volume = audioLastVolume;
        meowHappy.volume = audioLastVolume;
        meowAngry.volume = audioLastVolume;
        meowBored.volume = audioLastVolume;
        $('#volume').val(backgroundMusic.volume * 100);
        $('#volume-display').text(musicLastVolume * 100);
        $('#volume').prop('disabled', false);
    }
}

const handleKeyup = (e) => {
    if ((e.code === "Escape") || (e.code === "Space")) {
        if (gameState === 1) {
            pauseGame();
        } else if (gameState === 2) {
            resumeGame();
        } else if (gameState === 3) {
            exitGame();
        }
    }
}

function handleTimedModeChange(e) {
    let box = $(e.target);
    if (box.prop('checked')) {
        $('#timeAllowedLabel').addClass('optionValidated');
        $('#timeAllowed').prop('disabled', false);
    } else {
        $('#timeAllowedLabel').removeClass('optionValidated');
        $('#timeAllowed').prop('disabled', true);
    }
}

function handleTimeAllowedChange(e) {
    remainingSeconds = parseInt(e.target.value);
}

const bind = () => {
    $("#play-button").click(startGame);
    $("#resume-button").click(resumeGame);
    $("#restart-button").click(restartGame);
    $("#instructions-button").click(showInstructions);
    $("#settings-button").click(showSettings);
    $(".back-button").click(showWelcome);

    $('#mute').change(toggleMuteMusic);
    $('#volume').change(handleVolumeUpdate);
    $('#volume').mousemove(handleVolumeUpdate);

    $('#gameCanvas5').mousemove(handleCanvasMouseMove);
    $('#gameCanvas5').mouseup(handleCanvasMouseup);

    $('#timedMode').change(handleTimedModeChange);
    $('#timeAllowed').change(handleTimeAllowedChange);
    $('#timeAllowed').keydown(handleTimeAllowedChange);
    $('#timeAllowed').keyup(handleTimeAllowedChange);

    $(document).keyup(handleKeyup);
    $(document).click(startMusic);
}

const addJukeboxSounds = () => {
    jukebox.addByURL("music", "assets/music.mp3");
    jukebox.volume(50);
}

const init = () => {
    bind();
    addJukeboxSounds();

    $('#mute').prop('checked', false);
    $('#volume').val(backgroundMusic.volume * 100);
    $('#volume-display').text(audioLastVolume * 100);
    $('#volume').prop('disabled', false);
}

// intervals
var refreshInterval = null;
var spawnTimeout = null;
var tickInterval = null;

// mutable game variables
var reviews = [];
var carrying = null;

var desireChance = minDesireChance;
var customerSpeed = minCustomerSpeed;
var patienceDrainRate = minPatienceDrainRate; // per frame
var customerSpawnRate = slowestCustomerSpawnRate;

var gameState = 0; // 0 = not started, 1 = playing, 2 = paused, 3 = ended
var lastSeenMousePos = null;
var remainingSeconds = 60;

var musicStarted = false;
var jukebox = new Jukebox();

$(document).ready(init);
