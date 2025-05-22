const vW = 1440; // Window.innerWidth;
const vH = 900; // Window.innerHeight;

const obstaclesFixed = [
    [70, 70, 265, 260],
    [290, 115, 365, 265],
    [404, 80, 975, 305],
    [65, 380, 235, 840],
    [405, 425, 960, 650],
    [360, 735, 980, 840],
    [1115, 555, 1230, 840],
];

const directions = [
    'N', 'E', 'S', 'W',
    'NE', 'NW', 'SE', 'SW',
    'NNE', 'NNW', 'SSE', 'SSW',
    'ENE', 'WNW', 'ESE', 'WSW'
];

const margin = 10;

var customers = [];

const helloSound = new Audio(src = "assets/hello-87032.mp3")

const customerSize = 10;
const customerSpeed = 1;
const maxCustomers = 100;

const customerSpawnRate = 250;
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
    spawnInterval = setInterval(spawnCustomer, customerSpawnRate);
    refreshInterval = setInterval(updateGame, refreshRate);
};

const getLiveObstacles = () => {
    let obstacles = [...obstaclesFixed];
    for (let c of customers) {
        obstacles.push([c.x, c.y, c.x + customerSize, c.y + customerSize]);
    }
    return obstacles;
}

const pointIsInRectangle = (p, r) => {
    return ((r.lx <= p.x) && (p.x <= r.rx)) && ((r.ty <= p.y) && (p.y <= r.by));
}

const rectanglesCollide = (r1, r2) => {
    let corners = [
        [r2.lx, r2.ty],
        [r2.rx, r2.ty],
        [r2.lx, r2.by],
        [r2.rx, r2.by],
    ];

    let point;
    for (let corner of corners) {
        point = {
            x: corner[0],
            y: corner[1]
        }

        if (pointIsInRectangle(point, r1)) {
            return true;
        }
    }

    return false;
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

    let rectObstacle;
    for (let o of getLiveObstacles()) {
        rectObstacle = {
            'lx': o[0],
            'ty': o[1],
            'rx': o[2],
            'by': o[3]
        }

        // Skip a rectangle being ignored
        if (ignoreMode && (JSON.stringify(rectObstacle) === JSON.stringify(rectIgnore))) {
            continue;
        }

        // Check collision
        if (rectanglesCollide(rectObstacle, rectCollider)) {
            return true;
        }
    }

    return false;
};

const rectFromCorners = (lx, ty, rx, by) => {
    return {
        'lx': lx,
        'ty': ty,
        'rx': rx,
        'by': by
    };
}

const rectFromCornerAndWH = (lx, ty, w, h) => {
    return {
        'lx': lx,
        'ty': ty,
        'rx': lx + w,
        'by': ty + h
    };
}

const rectForCustomer = (x, y) => {
    return {
        'lx': x,
        'ty': y,
        'rx': x + customerSize,
        'by': y + customerSize
    };
}

const spawnCustomer = () => {
    if (customers.length >= maxCustomers) {
        return;
    }

    let nAttempts = 0;

    let x = Random.integer(margin, vW - customerSize - margin);
    let y = Random.integer(margin, vH - customerSize - margin);

    while ((nAttempts < 10) && (hasAnyCollision(rectForCustomer(x, y)))) {
        left = Random.integer(margin, vW - customerSize - margin);
        top = Random.integer(margin, vH - customerSize - margin);
        nAttempts++;
    }

    if (nAttempts < 10) {
        customers.push({x: x, y: y, movedir: Random.choice(directions)});
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

    }  else if (md === 'NNE') {
        return [x + customerSpeed / 2, y - customerSpeed];
    } else if (md === 'NNW') {
        return [x - customerSpeed / 2, y - customerSpeed];
    } else if (md === 'SSE') {
        return [x + customerSpeed / 2, y + customerSpeed];
    } else if (md === 'SSW') {
        return [x - customerSpeed / 2, y + customerSpeed];
    }

      else if (md === 'ENE') {
        return [x + customerSpeed, y - customerSpeed / 2];
    } else if (md === 'WNW') {
        return [x - customerSpeed, y - customerSpeed / 2];
    } else if (md === 'ESE') {
        return [x + customerSpeed, y + customerSpeed / 2];
    } else if (md === 'WSW') {
        return [x - customerSpeed, y + customerSpeed / 2];
    }
}

const moveCustomer = (customer) => {
    // Randomize possible directions
    let possibleDirections = [...directions];
    Random.shuffle(possibleDirections);

    // Move the customer's actual direction to the front of the list so they try that first
    JSTools.removeFromArray(possibleDirections, customer.movedir);
    possibleDirections.splice(0, 0, customer.movedir);

    // Create a rectangle representing our current position to ignore for collision
    let ownRect = rectForCustomer(customer.x, customer.y);

    // Try all the directions
    let x, y, rectCollider;
    for (let md of possibleDirections) {
        [x, y] = getXYFromMoveDirection(md, customer.x, customer.y);
        rectCollider  = rectForCustomer(x, y);

        if (canMoveHere(rectCollider, ownRect)) {
            customer.x = x;
            customer.y = y;
            customer.movedir = md;
            return;
        }
    }

    // No?
    console.log('Customer was unable to move');
}

const updateGame = () => {
    for (let customer of customers) {
        moveCustomer(customer);
    }

    drawGame();
}

const drawGame = () => {
    ctxCustomers.clearRect(0, 0, vW, vH);
    for (let c of customers) {
        ctxCustomers.drawImage(imgCustomer, c.x, c.y, customerSize, customerSize);
    }
}

const showMousePos = (e) => {
    console.log(e.clientX, e.clientY);
}

// $('body').mousemove(showMousePos);

const useMusic = () => {
    // console.log("Sound Succesfull");
    backgroundMusic.play();
};

const handleVolumeUpdate = (e) => {
    let value = parseInt(e.target.value);
    $('#volume-display').text(value);
    backgroundMusic.volume = value / 100;
    musicLastVolume = value / 100;
}
$(document).ready(function () {
    $('#volume').change(handleVolumeUpdate);
});

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
$("#play-button").click(useMusic)
$('#muteSound').click(toggleMuteMusic);
$("#play-button").click(openGameScreen);


var spawnInterval;
var refreshInterval;