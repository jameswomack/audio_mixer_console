var piano = new Audio();
piano.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/electric_piano.wav";
piano.title = "piano"

var synth = new Audio();
synth.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/synth.wav";
synth.title = "synth"

var perc = new Audio();
perc.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/percussion.wav";
perc.title = "perc"

var insts = [piano, synth, perc];

var defaultFadeDuration = 3;

var millisecondsPerSecond = 1000;

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

var volumate = function(inst, instVolume, shouldAnimate, fadeDuration)
{
	if(isUndefined(fadeDuration))
	{
		fadeDuration = defaultFadeDuration;
	}
	
	var title = $(inst).attr('title');
	var slider = idElTitled(title);
	var spans = spanElTitled(title);
	var instVolumeInHundredths = instVolume*100.0;
	
	if(shouldAnimate)
	{
		$(inst).animate({volume:instVolume}, fadeDuration * millisecondsPerSecond);
		slider.slider('option', 'animate', fadeDuration * millisecondsPerSecond);
		
		// TODO - enable cancelling this animation, as it gets out of sync when
		// other options are chosen while it's animating
		$({text: inst.volume*100.0}).animate({text: instVolumeInHundredths}, {
			duration: fadeDuration * millisecondsPerSecond,
			easing:'swing',
			step: function()
			{
				var text = Math[(this.text < 1)?"floor":"ceil"](this.text);
				spans.text(String(text));
			}
		});
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

var idElTitled = function(phrase)
{
	var el = $("#"+String(phrase));
	el[0].setAttribute('title',phrase);
	return el;
}

var spanElTitled = function(phrase)
{
	var el = $("span."+String(phrase));
	return el;
}

var audioElByTitle = function(title)
{
	return insts.find(function(_inst)
			{
				return _inst.title === title;
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
			insts.find(function(_inst)
			{
				return _inst.title === event.target.id;
			}).volume = ui.value/100.0;
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
