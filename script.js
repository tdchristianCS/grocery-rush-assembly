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

var obstaclesLive = obstaclesFixed.splice(0);

var customers = [];

const helloSound = new Audio(src = "assets/hello-87032.mp3")

const customerSize = 100;
const customerSpawnRate = 500;
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


    // debug
    // ctxStore.strokeStyle = 'ff0000';
    // for (let obstacle of obstaclesLive) {
    //     [a, b, c, d] = obstacle;
    //     ctxStore.strokeRect(a, b, c - a, d - b);
    // }
};

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

const hasAnyCollision = (clx, cty, crx, cby) => {
    let rc = {
        'lx': clx,
        'ty': cty,
        'rx': crx,
        'by': cby
    }

    let ro;
    for (let o of obstaclesLive) {
        ro = {
            'lx': o[0],
            'ty': o[1],
            'rx': o[2],
            'by': o[3]
        }

        if (rectanglesCollide(ro, rc)) {
            return true;
        }
    }

    return false;
};

const spawnCustomer = () => {
    let nAttempts = 0;

    let left = Random.random(0, vW - customerSize);
    let top = Random.random(0, vH - customerSize);

    // debugging
    // ctxStore.strokeStyle = '#ff0000';
    // ctxStore.strokeRect(left, top, customerSize, customerSize);

    while ((nAttempts < 10) && (hasAnyCollision(left, top, left + customerSize, top + customerSize))) {

        // debugging
        // clearInterval(spawnInterval);
        // console.log('attempted', left, top, left + customerSize, top + customerSize);
        // return;

        left = Random.random(0, vW - customerSize);
        top = Random.random(0, vH - customerSize);
        nAttempts++;
    }

    if (nAttempts < 10) {
        console.log('spoawned customer');
        obstaclesLive.push([left, top, left + customerSize, top + customerSize]);
        customers.push({x: left, y: top, movedir: Random.randomChoice(['N', 'E', 'S', 'W'])});
    }
}

const getXYFromMoveDirection = (md, x, y) => {
    if (md === 'E') {
        x += 1;
    } else if (md === 'W') {
        x -= 1;
    } else if (md === 'N') {
        y -= 1;
    } else if (md === 'S') {
        y += 1;
    }

    return [x, y];
}

const moveCustomer = (customer) => {
    // Randomize possible directions
    let directions = ['N', 'E', 'S', 'W'];
    Random.shuffle(directions);

    // Move the customer's actual direction to the front of the list so they try that first
    JSTools.removeFromArray(directions, customer.movedir);
    directions.splice(0, 0, customer.movedir);

    // Try all the directions
    let x, y;
    for (let md of directions) {
        [x, y] = getXYFromMoveDirection(md, customer.x, customer.y);
        if (!hasAnyCollision(x, y, x + customerSize, y + customerSize)) {
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