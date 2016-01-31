var mainComponent = new MainComponent();
mainComponent.components["hi"] = new TextComponent("Hello World!");
var canvas = $("#editor")[0];
var ctx = canvas.getContext("2d");

mainComponent.render(ctx, 0, function() {});

$("#doDaMagic").click(function()
{
	var abortBtn = $("#abortDownload");
	var downloadBtn = $("#downloadWebM");
	var body = $("#downloadBody");

	abortBtn.prop("disabled", true);
	downloadBtn.prop("disabled", true);

	var encoder = new Whammy.Video(mainComponent.fps);
	var step = 1000 / mainComponent.fps;
	body.html("Generating Frames...");
	function next(time)
	{
		if(time > mainComponent.duration)
		{
			body.html("Creating WebM...");
			var blob = encoder.compile();
			var url = URL.createObjectURL(blob);
			var html = '<video src="' + url + '" width="568" height="350" controls autoplay />';
			body.html(html);

			abortBtn.prop("disabled", false);
			downloadBtn.prop("disabled", false);

			abortBtn.click(function()
			{
				downloadBtn.off("click");
				abortBtn.off("click");
			});
			downloadBtn.click(function()
			{
				downloadBtn.off("click");
				abortBtn.off("click");

				var a = document.createElement("a");
				a.href = url;
				a.download = "video.webm";
				a.click();
			});
		}
		else
		{
			mainComponent.render(ctx, time, function()
			{
				encoder.add(canvas);
				requestAnimationFrame(next.bind(undefined, time + step));
			});
		}
	}
	requestAnimationFrame(next.bind(undefined, 0));
});

$("#addComponent").click(function()
{
	var name = $("#addComponentName").val();
	var type = $("#addComponentType").val();

	var val;
	if(type == "Text")
		val = new TextComponent();
	else if(type == "Image")
		val = new ImageComponent();
	else if(type == "Video")
		throw "videos not implemented yet";

	mainComponent.components[name] = val;
	refreshComponentSelect();
	mainComponent.render(ctx, time, function() {});
});

$("#removeComponent").click(function()
{
	if(editingKey == "WebM" || !mainComponent.components[editingKey])
		return;
	delete mainComponent.components[editingKey];
	refreshComponentSelect();
	editComponent(mainComponent);
	mainComponent.render(ctx, time, function() {});
});

var componentSelect = $("#componentSelect");
var editingKey;
componentSelect.change(function()
{
	editingKey = componentSelect.val();
	var component;
	if(editingKey == "WebM")
		component = mainComponent;
	else
		component = mainComponent.components[editingKey];

	editComponent(component);
});

refreshComponentSelect();
function refreshComponentSelect()
{
	var keys = Object.keys(mainComponent.components).join("</option><option>");
	componentSelect.html("<option>WebM</option><option>" + keys + "</option>");
}

var editForm = $("#editForm");
editComponent(mainComponent);
function editComponent(component)
{
	var i = 0;
	var html = "";
	for(var key in component)
	{
		var id = "input" + i;
		i++;

		var type;
		if(typeof component[key] == "boolean")
			type = "checkbox";
		else if(typeof component[key] == "number")
			type = "number";
		else if(typeof component[key] == "string")
			type = "text";
		else
			continue;

		var val = component[key].toString();

		html += '<div class="form-group row">' +
				'<label for="' + id + '"" class="col-sm-2 form-control-label">' + key + '</label>' +
				'<div class="col-sm-10">' +
					'<input type="' + type + '" class="form-control" id="' + id + '" data-key="' +key +'" value="' + val + '" />' +
				'</div>' +
			'</div>';
	}

	editForm.html(html);
	editForm.children().find(".form-control").change(function(ev)
	{
		var key = ev.target.dataset.key;
		var val = ev.target.value;

		if(typeof component[key] == "boolean")
			val = val == "true";
		else if(typeof component[key] == "number")
			val = parseFloat(val);

		component[key] = val;
		mainComponent.render(ctx, time, function() {});
	});
}

var jcanvas = $("#editor");
jcanvas.mousedown(function(ev)
{
	if(!mainComponent.showAnchors)
		return;

	var draggingObj;

	for(var key in mainComponent.components)
	{
		var comp = mainComponent.components[key];
		var diffX = Math.abs(ev.offsetX - comp.x);
		var diffY = Math.abs(ev.offsetY - comp.y);
		console.log(key, diffX, diffY);
		if(diffX < 8 && diffY < 8)
		{
			draggingObj = comp;
			
			editingKey = key;
			componentSelect.val(key);
			editComponent(comp);
			break;
		}
	}

	if(draggingObj)
	{
		jcanvas.mousemove(function(ev)
		{
			draggingObj.x = ev.offsetX;
			draggingObj.y = ev.offsetY;

			mainComponent.render(ctx, time, function() {});
			editComponent(draggingObj);
		});

		jcanvas.mouseup(function(ev)
		{
			jcanvas.off("mousemove");
			draggingObj = false;
		});
	}
});

var playBtn = $("#playVideo");
var playIcon = $(playBtn.children()[0]);
var playPos = $(playBtn.children()[1]);
var playing = false;
var lastFrame;
var time = 0;
playBtn.click(function()
{
	if(playing)
		playIcon.attr("class", "fa fa-play");
	else
		playIcon.attr("class", "fa fa-pause");
	playing = !playing;

	if(playing)
		startPlaying();
});

$("#stepBack").mousedown(function()
{
	playing = true;
	startPlaying(true);
});
$("#stepBack").mouseup(function()
{
	playing = false;
	playIcon.attr("class", "fa fa-play");
});

$("#stepForward").mousedown(function()
{
	playing = true;
	startPlaying();
});
$("#stepForward").mouseup(function()
{
	playing = false;
	playIcon.attr("class", "fa fa-play");
});

function startPlaying(backwards)
{
	backwards = backwards ? -1 : 1;

	var play = function()
	{
		var currTime = Date.now();
		time += backwards * (currTime - lastFrame);
		lastFrame = currTime;

		if(time > mainComponent.duration)
			time = 0;
		if(time < 0)
			time = mainComponent.duration;

		var mins = Math.round(time / 1000 / 60);
		var secs = Math.round(time / 1000 % 60);
		secs = secs < 10 ? "0" + secs : secs;
		playPos.html(mins + ":" + secs);

		mainComponent.render(ctx, time, function()
		{
			if(playing)
				requestAnimationFrame(play);
		});
	};

	requestAnimationFrame(function()
	{
		lastFrame = Date.now();
		mainComponent.render(ctx, 0, function()
		{
			requestAnimationFrame(play);
		});
	});
}
