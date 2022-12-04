/*
title => 0
game => 1
options => 2
about => 3
*/
let clickAnywhere = true;
let stateKey = "intro";
let bgm = "";
let hoverFx = "";
let clickFx = "";
let winFx = "";
let gameTimer = "";
let timeAccum = "";
let timeText = "";

//idk why tiles: new Array(Math.pow(this.gameDim, 2)) doesn't work when gameDim is a property...
//error: array length is invalid...
let gameDim = 4;
let board = {
  //tiles in game
  tiles: new Array(Math.pow(gameDim, 2)),

  //tiles index starts at 0 and ends at gameDim^2 - 1, length = gameDim^2
  tileBool: new Array(Math.pow(gameDim, 2)),

  //grid layout element
  gridLayout: document.getElementById("gridWrapper"),

  numOfMoves: 0,

  startId: "",

  createBoard: function () {
    //grid layout for nxn where 2 < n < 9
    this.gridLayout.style.gridTemplateRows =
      "repeat(" +
      gameDim +
      "," +
      (45 - (gameDim + 1) * (-0.1 * gameDim + 1.28 + 0.4)) / gameDim +
      "vh)";
    this.gridLayout.style.gridTemplateColumns =
      "repeat(" +
      gameDim +
      "," +
      (45 - (gameDim + 1) * (-0.1 * gameDim + 1.28 + 0.4)) / gameDim +
      "vh)";

    //we use the function y = -1/10x + 1.28 + 4/10 to keep the grid gap aspect ratio the same
    this.gridLayout.style.gridGap = -0.1 * gameDim + 1.28 + 0.4 + "vh";

    //creates tiles in the game in html (all div, class="a_i")
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      this.tiles[i] = document.createElement("div");
      this.tiles[i].className = "a" + (i + 1);
      document.getElementById("gridWrapper").appendChild(this.tiles[i]);
    }

    //we use the function y = (4/100)*4/x to keet the border-radius aspect ratio the same
    document.getElementById("gridWrapper").style.borderRadius =
      (0.04 * 45 * 4) / gameDim + "vh";

    //sets the style for the tiles as they appear with css
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      //we use the function y = -1/15x + 1.28 + 4/15 to keep the shadow aspect ratio the same
      this.tiles[i].style.borderRadius = (0.04 * 45 * 4) / gameDim + "vh";
      this.tiles[i].style.boxShadow =
        -0.07 * gameDim +
        0.67 +
        0.27 +
        "vh " +
        (-0.07 * gameDim + 0.43 + 0.27) +
        "vh " +
        "rgb(0, 0, 0, 0.50)";
      this.tiles[i].style.cursor = "pointer";
    }

    //shuffles the board at the start of the game
    this.shuffle();

    document.getElementById("boardIdDesk").innerHTML =
      "ゲームID: " + this.generateId();
    document.getElementById("boardIdMobile").innerHTML =
      "ゲームID: " + this.generateId();

    //the lines below allow us to change user hover states for the tiles
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      //detects for when mouse enters a tile
      this.tiles[i].addEventListener("mouseenter", () =>
        this.hoverTileEnter(i)
      );

      //detects for when mouse leaves a tile
      this.tiles[i].addEventListener("mouseleave", () =>
        this.hoverTileLeave(i)
      );

      //detects for a click on one of the tiles
      this.tiles[i].addEventListener("click", () => this.switchRowAndColumn(i));
    }
  },

  deleteBoard: function () {
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      this.tiles[i].remove();
    }
  },

  shuffle: function () {
    const inArr = new Array(Math.pow(gameDim, 2));
    const outArr = [];

    //initially set all values in input array to false
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      inArr[i] = false;
    }

    //following loop waits until gameDim^2/2 distinct numbers (half the total) are chosen
    while (outArr.length < Math.pow(gameDim, 2) / 2) {
      let i = Math.floor(Math.random() * Math.pow(gameDim, 2));

      if (inArr[i] === false) {
        inArr[i] = true;
        outArr.push(i + 1);
      }
    }

    //sets the color for each tile
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      if (outArr.indexOf(i + 1) !== -1) {
        //light blue
        this.tiles[i].style.backgroundColor = "#C5FFFF";
        this.tileBool[i] = true;
      } else {
        //green
        this.tiles[i].style.backgroundColor = "#43FFF4";
        this.tileBool[i] = false;
      }
    }
  },

  generateId: function () {
    let binaryIDString = "";
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      if (this.tileBool[i] === true) {
        binaryIDString = binaryIDString + "1";
      } else {
        binaryIDString = binaryIDString + "0";
      }
    }

    //code below is used to convert number bases of extremely large numbers
    function parseBigInt(bigint, base) {
      //convert bigint string to array of digit values
      for (var values = [], i = 0; i < bigint.length; i++) {
        values[i] = parseInt(bigint.charAt(i), base);
      }
      return values;
    }

    function formatBigInt(values, base) {
      //convert array of digit values to bigint string
      for (var bigint = "", i = 0; i < values.length; i++) {
        bigint += values[i].toString(base);
      }
      return bigint;
    }

    function convertBase(bigint, inputBase, outputBase) {
      //takes a bigint string and converts to different base
      let inputValues = parseBigInt(bigint, inputBase),
        outputValues = [],
        remainder,
        len = inputValues.length,
        pos = 0,
        i;
      while (pos < len) {
        remainder = 0;
        for (i = pos; i < len; i++) {
          remainder = inputValues[i] + remainder * inputBase;
          inputValues[i] = Math.floor(remainder / outputBase);
          remainder -= inputValues[i] * outputBase;
          if (inputValues[i] == 0 && i == pos) {
            pos++;
          }
        }
        outputValues.push(remainder);
      }
      outputValues.reverse();
      return formatBigInt(outputValues, outputBase);
    }

    //convert largeNumber from base 2 to base 32
    let startId = convertBase(binaryIDString, 2, 32) + "-" + gameDim;
    this.startId = startId;
    return startId;
  },

  //change tile color when cursor enters a tile
  hoverTileEnter: function (i) {
    //new audio object must be made each time if we don't want delays
    let hoverFx = new Audio("./assets/audio/mouse_hover.mp3");
    hoverFx.volume = sfxSlider.value / 100;
    hoverFx.play();

    //hover over tiles
    if (this.tiles[i].style.backgroundColor === "rgb(197, 255, 255)") {
      //enter light blue
      this.tiles[i].style.backgroundColor = "#9AE8E8";
    } else {
      //enter green
      this.tiles[i].style.backgroundColor = "#32D2C9";
    }
  },

  //change tile color when cursor leaves a tile
  hoverTileLeave: function (i) {
    if (this.tiles[i].style.backgroundColor === "rgb(154, 232, 232)") {
      //leave blue
      this.tiles[i].style.backgroundColor = "#C5FFFF";
    } else {
      //leave green
      this.tiles[i].style.backgroundColor = "#43FFF4";
    }
  },

  //switches the row and column parity when the player makes a move
  switchRowAndColumn: function (j) {
    clickElement();
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      if (Math.ceil((i + 1) / gameDim) === Math.ceil((j + 1) / gameDim)) {
        this.switchColor(i);
      } else if ((i + 1) % gameDim === (j + 1) % gameDim) {
        this.switchColor(i);
      }
    }
    this.numOfMoves++;
    document.getElementById("numMoves").innerHTML = "手数: " + this.numOfMoves;
    this.detectWin();
  },

  //simply switches the color of a tile
  switchColor: function (i) {
    if (this.tiles[i].style.backgroundColor === "rgb(197, 255, 255)") {
      //light blue to green (normal)
      this.tiles[i].style.animation = "selectFlashBlue 0.4s";
      this.tiles[i].style.backgroundColor = "#43FFF4";
    } else if (this.tiles[i].style.backgroundColor === "rgb(67, 255, 244)") {
      //green to light blue (normal)
      this.tiles[i].style.animation = "selectFlashGreen 0.4s";
      this.tiles[i].style.backgroundColor = "#C5FFFF";
    } else if (this.tiles[i].style.backgroundColor === "rgb(154, 232, 232)") {
      //light blue to green (hover)
      this.tiles[i].style.animation = "selectFlashBlueHover 0.4s";
      this.tiles[i].style.backgroundColor = "#32D2C9";
    } else {
      //green to light blue (hover)
      this.tiles[i].style.animation = "selectFlashGreenHover 0.4s";
      this.tiles[i].style.backgroundColor = "#9AE8E8";
    }
    this.tileBool[i] = !this.tileBool[i];
  },

  //detects for the win condition
  detectWin: function () {
    let trueCount = 0;
    let falseCount = 0;

    //count green/light blue tile numbers
    for (let i = 1; i < Math.pow(gameDim, 2) + 1; i++) {
      if (this.tileBool[i - 1] === true) {
        trueCount++;
      } else {
        falseCount++;
      }
    }
    //when it reaches max num, the player wins
    if (
      trueCount === Math.pow(gameDim, 2) ||
      falseCount === Math.pow(gameDim, 2)
    ) {
      const winFx = new Audio("./assets/audio/puzzle_win.mp3");
      winFx.volume = sfxSlider.value / 100;
      winFx.play();

      bgm.pause();
      bgm.currentTime = 0;
      clearInterval(gameTimer);
      document.getElementById("win_stats").innerHTML =
        'ゲームID<color style="color: #43FFF4; font-weight: bold">' +
        this.startId +
        '</color>からスタートし、<color style="color: #43FFF4; font-weight: bold">' +
        timeText +
        '</color>かかり、<color style="color: #43FFF4; font-weight: bold">' +
        this.numOfMoves +
        "手</color>で解きました!";
      navigate("game", "win");
    }
  },
};

//click before titlescreen with animation
let intro = document.getElementById("intro");
intro.addEventListener("click", () => {
  if (clickAnywhere === true) {
    clickAnywhere = false;
    snowEffect = 0;
    document.querySelector(".pressAny").style.animation = "fadeOut 0.5s ease";
    document.querySelector(".pressAny").style.opacity = "0";
    setTimeout(function () {
      if (window.innerWidth < 740) {
        document.querySelector(".ts_title").style.animation =
          "slideUpMobile 0.7s ease";
      } else {
        document.querySelector(".ts_title").style.animation =
          "slideUpDesk 0.7s ease";
      }
      document.querySelector(".pressAny").style.display = "none";
      document.querySelector(".ts_options").style.display = "grid";
      document.querySelector(".ts_options").style.animation =
        "fadeIn 1.5s ease";
      document.querySelector(".ts_options").style.opacity = "1";
    }, 500);
  }
});

//options in titlescreen
let titleOpts = new Array(4);
for (let i = 0; i < 4; i++) {
  titleOpts[i] = document.getElementById(`ts_opt${i + 1}`);
  titleOpts[i].addEventListener("mouseenter", () => hoverElement());
  titleOpts[i].addEventListener("click", () => {
    clickElement();
    navigate("intro", stateNumToKey(i + 1));
    if (i === 0) {
      beforeOptKey = "game";
      //reset game
      //starts a stopwatch for each player solve
      timeAccum = 0;
      gameTimer = setInterval(function () {
        timeAccum++;
        timeText =
          Math.floor(timeAccum / 360000).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }) +
          ":" +
          Math.floor(timeAccum / 6000).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }) +
          ":" +
          (Math.floor(timeAccum / 100) % 60).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }) +
          "." +
          (timeAccum % 100).toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          });
        document.getElementById("stopWatch").innerHTML =
          "経過時間: " + timeText;
      }, 10);
      //remove preexisting boards
      board.deleteBoard();
      document.getElementById("stopWatch").innerHTML = "経過時間: 00:00:00";
      board.numOfMoves = 0;
      document.getElementById("numMoves").innerHTML = "手数: 0";
      board.createBoard();
    }
  });
}

//initialize 4x4 game board
board.createBoard();

//mouse hover sound effect on html "button" elements
function hoverElement() {
  //new audio object must be made each time if we don't want delays
  let hoverFx = new Audio("./assets/audio/mouse_hover.mp3");
  //if things are undefined when using getElementById, just use querySelector
  hoverFx.volume = sfxSlider.value / 100;
  hoverFx.play();
}

//mouse click sound effect on html "button" elements
function clickElement() {
  //new audio object must be made each time if we don't want delays
  let clickFx = new Audio("./assets/audio/color_change.mp3");
  //if things are undefined when using getElementById, just use querySelector
  clickFx.volume = sfxSlider.value / 100;
  clickFx.play();
}

//bgm slider
let bgmSlider = document.querySelector(".bgmSlider");
bgmSlider.addEventListener("mouseenter", () => hoverElement());
bgmSlider.oninput = function () {
  bgm.volume = bgmSlider.value / 100;
  //slider.value must be evaluated to a string!
  if (bgmSlider.value === "0") {
    document.getElementById("triggerBGM_icon").src =
      "./assets/icons/bgmMute_icon.svg";
  } else {
    document.getElementById("triggerBGM_icon").src =
      "./assets/icons/bgm_icon.svg";
  }
};

//sfx slider
let sfxSlider = document.querySelector(".sfxSlider");
sfxSlider.addEventListener("mouseenter", () => hoverElement());
sfxSlider.oninput = function () {
  //slider.value must be evaluated to a string
  if (sfxSlider.value === "0") {
    document.getElementById("triggerSFX_icon").src =
      "./assets/icons/sfxMute_icon.svg";
  } else {
    document.getElementById("triggerSFX_icon").src =
      "./assets/icons/sfx_icon.svg";
  }
};

//process game board input
let boardChanged = false;
let optGameDim = new Array(6);
for (let i = 0; i < 6; i++) {
  optGameDim[i] = document.getElementById("gameDim" + (i + 3));
  optGameDim[i].addEventListener("mouseenter", () => hoverElement());
  optGameDim[i].addEventListener("click", () => {
    optGameDim[i].style.color = "#307483";
    optGameDim[i].style.backgroundColor = "#43FFF4";
    for (let j = 0; j < 6; j++) {
      if (i !== j) {
        optGameDim[j].style.backgroundColor = "#307483";
        optGameDim[j].style.color = "#C5FFFF";
      }
    }
    clickElement();
    board.deleteBoard();
    boardChanged = true;
    board.numOfMoves = 0;
    gameDim = i + 3;
    board.createBoard();
  });
}

//function that converts the state number to its keyword
function stateNumToKey(i) {
  switch (i) {
    case 0:
      return "intro";
    case 1:
      return "game";
    case 2:
      return "options";
    case 3:
      return "about";
    case 4:
      return "credits";
    case 5:
      return "win";
  }
}

//function to navigate between different screens/states
function navigate(from, to) {
  //console.log("we are going from " + from + " screen to " + to + " screen");

  //CSS keeps its properties instead of nullifying it... so when we stop using it, we should "none" that property
  document.querySelector(".intro").style.animation = "none";

  //transition away from
  //main execution thread is not affected even if there is a setTimeout function
  document.querySelector("." + from).style.opacity = "1";
  document.querySelector("." + from).style.display = "flex";
  document.querySelector("." + to).style.opacity = "1";
  document.querySelector("." + to).style.display = "flex";

  if (from === "intro" && to === "game") {
    document.querySelector("." + from).style.animation = "fadeOut 0.5s ease";
    setTimeout(function () {
      document.querySelector("." + from).style.display = "none";
      document.querySelector("." + from).style.opacity = "0";
    }, 450);
  } else if (from === "game" && to === "win") {
    document.querySelector("." + to).style.animation = "fadeIn 0.5s ease";
    setTimeout(function () {
      document.querySelector("." + from).style.display = "none";
      document.querySelector("." + from).style.opacity = "0";
    }, 450);
  } else {
    document.querySelector("." + from).style.display = "none";
    document.querySelector("." + from).style.opacity = "0";
  }

  //update state key
  stateKey = to;

  let snowKey = "";
  switch (to) {
    case "intro":
      snowKey = "Main";
      break;
    case "game":
      snowKey = "Game";
      break;
    case "options":
      snowKey = "Opt";
      break;
    case "about":
      snowKey = "Abt";
      break;
    case "credits":
      snowKey = "Cred";
      break;
    case "win":
      snowKey = "Win";
      break;
  }

  //remove weird flash bug
  if (beforeOptKey === "game") {
    for (let i = 0; i < Math.pow(gameDim, 2); i++) {
      board.tiles[i].style.animation = "none";
    }
  }

  addSnow(snowKey);

  //only play bgm when getting to the game itself
  if (from === "intro" && to === "game") {
    //play bg music
    bgm = new Audio("./assets/audio/color_switcher.mp3");
    bgm.volume = bgmSlider.value / 100;
    bgm.addEventListener(
      "ended",
      function () {
        this.currentTime = 0;
        this.play();
      },
      false
    );
    bgm.play();
  }
  //console.log(stateKey);
}

//THIS CAN ALL BE REPACED BY ONE FUNCTION..........................................................................
let beforeOptKey = "intro";

//change icon sizes based on default window size
document.getElementById("opt_icon").style.width =
  100 * (window.innerHeight / 937) + "%";
document.getElementById("triggerBGM_icon").style.width =
  100 * (window.innerHeight / 937) + "%";
document.getElementById("triggerSFX_icon").style.width =
  100 * (window.innerHeight / 937) + "%";
document.getElementById("triggerStats_icon").style.width =
  100 * (window.innerHeight / 937) + "%";

//retain aspect ratio of options icon upon resizing window
//onresize is called when the window is resized
window.onresize = function () {
  document.getElementById("opt_icon").style.width =
    100 * (window.innerHeight / 937) + "%";
  document.getElementById("triggerBGM_icon").style.width =
    100 * (window.innerHeight / 937) + "%";
  document.getElementById("triggerSFX_icon").style.width =
    100 * (window.innerHeight / 937) + "%";
  document.getElementById("triggerStats_icon").style.width =
    100 * (window.innerHeight / 937) + "%";
  //document.getElementById("cred_icon").style.width = 100*(window.innerHeight/937) + "%";

  if (window.innerWidth <= 740 && statsOn === true) {
    document.getElementById("boardIdMobile").style.display = "inline-block";
  } else {
    document.getElementById("boardIdMobile").style.display = "none";
  }
};

//"return" button in the options menu
let returnFromOpt = document.getElementById("opt_return");
returnFromOpt.addEventListener("mouseenter", () => hoverElement());
returnFromOpt.addEventListener("click", () => {
  clickElement();
  //go back to wherever the user was before
  if (beforeOptKey === "game" && boardChanged === true) {
    timeAccum = 0;
    board.numOfMoves = 0;
    document.getElementById("stopWatch").innerHTML = "経過時間: 00:00:00";
    document.getElementById("numMoves").innerHTML = "手数: 0";
  }
  boardChanged = false;
  navigate("options", beforeOptKey);
});

//"return" button in about
let returnFromAbt = document.getElementById("abt_return");
returnFromAbt.addEventListener("mouseenter", () => hoverElement());
returnFromAbt.addEventListener("click", () => {
  clickElement();
  //go back to wherever the user was before
  navigate("about", "intro");
  beforeOptKey = "intro";
});

//"return" button in credits
let returnFromCred = document.getElementById("cred_return");
returnFromCred.addEventListener("mouseenter", () => hoverElement());
returnFromCred.addEventListener("click", () => {
  clickElement();
  //go back to wherever the user was before
  navigate("credits", "intro");
  beforeOptKey = "intro";
});

//"return" button in game
let returnFromGame = document.getElementById("game_return");
returnFromGame.addEventListener("mouseenter", () => hoverElement());
returnFromGame.addEventListener("click", () => {
  clickElement();
  //reset all game data
  bgm.pause();
  bgm.currentTime = 0;
  //go back to wherever the user was before
  navigate("game", "intro");
  beforeOptKey = "intro";
  clearInterval(gameTimer);
});

//"return" button in win screen
let returnFromWin = document.getElementById("win_return");
returnFromWin.addEventListener("mouseenter", () => hoverElement());
returnFromWin.addEventListener("click", () => {
  clickElement();
  //go back to wherever the user was before
  navigate("win", "intro");
  beforeOptKey = "intro";
});

//what the options icon does
let gameToOptions = document.getElementById("game_to_option");
gameToOptions.addEventListener("mouseenter", () => hoverElement());
gameToOptions.addEventListener("click", () => {
  clickElement();
  //go back to wherever the user was before
  navigate("game", "options");
  beforeOptKey = "game";
});

//what the bgm icon does
let triggerBGM = document.getElementById("triggerBGM");
let prevBGMVolume = 0.5;
triggerBGM.addEventListener("mouseenter", () => hoverElement());
triggerBGM.addEventListener("click", () => {
  clickElement();
  if (bgmSlider.value === "0") {
    document.getElementById("triggerBGM_icon").src =
      "./assets/icons/bgm_icon.svg";
    bgmSlider.value = prevBGMVolume * 100;
    bgm.volume = prevBGMVolume;
  } else {
    document.getElementById("triggerBGM_icon").src =
      "./assets/icons/bgmMute_icon.svg";
    prevBGMVolume = bgmSlider.value / 100;
    bgmSlider.value = 0;
    bgm.volume = 0;
  }
});

//what the fx sound icon does
let triggerSFX = document.getElementById("triggerSFX");
let prevSFXVolume = 0.5;
triggerSFX.addEventListener("mouseenter", () => hoverElement());
triggerSFX.addEventListener("click", () => {
  clickElement();
  if (sfxSlider.value === "0") {
    document.getElementById("triggerSFX_icon").src =
      "./assets/icons/sfx_icon.svg";
    sfxSlider.value = prevSFXVolume * 100;
    hoverFx.volume = prevSFXVolume;
    clickFx.volume = prevSFXVolume;
    winFx.volume = prevSFXVolume;
  } else {
    document.getElementById("triggerSFX_icon").src =
      "./assets/icons/sfxMute_icon.svg";
    prevSFXVolume = sfxSlider.value / 100;
    sfxSlider.value = 0;
    hoverFx.volume = 0;
    clickFx.volume = 0;
    winFx.volume = 0;
  }
});

//what the stat icon does
let triggerStats = document.getElementById("triggerStats");
let statsOn = false;
triggerStats.addEventListener("mouseenter", () => hoverElement());
triggerStats.addEventListener("click", () => {
  clickElement();
  if (statsOn === false) {
    document.getElementById("triggerStats_icon").src =
      "./assets/icons/statsOn_icon.svg";
    if (window.innerWidth <= 740) {
      document.getElementById("boardIdMobile").style.display = "inline-block";
    } else {
      document.getElementById("boardIdMobile").style.display = "none";
    }
    document.getElementById("boardIdDesk").style.display = "inline-block";
    document.getElementById("numMoves").style.display = "inline-block";
    document.getElementById("stopWatch").style.display = "inline-block";
    statsOn = true;
  } else {
    document.getElementById("triggerStats_icon").src =
      "./assets/icons/statsOff_icon.svg";
    document.getElementById("boardIdMobile").style.display = "none";
    document.getElementById("boardIdDesk").style.display = "none";
    document.getElementById("numMoves").style.display = "none";
    document.getElementById("stopWatch").style.display = "none";
    statsOn = false;
  }
});

//snow background animation
let snowEffect = document.getElementById("snowEffectMain");
let context = snowEffect.getContext("2d");
const particlesOnScreen = 40;
let particlesArray = [];
let w, h;
w = snowEffect.width = window.innerWidth;
h = snowEffect.height = window.innerHeight;

function random(min, max) {
  return min + Math.random() * (max - min + 1);
}

function clientResize(ev) {
  w = snowEffect.width = window.innerWidth;
  h = snowEffect.height = window.innerHeight;
}

window.addEventListener("resize", clientResize);

function createParticles() {
  for (let i = 0; i < particlesOnScreen; i++) {
    particlesArray.push({
      x: Math.random() * w,
      y: Math.random() * h,
      opacity: Math.random() / 2.5,
      speedX: random(0, 30),
      speedY: random(7, 15),
      radius: random(0.5, 2.2),
    });
  }
}

function drawParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    let gradient = context.createRadialGradient(
      particlesArray[i].x,
      particlesArray[i].y,
      0,
      particlesArray[i].x,
      particlesArray[i].y,
      particlesArray[i].radius
    );
    gradient.addColorStop(
      0,
      "rgba(255, 255, 255," + particlesArray[i].opacity + ")"
    );
    gradient.addColorStop(
      0.8,
      "rgba(210, 236, 242," + particlesArray[i].opacity + ")"
    );
    gradient.addColorStop(
      1,
      "rgba(237, 247, 249," + particlesArray[i].opacity + ")"
    );
    context.beginPath();
    context.arc(
      particlesArray[i].x,
      particlesArray[i].y,
      particlesArray[i].radius,
      0,
      Math.PI * 2,
      false
    );
    context.fillStyle = gradient;
    context.fill();
  }
}

function moveParticles() {
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].x += particlesArray[i].speedX;
    particlesArray[i].y += particlesArray[i].speedY;

    if (particlesArray[i].y > h) {
      particlesArray[i].x = Math.random() * w * 1.5;
      particlesArray[i].y = -50;
    }
  }
}

function updatePartAnim() {
  context.clearRect(0, 0, w, h);
  drawParticles();
  moveParticles();
}

let snowInterval = setInterval(updatePartAnim, 50);
createParticles();

function addSnow(key) {
  snowEffect = document.getElementById("snowEffect" + key);
  w = snowEffect.width = window.innerWidth;
  h = snowEffect.height = window.innerHeight;
  context = snowEffect.getContext("2d");
  clearInterval(snowInterval);
  snowInterval = setInterval(updatePartAnim, 50);
}
