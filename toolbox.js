class JSTools {

  /**
   * Remove the given item from the array.
   * Must match in a simple way.
   * @param arr
   * @param val
   */
  static removeFromArray = (arr, val) => {
    let index = arr.indexOf(val);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  }

  /**
   * https://stackoverflow.com/a/37319954
   * @param arr The array to be filtered
   * @param cb The callback function (true = keep, false = delete)
   * @param thisArg Optional indicator of 'this' to be used in in cb??
   * @returns {*}
   */
  static filterArrayInPlace = (arr, cb, thisArg) => {
      let j = 0;

      arr.forEach((e, i) => {
        if (cb.call(thisArg, e, i, arr)) {
          if (i !== j) arr[j] = e;
          j++;
        }
      });

      arr.length = j;
      return arr;
  }

  /**
   * Return the given percentage of n.
   * e.g. providing 50, 4 returns 2.
   * @param percent
   * @param n
   * @returns {number}
   */
  static proportion(percent, n) {
    return Math.round(percent / 100 * n);
  }

  /**
   * Return 1 for true or 0 for false.
   * @param bool
   * @returns {number}
   */
  static boolToInt = (bool) => {
    return bool === true ? 1 : 0;
  }

  /**
   * Return the given word with œ replaced by oe.
   * TODO This appears to be a specialized function that I kind of copied in here.
   * @param w
   * @returns {string}
   */
  static normalizeWord = w => {
    /* sadge */
    return w.toLowerCase().replace('œ', 'oe');
  }

  /**
   * Return the given word with accents replaced by unaccented characters.
   * @param w
   * @returns {string}
   */
  static asciiizeWord = w => {
    return JSTools.normalizeWord(w).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  /**
   * https://stackoverflow.com/a/55292366
   *
   * Return the given string with the given character(s) trimmed from
   * the start and/or the end.
   * @param str
   * @param chars Treated as a set of characters not to remove, not a block.
   * @param fromStart If true, trim from the start. Default true.
   * @param fromEnd If true, trim fromm the end. Default true.
   * @returns {string|*}
   */
  static trimChars(str, chars, fromStart, fromEnd) {
    if (typeof fromStart === undefined) {
      fromStart = true;
    }

    if (typeof fromEnd === undefined) {
      fromEnd = true;
    }

    var start = 0,
        end = str.length;

    if (fromStart) {
      while(start < end && chars.indexOf(str[start]) >= 0)
        ++start;
    }

    if (fromEnd) {
      while(end > start && chars.indexOf(str[end - 1]) >= 0)
        --end;
    }

    return (start > 0 || end < str.length) ? str.substring(start, end) : str;
  }

  /**
   * Rename the keys of the given object using the given remapping.
   * e.g. o = {'d': 1} ; remapping = {'o': 'old'};
   * changes o in place to {'old': 1}.
   * @param o
   * @param remapping
   */
  static renameObjectKeys = (o, remapping) => {
    for (const [oldK, newK] of Object.entries(remapping)) {
      //o[newK] = o[oldK];

      if (oldK in o) {
        Object.defineProperty(o, newK, Object.getOwnPropertyDescriptor(o, oldK));

        delete o[oldK];
      }
    }
  };

  /**
   * Reverse the key/value pairs in the given object in place.
   * Duplicate values overwrite previous keys.
   * @param o
   * @returns {{}}
   */
  static swapObjectKeys = (o) => {
    return Object.keys(o).reduce((o2, key) => {
      o2[o[key]] = key;
      return o2;
    }, {});
  };
}

class DOMTools {
  static rotate(el, degrees, seconds) {
    if (typeof seconds === 'undefined') seconds = 0.5;

    let ease = `all ${seconds}s ease-in-out`;
    el.css('-webkit-transition', ease);
    el.css('-moz-transition', ease);
    el.css('-o-transition', ease);
    el.css('transition', ease);

    let rotate = `rotate(${degrees}deg)`;
    el.css('webkitTransform', rotate);
    el.css('mozTransform', rotate);
    el.css('msTransform', rotate);
    el.css('oTransform', rotate);
    el.css('transform', rotate);
  }

  static getTextareaLines = (el) => {

    let lines = [];
    for (let line of el.val().split(/\n/)) {
      if (line.trim() !== "") {
        lines.push(line);
      }
    }
    return lines;
  }

  static setTextareaLines = (el, items) => {
    el.val(items.join("\n"));
  }

  static disableInput(disable) {
    $("input, button").prop("disabled", disable);
    DOMTools.waitCursor(disable);
  }

  static toggleDisableInput(ms) {
    let states = [];
    $("input, button").each(function (i, v) {
      states.push($(v).prop('disabled'));
    });

    $("input, button").prop("disabled", true);
    DOMTools.waitCursor(true);

    setTimeout(() => {
      $("input, button").prop('disabled', function (i, v) {
        return states[i];
      });
      DOMTools.waitCursor(false);
    }, ms);
  }

  static waitCursor(on) {
    if (on)
      $("#app, input, button, span, div, label").addClass('waitCursor');
    else {
      $("#app, input, button, span, div, label").removeClass('waitCursor');
    }
  }

  static getTopLeft(el, heightRequirement, widthRequirement) {
    let rect = el[0].getBoundingClientRect();

    let top = ((window.innerHeight - rect.bottom) < heightRequirement) ? rect.bottom - heightRequirement : rect.top;
    let left = ((window.innerWidth - rect.right) < widthRequirement) ? rect.right - widthRequirement : rect.left;

    top += window.scrollY;
    left += window.scrollX;
    return {'top': top, 'left': left};
  }
}

class Random {
  /**
   * Randomly shuffle the order of the given array.
   * Shuffles in place by default. If copy is supplied and is ture,
   * the original array is untouched and a copy is shuffled instead.
   * In either case, return the modified array.
   * @param arr
   * @param copy
   * @returns {*}
   */
  static shuffle(arr, copy) {

    if (!! copy) {
      arr = [...arr];
    }

    // Durstenfeld shuffle stackoverflow.com/a/12646864/5228348
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Random.integer(i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // for good measure
    return arr;
  }

  /**
   * Return a random integer between min and max, inclusive.
   * If only parameter is given, it is treated as max, with a min of 0.
   * @param min
   * @param max
   * @returns {number}
   */
  static integer(min, max) {
    if (typeof max === 'undefined') {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * Flip a "coin" that has the given chance of being true.
   * If only one parameter is given, it's interpreted as a percentage, e.g. 50.
   * If both are given, they're interpreted as a ratio, e.g. 1 : 2 = 50.
   *
   * Chances less than or equal to 0% always return false,
   * and greater than or equal to 100% always return true.
   * @param from
   * @param to
   */
  static chance(from, to) {
    if (typeof to === 'undefined') {
      to = 100;
    }

    let pct = from / to * 100;
    let roll = Random.integer(1, 100);
    return roll <= pct;
  }

  /**
   * Return a random item from the given array.
   * If pop is true, also popo it from the array. Default false.
   * @param arr
   * @param pop
   * @returns {any[]|*}
   */
  static choice(arr, pop) {
    let i = Math.floor(Math.random() * arr.length);
    if (!! pop) {
      return arr.splice(i, 1);
    } else {
      return arr[i];
    }
  }

  /**
   * Return a random hex colour code. Min and max are average brightness
   * levels. e.g. with a max of 128, the colour will be at most half
   * as bright as it could be.
   * @param min
   * @param max
   * @returns {number[]}
   */
  static colour(min, max) {

    if ((typeof min === "undefined") || (min < 0)) {
      min = 0;
    }

    if ((typeof max === "undefined") || (max > 255)) {
      max = 255;
    }

    let r = Random.random(min, max);
    let g = Random.random(min, max);
    let b = Random.random(min, max);

    return [r, g, b];
  }

  // Alias for backwards compatibility
  static randomChoice(arr, pop) {
    return Random.choice(arr, pop);
  }

  // Alias for backwards compatibility
  static random(min, max) {
    return Random.integer(min, max);
  }

  // Alias for backwards compatibility
  static randomColour(min, max) {
    return Random.colour(min, max);
  }
}

class Copy {
  static ping = (notif, msBeforeFade = 1500, msBeforeHide = 2500) => {
    notif.removeClass("hide");
    notif.removeClass("fade");
    notif.removeClass("pinged");

    notif.addClass("pinged");
    setTimeout(() => {
      notif.removeClass("pinged");
      notif.addClass("fade");
    }, msBeforeFade);

    setTimeout(() => {
      notif.removeClass("fade");
      notif.addClass("hide");
    }, msBeforeHide);
  }

  static pingButton = (button, msBeforeFade = 1500, msBeforeHide = 2500) => {
    let parent = button.parent();
    let parentId = parent.attr("id");

    let pingId = `${parentId}-ping`;
    parent.append(`<div id='${pingId}' class="buttonPing">Copied!</div>`);

    let ping = $(`#${pingId}`);
    ping.css("width", button.css("width"));
    ping.css("height", button.css("height"));
    ping.addClass("pinged");

    button.addClass("hide");

    setTimeout(() => {
      ping.removeClass("pinged");
      ping.addClass("fade");
    }, msBeforeFade);

    setTimeout(() => {
      ping.remove();
      button.removeClass("hide");
    }, msBeforeHide);
  };

  // https://www.30secondsofcode.org/js/s/copy-to-clipboard
  // TODO Replace with https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
  static writeToClipboard = data => {
    const el = document.createElement("textarea");
    el.value = data;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    const selected =
      document.getSelection().rangeCount > 0
        ? document.getSelection().getRangeAt(0)
        : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
  };

  /*
  Optionally supply existing toast
  A reference to one will be returned either way
   */
  static toast = (toast, value, noticeText) => {

    if (typeof $.toast === 'undefined') {
      console.log('jQuery toast plugin not loaded; aborting copy')
      return;
    }

    if (value.trim().length === 0) {
      console.log('No value to copy; aborting copy')
      return;
    }

    if (typeof noticeText === 'undefined') {
      noticeText = 'Copied!'
    }

    Copy.writeToClipboard(value);

    if (!! toast) {
      toast.reset();
    }

    toast = $.toast({
      text: noticeText,
      icon: 'success',
      hideAfter: 2000,
      showHideTransition: 'slide',
      position: 'mid-center',
      loaderBg: '#ffffff'
    });

    return toast;
  };

}

class Stage {
  constructor() {
    this.scenes = {};
    this.active = null;
    this.default = null;
  }

  /**
   * Add a ready-made scene to this stage, keying it by name.
   * @param s
   */
  addScene = (s) => {
    this.scenes[s.name] = s;
  };

  /**
   * Make and add a scene given a name, jQ panel selector, and jQ toggle selector (optional).
   *
   * @param name
   * @param panelSelector
   * @param toggleSelector
   */
  createScene = (name, panelSelector, toggleSelector) => {
    let s = new Scene(name, this, panelSelector, toggleSelector);
    this.addScene(s);
  }

  /**
   * Make and add a list of scenes using an array of objects with the scene data keys and values.
   *
   * @param sceneData
   */
  createScenes = (sceneData) => {
    for (let scene of sceneData) {
      this.createScene(scene.name, scene.panelSelector, scene.toggleSelector);
    }
  }

  setDefault = (sid) => {
    this.default = sid;
  };

  showing = (sid) => {
    return this.active === sid;
  };

  hiding = (sid) => {
    return !this.showing(sid);
  };

  toggle = (sid) => {
    if (this.showing(sid)) {
      this.hide(sid);
    } else {
      this.show(sid);
    }
  };

  show = (sid) => {
    this.hideAll();
    this.scenes[sid].show();
    this.active = sid;
  };

  hide = (sid) => {
    this.scenes[sid].hide();

    if (this.default !== null) {
      this.show(this.default);
    } else {
      this.active = null;
    }
  };

  hideAll = () => {
    for (let s of Object.values(this.scenes)) {
      s.hide();
    }
  };

}

class Scene {
  name;
  stage;
  panelSelector;
  toggleSelector;

  constructor(name, stage, panelSelector, toggleSelector) {
    this.name = name;
    this.stage = stage;

    this.panelSelector = panelSelector;
    this.toggleSelector = toggleSelector;

    if (!! this.toggleSelector) {
      this.bindToggle();
    }
  }

  /**
   * Bind a toggle element's click event to toggle this scene.
   * Uses this Scene's selector by default, but can be manually supplied one.
   * @param toggleSelector
   */
  bindToggle = (toggleSelector) => {
    if (typeof toggleSelector === 'undefined') {
      toggleSelector = this.toggleSelector;
    }

    $(toggleSelector).click(() => {
      this.stage.toggle(this.name);
    });
  }

  toggle = () => {
    if ($(this.panelSelector).hasClass("hide")) {
      this.show();
    } else {
      this.hide();
    }
  };

  hide = () => {
    $(this.panelSelector).addClass("hide");
  };

  show = () => {
    $(this.panelSelector).removeClass("hide");
  };
}

class FontAwesome {
  static fa(key) {
    return `<i class="fas fa-${key}"></i>`;
  }
}

class Jukebox {
  /** @type object */ sounds;
  /** @type int */ savedVolume;
  /** @type boolean */ disabled;

  constructor() {
    this.sounds = {};
    this.savedVolume = 50;
    this.disabled = false;
    this.playing = null;
  }

  add(key, audio) {
    this.sounds[key] = audio;
    this.sounds[key].volume = this.savedVolume / 100;
  }

  addBySelector(key, selector) {
    this.add(key, $(selector)[0]);
  }

  addByElement(key, element) {
    this.add(key, element[0]);
  }

  addByURL(key, url) {
    let id = `jb-audio-${key}`;
    let element = `<audio id="${id}" src="${url}" style="display; none; visibility: hidden;" preload="auto"></audio>`;
    $('body').append(element);
    this.addBySelector(key, `#${id}`);
  }

  play(key) {
    if (!this.disabled) {
      this.sounds[key].play();
    }
  }

  pause(key) {
    if (!this.disabled) {
      this.sounds[key].pause();
    }
  }

  stop(key) {
    if (!this.disabled) {
      this.sounds[key].pause();
      this.sounds[key].currentTime = 0;
    }
  }

  disable(value) {
    this.disabled = value;
  }

  volume(value) {
    if (typeof value === 'undefined') {
      // get
      return this.savedVolume;

    } else {
      // set
      this.savedVolume = value;
      for (let k in this.sounds) {
        this.sounds[k].volume = this.savedVolume / 100;
      }
    }
  }
}
