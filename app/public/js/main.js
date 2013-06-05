var insts = [];

var MixPanel = {};

$.getJSON("http://james.local:3013/json/media.json",function(JSONObject, status, response){
  JSONObject.forEach(function(audioModel){
    var audio = new Audio;
    insts.push(Object.merge(audio,audioModel));
  });

  initializeMixPanel();
});

var initializeMixPanel = function()
{
  var defaultFadeDuration = 3;

  var millisecondsPerSecond = 1000.0;

  var isDefined = function(obj)
  {
    return !isUndefined(obj);
  }

  var isUndefined = function(obj)
  {
    return (typeof obj === 'undefined');
  }

  MixPanel.play = function()
  {
    insts.forEach(function(inst)
    {
      inst.play();
    });
  }

  MixPanel.pause = function()
  {
    insts.forEach(function(inst)
    {
      inst.pause();
    });
  }

  var sync = function(time)
  {
    if(typeof time === 'undefined')
    {
      time = currentTime();
    }
    else if(time > insts[0].duration)
    {
      time = insts[0].duration;
    }
    else if(time < 0)
    {
      time = 0;
    }
    insts.forEach(function(inst)
    {
      inst.currentTime = time;
    });
  }

  MixPanel.stop = function()
  {
    MixPanel.pause();
    sync(0);
  }

  var jump = 10;

  var currentTime = function()
  {
    return insts[0].currentTime;
  }

  MixPanel.quickBack = function()
  {
    var backTo = currentTime() - jump;
    sync(backTo);
  }

  MixPanel.quickForward = function()
  {
    var forwardTo = currentTime() + jump;
    sync(forwardTo);
  }

  var getTitleizedTitle = function(el, title)
  {
    return $(el).attr('title').titleize();
  }

  var volumate = function(inst, instVolume, shouldAnimate, fadeDuration)
  {
    if(isUndefined(fadeDuration))
    {
      fadeDuration = defaultFadeDuration;
    }

    var title = getTitleizedTitle(inst);
    var slider = idElTitled(title);
    var spans = spanElClassed(title);
    var instVolumeInHundredths = instVolume*100.0;

    if(shouldAnimate)
    {
      $(inst).animate({volume:instVolume}, mil(fadeDuration));
      slider.slider('option', 'animate', mil(fadeDuration));

      // TODO - enable cancelling this animation, as it gets out of sync when
      // other options are chosen while it's animating
      // var tweenText = function(inst, instVolume, fadeDuration)
      tweenText(inst, instVolume, fadeDuration);
    }
    else
    {
      slider.slider('option', 'animate', 10);
      inst.volume = instVolume;
      spans.text(String(instVolumeInHundredths));
    }

    slider.slider('value', instVolumeInHundredths);
  }

  var isolate = function(_inst, shouldAnimate)
  {
    insts.forEach(function(inst)
    {
      instVolume = (inst == _inst) * 1;
      volumate(inst, instVolume, shouldAnimate);
    });
  }

  var obscure = function(_inst, shouldAnimate)
  {
    insts.forEach(function(inst)
    {
      instVolume = (inst != _inst) * 1;
      volumate(inst, instVolume, shouldAnimate);
    });
  }

  var isolateSoft = function(_inst)
  {
    isolate(_inst, true);
  }

  var obscureSoft = function(_inst)
  {
    obscure(_inst, true);
  }

  MixPanel.showAll = function(_inst)
  {
    // TODO - stop all animation before
    obscure();
  }

  MixPanel.hideAll = function(_inst)
  {
    // TODO - stop all animation before
    isolate();
  }

  MixPanel.fadeInAll = function(_inst)
  {
    // TODO - stop all animation before
    obscure(null, true);
  }

  MixPanel.fadeOutAll = function(_inst)
  {
    // TODO - stop all animation before
    isolate(null, true);
  }

  var idElTitled = function(idName)
  {
    idName = String(idName).camelize(false);
    var el = $("#"+idName);
    el[0].setAttribute('title',idName.titleize());
    return el;
  }

  var spanElClassed = function(className)
  {
    var el = $("span."+String(className).toLowerCase());
    return el;
  }

  var audioElByTitle = function(title)
  {
    return insts.find(function(_inst)
        {
          return _inst.title === title.titleize();
        });
  }

  var volumeForEl = function(el, value)
  {
    var inst = audioElByTitle($(el).attr('title'));
    volumate(inst, Number(value), true, 0.2);
  }

  var elOn = function(el)
  {
    volumeForEl(el, 1);
  }

  var elOff = function(el, value)
  {
    volumeForEl(el, 0);
  }

  var ctx = function(o,fn)
  {
    (fn).apply(o);
  }

  ctx(Math, function(){
    this.tramp = function (n) {
      return this[ (n < 1) ? 'floor' : 'ceil' ](n);
    };
  });

  var cien = function(volume)
  {
    return Number(volume) * 100.0;
  }

  var mil = function(volume)
  {
    return Number(volume) * millisecondsPerSecond;
  }

  var tweenText = function(inst, instVolume, fadeDuration)
  {
    if(isUndefined(inst) || isUndefined(instVolume))
    {
      throw new Error("undefined sent to tweenText");
      return;
    }
    else if(isUndefined(fadeDuration))
    {
      fadeDuration = defaultFadeDuration;
    }

    var instVolumeInHundredths = cien(instVolume);
    var spans = spanElClassed(getTitleizedTitle(inst));
    $({text: cien(inst.volume)}).animate({text: instVolumeInHundredths}, {
      duration: fadeDuration * millisecondsPerSecond,
      easing:'swing',
      step: function()
      {
        var text = Math.tramp(this.text);
        spans.text(String(text));
      }
    });
  }

  var faderMakeWithTitle = function(title){
    return $('<div class="third">\
      <h2>'+title+'</h2>\
      <p>\
        <button class="isolate_button" title="'+title+'">S</button>\
        <button class="invert_isolate_button" title="'+title+'">Ƨ</button>\
        <button class="hide_button" title="'+title+'">M</button>\
        <button class="show_button" title="'+title+'">F</button>\
      </p>\
      <p>\
        <label for="amount">Vol</label>\
        <span class="'+title.toLowerCase()+'" name="amount">100</span>\
      </p>\
      <div id="'+title.toLowerCase()+'" class="volume_cont"></div>\
    </div>');
  };

  var faderMakeWithTitleAndRender = function(title)
  {
    faderMakeWithTitle(title).appendTo('div#fader_bank');
  }

  var sliderDefaults = {
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    animate: defaultFadeDuration * millisecondsPerSecond,
    value: 100
  };

  $(function() {
    insts.forEach(function(inst)
    {
      faderMakeWithTitleAndRender(inst.title);

      var el = idElTitled(inst.title);

      el.slider(Object.merge(sliderDefaults, {

        slide: function(event,ui)
        {
        var title = event.target.id.titleize();

        var spans = spanElClassed(title);

        if(event.originalEvent.type === 'mousedown')
        {
          $(inst).animate({volume:Number(ui.value/100.0)}, mil(defaultFadeDuration));
          tweenText(inst, Number(ui.value/100.0));
        }
        else if(event.originalEvent.type === 'mousemove')
        {
          insts.find(function(_inst)
          {
            return _inst.title === title;
          }).volume = ui.value/100.0;
          spans.text(String(ui.value));
        }
       }
      }));
    });

    $('button.isolate_button').click(function(){
      var inst = audioElByTitle($(this).attr('title'));
      isolateSoft(inst);
    });

    $('button.invert_isolate_button').click(function(){
      var inst = audioElByTitle($(this).attr('title'));
      obscureSoft(inst);
    });

    $('button.hide_button').click(function(){
      elOff(this);
    });

    $('button.show_button').click(function(){
      elOn(this);
    });
  });

  return MixPanel;
}
