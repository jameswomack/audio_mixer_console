var piano = new Audio();
piano.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/electric_piano.wav";

var synth = new Audio();
synth.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/synth.wav";

var perc = new Audio();
perc.src = "http://james.local:3013/media/an_act_that_no_one_else_can_follow/separate_tracks/percussion.wav";

var insts = [piano, synth, perc];

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

var isolate = function(_inst)
{
	insts.forEach(function(inst)
	{
		inst.volume = (inst == _inst) * 1;
	});
}

var obscure = function(_inst)
{
	insts.forEach(function(inst)
	{
		inst.volume = (inst != _inst) * 1;
	});
}

var showAll = function(_inst)
{
	obscure();
}

var hideAll = function(_inst)
{
	isolate();
}

