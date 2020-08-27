const minify = require('terser');
const fs = require('fs')
const readline = require('readline')
const path = "./dashboard/js";

let terserOptions = {
    compress: {
        drop_console : true
    },
}

if (!fs.existsSync(path + '/original'))
    fs.mkdirSync(path + '/original')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("1 : minify");
console.log("2 : return");

rl.on("line", function (line) {
    if (line == "1")
        Minify();
    else if (line == "2")
        Return();

    console.log("Finish")
    rl.close();
});


function Minify() {
    var dir = fs.readdirSync(path, { withFileTypes: true })
    var original = fs.readdirSync(path +'/original');

    if(original.length != 0){
        console.log("Already minified");
        return;
    }

    const filesNames = dir
        .filter(dir => dir.isFile())
        .map(dir => dir.name);

    filesNames.forEach((file) => {
        console.log(file)
        var z = fs.readFileSync(path + "/" + file, 'utf8')
        var code = z;
        minify.minify(code, terserOptions).then((min) => {
            let filepath = path + '/' + file;
            fs.copyFileSync(path + '/' + file, path + '/original/' + file)
            fs.writeFileSync(filepath, min.code);
        })
    })
}

function Return() {
    var dir = fs.readdirSync(path, { withFileTypes: true })
    var original = fs.readdirSync(path +'/original');

    if(original.length == 0){
        console.log("Not minified yet");
        return;
    }

    const filesNames = dir
        .filter(dir => dir.isFile())
        .map(dir => dir.name);

    filesNames.forEach((file) => {
        fs.unlinkSync(path + "/" + file);
        fs.renameSync(path + '/original/' + file, path + '/' + file);
    })

}