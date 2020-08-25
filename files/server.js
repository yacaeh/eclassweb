const express = require('express');
const fileUpload = require('express-fileupload');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const app = express();

const port = 1443;

const options = {
   key: fs.readFileSync('/home/primomceo/files/nginx/certs/private.key', 'utf8'),
  cert: fs.readFileSync('/home/primomceo/files/nginx/certs/certificate.crt', 'utf8')
};

// default options
//app.use(fileUpload());
app.use(cors());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
//app.use(express.urlencoded());
app.use(express.json());

app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }

  console.log('req.files :', req.files); // eslint-disable-line

  sampleFile = req.files;
  console.log("req.files.name:"+sampleFile.file_data.name);
  console.log(req.body.userId);
  uploadPath = __dirname + '/uploads/'+req.body.userId;

  let dir = uploadPath +'/'+ sampleFile.file_data.name;

  if (!fs.existsSync(uploadPath)){
    fs.mkdirSync(uploadPath);
  }


  sampleFile.file_data.mv(dir, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

var data = {
    name: sampleFile.file_data.name,
    url : fileServerUrl + '/uploads/'+req.body.userId+'/'+sampleFile.file_data.name
    }
    console.log(data);
    res.json(data);

  });
});

app.post('/delete', function(req, res){
fs.unlink(req.file, function (err) {
    if (err) {
	return res.status(500).send(err);
	}
    // if no error, file has been deleted successfully
    console.log('File deleted!');
    var data = {deleted:true};
    res.json(data);
});

});


app.post('/list', function(req,res){
console.log(req.body);
console.log(req.body.userId);
const directoryPath = __dirname+ '/uploads/'+req.body.userId;
console.log(directoryPath);
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return res.status(500).send(err);
    }
var data = [];
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file);
	data.push(file);
    });
	console.log(data);
	res.json(data);
});


});


var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

app.get('/', function (req, res) {
    res.writeHead(200);
    res.end("hello world\n");
});

