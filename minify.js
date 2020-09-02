const minify = require('terser');
const fs = require('fs')
const readline = require('readline')
const jspath = "./dashboard/js";
const csspath = "./dashboard/css";

const cssminify = require('minify')


let terserOptions = {
    compress: {
        drop_console : true
    },
}

if (!fs.existsSync(jspath + '/original'))
    fs.mkdirSync(jspath + '/original')

if (!fs.existsSync(csspath + '/original'))
    fs.mkdirSync(csspath + '/original')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("1 : minify");
console.log("2 : return");

rl.on("line", function (line) {
    if (line == "1"){
        MinifyJS();
        MinifyCSS();
    }
    else if (line == "2"){
        ReturnJS();
        ReturnCSS();
    }

    console.log("Finished")
    rl.close();
});


function MinifyJS() {
    console.log("JS Minifying...")
    var dir = fs.readdirSync(jspath, { withFileTypes: true })
    var original = fs.readdirSync(jspath +'/original');

    if(original.length != 0){
        console.log("JS Already minified");
        return;
    }

    const filesNames = dir
        .filter(dir => dir.isFile())
        .map(dir => dir.name);

    filesNames.forEach((file) => {
        var z = fs.readFileSync(jspath + "/" + file, 'utf8')
        var code = z;
        minify.minify(code, terserOptions).then((min) => {
            let filepath = jspath + '/' + file;
            fs.copyFileSync(jspath + '/' + file, jspath + '/original/' + file)
            fs.writeFileSync(filepath, min.code);
        })
    })
    console.log("JS Minify finished")
}

function MinifyCSS() {
    var dir = fs.readdirSync(csspath, { withFileTypes: true })
    var original = fs.readdirSync(csspath +'/original');
    console.log("CSS Minifying...")

    if(original.length != 0){
        console.log("CSS Already minified");
        return;
    }

    const filesNames = dir
        .filter(dir => dir.isFile())
        .map(dir => dir.name);

    const option = {
        css : {
            compatibility : '*'
        }
    }

    
    filesNames.forEach((file) => {
        let filepath = csspath + "/" + file;
        cssminify(filepath, option)
            .then((min) => {
                fs.copyFileSync(filepath, csspath + '/original/' + file)
                fs.writeFileSync(filepath, min);
            }) 
            .catch(console.error)
    })
    


    console.log("CSS Minify finished");
}

function ReturnJS() {
    var dir = fs.readdirSync(jspath, { withFileTypes: true })
    var original = fs.readdirSync(jspath +'/original');

    if(original.length == 0){
        console.log("Not minified yet");
        return;
    }

    const filesNames = dir
        .filter(dir => dir.isFile())
        .map(dir => dir.name);

    filesNames.forEach((file) => {
        fs.unlinkSync(jspath + "/" + file);
        fs.renameSync(jspath + '/original/' + file, jspath + '/' + file);
    })

}

function ReturnCSS(){
    var dir = fs.readdirSync(csspath, { withFileTypes: true })
    var original = fs.readdirSync(csspath +'/original');

    if(original.length == 0){
        console.log("Not minified yet");
        return;
    }

    const filesNames = dir
        .filter(dir => dir.isFile())
        .map(dir => dir.name);

    filesNames.forEach((file) => {
        fs.unlinkSync(csspath + "/" + file);
        fs.renameSync(csspath + '/original/' + file, csspath + '/' + file);
    })
}