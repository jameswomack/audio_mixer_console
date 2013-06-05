var piano = new Audio();
piano.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/electric_piano.wav";
piano.title = "Piano";

var synth = new Audio();
synth.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/synth.wav";
synth.title = "Synth";

var perc = new Audio();
perc.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/percussion.wav";
perc.title = "Perc";

var insts = [piano, synth, perc];

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

var play = function()
{
	insts.forEach(function(inst)
	{
		inst.play();
	});
}

var pause = function()
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

var stop = function()
{
	pause();
	sync(0);
}

var jump = 10;

var currentTime = function()
{
	return insts[0].currentTime;
}

var quickBack = function()
{
	var backTo = currentTime() - jump;
	sync(backTo);
}

var quickForward = function()
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

var showAll = function(_inst)
{
	obscure();
}

var hideAll = function(_inst)
{
	isolate();
}

var fadeInAll = function(_inst)
{
	obscure(null, true);
}

var fadeOutAll = function(_inst)
{
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
