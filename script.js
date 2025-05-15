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

const customerSize = 100;
const customerSpawnRate = 500;

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

    // debug
    // ctxStore.strokeStyle = 'ff0000';
    // for (let obstacle of obstaclesLive) {
    //     [a, b, c, d] = obstacle;
    //     ctxStore.strokeRect(a, b, c - a, d - b);
    // }
};

const pointIsInRectangle = (p, r) => {
    console.log(p);
    console.log(r);
    console.log((r.lx <= p.x) && (p.x <= r.rx) && (r.ty <= p.y) && (p.y <= r.by));
    console.log('    ');
    return (r.lx <= p.x) && (p.x <= r.rx) && (r.ty <= p.y) && (p.y <= r.by);
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

const isColliding = (clx, cty) => {
    let r2 = {
        'lx': clx,
        'ty': cty,
        'rx': clx + customerSize,
        'by': cty + customerSize
    }

    let r1;
    for (let o of obstaclesLive) {
        r1 = {
            'lx': o[0],
            'ty': o[1],
            'rx': o[2],
            'by': o[3]
        }

        if (rectanglesCollide(r1, r2)) {
            return true;
        }
    }

    return false;
};

const spawnCustomer = () => {
    let left = Random.random(0, vW - customerSize);
    let top = Random.random(0, vH - customerSize);

    // debugging
    // ctxStore.strokeStyle = '#ff0000';
    // ctxStore.strokeRect(left, top, customerSize, customerSize);

    if (isColliding(left, top)) {

        // debugging
        // clearInterval(spawnInterval);
        // console.log('attempted', left, top, left + customerSize, top + customerSize);
        // return;

        left = Random.random(0, vW - customerSize);
        top = Random.random(0, vH - customerSize);
    }

    let customer = [left, top, left + customerSize, top + customerSize];
    obstaclesLive.push(customer);
    customers.push(customer);

    ctxCustomers.drawImage(imgCustomer, left, top, customerSize, customerSize);
};

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
