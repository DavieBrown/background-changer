var wallpaper = require('wallpaper');
var fs = require('fs');
var util = require('util');
var request = require('request');

// The directory where we will save the retrieved image/data.
const targetDir = "./Backgrounds";

/*
* Download a file from a particular url and then execute a callback when this
* has been saved to disk.
*/
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

/*
* Retrieve data by making a call to the NASA planetary API.
*/
function retrieveDataFromNasa(callback) {
	var url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
	request({
		url: url,
		json: true
		}, function (error, response, body) {

		if (!error && response.statusCode === 200) {
			console.log(body) // Print the json response
			callback(body)
		}
	});
}

/*
* Save the image contained in the JSON object and then set the desktop background to be this picture.
*/
function downloadPictureAndSetBackground(argJson) {
	var lvUrl = argJson.hdurl;
	var lvTitle = argJson.title;
	var lvExplanation = argJson.explanation;
	var lvDate = argJson.date;

	var lvImageFileName = util.format("%s/%s-%s.png", targetDir, lvDate, lvTitle)
	var lvExplanationFileName = util.format("%s/%s-%s.txt", targetDir, lvDate, lvTitle);
	download(lvUrl, lvImageFileName, function(){
		// When we successfully download the image - set this as the desktop background.
		console.log('downloaded...');
		wallpaper.set(lvImageFileName).then(() => {
			console.log('set new background');
		});

		// Also save off the description to a text file.
		fs.writeFile(lvExplanationFileName, lvExplanation, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		});

	});
}

retrieveDataFromNasa(downloadPictureAndSetBackground);
