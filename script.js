const backgroundMusic = new Audio(
  "https://t.sawczak.com/misc_assets/ics-hosting/jc-001.mp3"
); // Music by Krzysztof Szymanski sourced from Pixaby
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let musicLastVolume = backgroundMusic.volume;
let musicIsMuted = false;

//Open the load game screen
const openMenu = () => {
  $('#menuMenu').removeClass('hide');
  $('#welcomeMenu').addClass('hide');
};
const closeMenu = () => {
  $('#menuMenu').addClass('hide');
  $('#welcomeMenu').removeClass('hide');
};
//------------------------------------------------//

//Opens and Closes the instructions screen
const openInstructions = () => {
  $('#instructions').removeClass('hide');
  $('#helpMenu').addClass('hide');
};
const closeInstructions = () => {
  $('#instructions').addClass('hide');
  $('#helpMenu').removeClass('hide');
};
//------------------------------------------------//


//Opens and Closes the settings menu
const openSettings = () => {
  $('#settings').removeClass('hide');
  $('#helpMenu').addClass('hide');
};
const closeSettings = () => {
  $('#settings').addClass('hide');
  $('#helpMenu').removeClass('hide');
};

//Opens and Closes the Sound Menu
const openSoundMenu = () => {
  $('#soundControl').removeClass('hide');
  $('#settings').addClass('hide');
};
const closeSoundMenu = () => {
  $('#soundControl').addClass('hide');
  $('#settings').removeClass('hide');
};


const openGameArea = () => {
  hide($('#startScreen'))
  show($('#gameScreen'));
}

$('#newgameButton').click(openGameArea())

// Tests music and prints a value to show if it was successful
const useMusic = () => {
  console.log("Sound Succesfull");
  backgroundMusic.play();
};

//Controls the volume
const handleVolumeUpdate = (e) => {
  let value = parseInt(e.target.value);
  $('#volume-display').text(value);
  backgroundMusic.volume = value / 100;
  musicLastVolume = value / 100;
}
$(document).ready(function(){
  $('#volume').change(handleVolumeUpdate);
});

//Mutes bgMusic
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

const hide = (el) => {
  el.addClass('hide');
}

const show = (el) => {
  el.removeClass('hide');
}
//Open the Game Panel
const openGame = () => {
  hide($('#startScreen'));
  show($('#gameScreen'));
};


//Runs the code
$("#play-button").click(useMusic)

$('#instructions-button').click(openInstructions);
$('#returnButton').click(closeInstructions);

$('#play-button').click(openMenu);
$('#return-button').click(closeMenu);

$('#settings-button').click(openSettings);
$('#backtoMenu').click(closeSettings);

$('#soundButton').click(openSoundMenu);
$('#returntoMenu').click(closeSoundMenu);

$('#newgameButton').click(openGame);

$('#muteSound').click(toggleMuteMusic);

