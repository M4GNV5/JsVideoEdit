var loadedImages = {};
var loadedVideos = {};

//(function()
//{
	const imageMIMEs = [
		"image/png",
		"image/jpeg"
	];
	const videoMIMEs = [
		"video/webm"
	];

	var inputFiles = [];
	var filePreview = $('#fileInputPreview');

	$("#fileInput").change(function fileInput(evt)
	{
	    inputFiles = evt.target.files;
	    var preview = [];
	    for (var i = 0; i < inputFiles.length; i++)
		{
			var file = inputFiles[i];
			var name = file.name;

			var size = file.size / 1024;
			if(size > 512)
				size = Math.round(size / 1024 * 100) / 100 + " MB";
			else
				size = Math.ceil(size * 10) / 10 + " KB";

			var warnMsg = false;
			if(file.size > 20 * 1024 * 1024)
				warnMsg = "Large file, maximum 20MB recommended";
			if(imageMIMEs.indexOf(file.type) == -1 && videoMIMEs.indexOf(file.type) == -1)
				warnMsg = file.type ? "Unsupported file type " + file.type : "Unknown file type";

			var warn = warnMsg ? "<i class=\"fa fa-exclamation-triangle\" title=\"" + warnMsg + "\"></i> " : "";

			preview.push("<li>", warn, "<strong>", name, "</strong> (", size, ")</li>");
	    }
	    filePreview.html("<ul>" + preview.join("") + "</ul>");
	});

	$("#fileImport").click(function()
	{
		for(var i = 0; i < inputFiles.length; i++)
		{
			var file = inputFiles[i];
			var name = file.name;

			if(videoMIMEs.indexOf(file.type) != -1)
			{
				var video = document.createElement("video");
				video.src = URL.createObjectURL(file);
				loadedVideos[name] = video;
			}
			else if(imageMIMEs.indexOf(file.type) != -1)
			{
				var img = new Image();
				img.src = URL.createObjectURL(file);
				loadedImages[name] = img;
			}
			else
			{
				console.warn("Unsupported file " + file.name);
			}
		}
	});
//})();
