const backgroundMusic = new Audio(
  "https://t.sawczak.com/misc_assets/ics-hosting/jc-001.mp3"
); // Music by Krzysztof Szymanski sourced from Pixaby

backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

//Open the load game screen
const openPlayMenu = () => {
  $('#playMenu').removeClass('hide');
  $('#welcomeMenu').addClass('hide');
}; 

const closePlayMenu = () => {
  $('#playMenu').addClass('hide');
  $('#welcomeMenu').removeClass('hide');
};

//Opens the menu with things such as settings and instructions 
const openHelpMenu = () => {
  $('#helpMenu').removeClass('hide');
  $('#welcomeMenu').addClass('hide');
};
const closeHelpMenu = () => {
  $('#helpMenu').addClass('hide');
  $('#welcomeMenu').removeClass('hide');
};

//Opens the instructions screen
const openInstructions = () => {
  $('#instructions').removeClass('hide');
  $('#helpMenu').addClass('hide');
};
const closeInstructions = () => {
  $('#instructions').addClass('hide');
  $('#helpMenu').removeClass('hide');
};

//Open the settings menu 
const openSettings = () => {
  $('#settings').removeClass('hide');
  $('#helpMenu').addClass('hide');
};
const closeSettings = () => {
  $('#settings').addClass('hide');
  $('#helpMenu').removeClass('hide');
};

//Open the Sound Menu 
const openSoundMenu = () => {
  $('#soundControl').removeClass('hide');
  $('#settings').addClass('hide');
};
const closeSoundMenu = () => {
  $('#soundControl').addClass('hide');
  $('#settings').removeClass('hide');
};

const useMusic = () => {
  console.log("Sound Succesfull");
  backgroundMusic.play();
};

//Controls the volume
$(document).ready(function(){
  var rangeSlider = function(){
      var slider = $('.range-slider'),
          range = $('.range-slider input[type="range"]'),
          value = $('.range-value');
      slider.each(function(){
          value.each(function(){
              var value = $(this).prev().attr('value');
              var max = $(this).prev().attr('max');
              $(this).html(value);
          });
          range.on('input', function(){
              $(this).next(value).html(this.value);
          });
      });
  };
  rangeSlider();
});

//Runs the code
$("#play-button").click(useMusic);

$('#menu-button').click(openHelpMenu);
$('#menu-close').click(closeHelpMenu);


$('#instructions-button').click(openInstructions);
$('#returnButton').click(closeInstructions);

$('#play-button').click(openPlayMenu);
$('#return-button').click(closePlayMenu);

$('#settings-button').click(openSettings);
$('#backtoMenu').click(closeSettings);

$('#soundButton').click(openSoundMenu);
$('#returntoMenu').click(closeSoundMenu);