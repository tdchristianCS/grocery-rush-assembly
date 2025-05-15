const obstaclesFixed = [
    [1200, 360, 1600, 545],
    [965, 65, 1090, 220],
    [953, 323, 1071, 599],
    [1198, 69, 1615, 284],
    [1717, 484, 1795, 702],
    [961, 637, 1069, 700],
    [1170, 631, 1613, 703],
];

var obstaclesLive = obstaclesFixed.splice();

const customerSize = 200;

const backgroundMusic = new Audio(
    "https://t.sawczak.com/misc_assets/ics-hosting/jc-001.mp3"
); // Music by Krzysztof Szymanski sourced from Pixaby
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let musicLastVolume = backgroundMusic.volume;
let musicIsMuted = false;

const customerURL = "assets/customer.png"
const customerIMG = `<img src="${customerURL}" class="customer">`;
const hide = (el) => {
    el.addClass('hide');
};
const show = (el) => {
    el.removeClass('hide');
};
const openGameScreen = () => {
    hide($('#startScreen'));
    show($('#gameScreen'));

    spawnInterval = setInterval(spawnCustomer, 1_000);
};

const spawnCustomer = () => {
    let left = Tools.random(0, 100);
    let top = Tools.random(0, 100);
    while (isColliding(top, left)) {
        left = Tools.random(0, 100);
        top = Tools.random(0, 100);
    }

    obstaclesLive.push([left, top, left + customerSize, top + customerSize]);

    let style = `left: ${left}%; top: ${top}%; width: ${customerSize}px; height: ${customerSize}px;`;

    let html = `<img src="${customerURL}" class="customer" style="${style}">`
    $("#customerLayer").append(html);
    // console.log(left, top);
};

const pointIsInRectangle = (px, py, rlx, rty, rrx, rby) => {
    return (rlx < px) && (px < rrx) && (rty < py) && (py < rby);
}

const rectanglesCollide = (r1lx, r1ty, r1rx, r1by, r2lx, r2ty, r2rx, r2by) => {
    let corners = [
        [r2lx, r2ty],
        [r2rx, r2ty],
        [r2lx, r2by],
        [r2rx, r2by],
    ];

    let px, py;
    for (let corner of corners) {
        [px, py] = corner;
        if (pointIsInRectangle(px, py, r1lx, r1ty, r1rx, r1by)) {
            return true;
        }
    }

    return false;
}

const isColliding = (cty, clx) => {
    let cw = customerSize;
    let ch = customerSize;

    let r1lx, r1ty, r1rx, r1by;
    for (let obstacle of obstaclesLive) {
        [r1lx, r1ty, r1rx, r1by] = obstacle;
        if (rectanglesCollide(r1lx, r1ty, r1rx, r1by, clx, cty, clx + cw, cty + ch))
        {
            return true;
        }
    }
    return false;
};

    const showMousePos = (e) => {
        console.log(e.clientX, e.clientY);
    }

    $('body').mousemove(showMousePos);

    const useMusic = () => {
        console.log("Sound Succesfull");
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
