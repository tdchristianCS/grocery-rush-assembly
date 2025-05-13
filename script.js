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

  spawnInterval = setInterval(spawnCustomer, 5_000);
};

const spawnCustomer = () => {
  let left = Tools.random(0,100);
  let top = Tools.random(0,100);

  let html = `<img src="${customerURL}" class="customer" style="left: ${left}%; top: ${top}%;">`
  $("#customerLayer").append(html);
  console.log(left, top);
};


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
$(document).ready(function(){
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
