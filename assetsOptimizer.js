const sharp = require('sharp'),
    path = require('path'), 
    fs = require('fs'),
    breakpoints = require('./.vuepress/config').themeConfig.imageBreakpoints;


function getAssetList(startPath, filter, blacklist) {
    var assets = [];

    if (fs.existsSync(startPath) && !blacklist.includes(startPath)) {
        // console.log(startPath)
        var files = fs.readdirSync(startPath);

        for(var file of files) {
            var filename = path.join(startPath, file);
            var stat = fs.lstatSync(filename);

            if (stat.isDirectory()) {
                assets = assets.concat(getAssetList(filename, filter, blacklist)); // recursively search assets
            } else if (filter.test(filename)) {
                assets.push(filename);
                console.log(filename)
            }
        }
    }

    return assets;
}

function resize(input, size, output) {
    console.log(`Resize: Started processing ${input} for size ${size}`);
    sharp(input)
        .resize(size)
        .toFile(output, (err, info) => { if (err) { console.error(err) } else { console.log(info) } });

    // todo: copy if not resized

    // sharp resize 988 -i {*,*/*,*/*/*,.*/*}/*.{png,jpg} -o .vuepress/public/resized-images --optimise true --withMetadata false
}

function prepareOutputDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}


console.log("Assets optimization started");

console.log("Setup: List assets");

const filter = /^.*\.(jpe?g|png)/g;
const blacklist = ['node_modules', '.vuepress/dist', '.vuepress/theme', '.vuepress/public/resized-images', '.vuepress/public/h5p', '.git'];
const assetList = getAssetList('./', filter, blacklist);

console.log("Setup: Completed");

console.log("Resize: Started resizing images using sharp");

for (var breakpoint of breakpoints) {
    prepareOutputDir(`.vuepress/public/resized-images/${breakpoint}`);

    for (var asset of assetList) {
        var filePath = asset.split('/');
        var filename = filePath[filePath.length - 1];
        resize(asset, breakpoint, `.vuepress/public/resized-images/${breakpoint}/${filename}`);
    }
}



console.log("Resize: Completed");

// console.log("Copy: Adds remaining small images to the same output folder");
// // find . \( -name 'node_modules' -o -path './.vuepress/dist' -o -path './.vuepress/theme' -o -path './.vuepress/public/resized-images' -o -path './.vuepress/public/h5p' \) -prune -o \( -name '*.png' -o -name '*.jpg' \) -exec cp -vu {} .vuepress/public/resized-images \;

// const findAndCopy = spawn('find', ['.', '(', '-name', '"node_modules"', '-o', '-path', '"./.vuepress/dist"', '-o', '-path', '"./.vuepress/theme"', '-o', '-path', '"./.vuepress/public/resized-images"', '-o', '-path', '"./.vuepress/public/h5p"', ')', '-prune', '-o', '(',  '-name', '"*.png"', '-o', '-name', '"*.jpg"', ')', '-exec', 'cp', '-vu', '{}', '.vuepress/public/resized-images', ';']);

// findAndCopy.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// findAndCopy.stderr.on('err', (err) => {
//   console.error(`stderr: ${err}`);
// });

// findAndCopy.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

// console.log("Copy: Completed");
console.log("Assets optimization completed");