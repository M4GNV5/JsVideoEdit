function MainComponent()
{
	this.width = 600;
	this.height = 400;

	this.duration = 5000;
	this.fps = 30;

	this.background = "#161618";
	this.anchor = "#ee4d2e";

	this.showAnchors = true;

	this.components = {};
}
MainComponent.prototype.render = function(ctx, time, cb)
{
	var editor = $("#editor");
	editor.attr("width", this.width);
	editor.attr("height", this.height);

	ctx.beginPath();
	ctx.fillStyle = this.background;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.closePath();

	var self = this;
	var keys = Object.keys(self.components);
	next(0);
	function next(i)
	{
		if(i < keys.length)
		{
			var comp = self.components[keys[i]];
			comp.render(ctx, time, next.bind(undefined, i + 1));

			if(self.showAnchors)
			{
				ctx.beginPath();
				ctx.fillStyle = self.anchor;
				ctx.arc(comp.x, comp.y, 7, 0, 2 * Math.PI);
				ctx.fill();
				ctx.closePath();
			}
		}
		else
		{
			cb();
		}
	}
}

function ImageComponent(img)
{
	this.image = img || "";
	this.x = 0;
	this.y = 0;
	this.startTime = 0;
	this.duration = 3000;

	img = img || {};
	this.width = img.width || 0;
	this.height = img.height || 0;
}
ImageComponent.prototype.render = function(ctx, time, cb)
{
	if(time >= this.startTime && time < this.startTime + this.duration && loadedImages[this.image])
	{
		var img = loadedImages[this.image];
		ctx.drawImage(img, this.x, this.y, this.width || img.width, this.height || img.height);
	}
	cb();
};

function TextComponent(text)
{
	this.x = 5;
	this.y = 20;

	this.startTime = 0;
	this.duration = 3000;

	this.text = text || "";
	this.color = "white";
	this.font = "bold 20px 'Helvetica Neue', Helvetica, sans-serif";
}
TextComponent.prototype.render = function(ctx, time, cb)
{
	if(time >= this.startTime && time < this.startTime + this.duration)
	{
		ctx.beginPath();
		ctx.font = this.font;
		ctx.fillStyle = this.color;
		ctx.fillText(this.text, this.x, this.y);
		ctx.closePath();
	}
	cb();
};
