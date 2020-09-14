var tsify = require('tsify')
var browserify = require('browserify')

var source = require('vinyl-source-stream')
var streamify = require('gulp-streamify')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var gulp = require('gulp')

//requiring path and fs modules
const path = require('path')
const fs = require('fs')

const bundleTrackers = async function () {
    //joining path of directory
    const directoryPath = path.join(__dirname, 'src')
    const destDir = './bundles'

    // If the bundles directory does not exist, create it here
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir)
    }

    var promises = []

    var bundleThis = function (trackerArray) {
        for (let file of trackerArray) {
            let filePath = file

            // If its a directory
            if (
                !fs.statSync(path.join(directoryPath, filePath)).isDirectory()
            ) {
                console.log('Not a directory, skipping ' + filePath)
                continue
            }

            let finalPath = path.join(directoryPath, filePath, `/${file}.ts`)

            if (!fs.existsSync(finalPath)) {
                console.log("The file doesn't exist, skipping. " + filePath)
                continue
            }

            promises.push(
                new Promise((res, rej) => {
                    browserify([finalPath], { standalone: 'Trackers' })
                        .plugin(tsify, { noImplicitAny: true })
                        .bundle()
                        .pipe(source('tracker.js'))
                        .pipe(gulp.dest(path.join(destDir, file)))
                        .on('end', () => {
                            copyFolderRecursive(
                                path.join(directoryPath, filePath, 'includes'),
                                path.join(destDir, file)
                            )

                            res()
                        })
                })
            )
        }
    }

    const bundlesPath = path.join(__dirname, 'bundles')

    deleteFolderRecursive(bundlesPath)
    bundleThis(fs.readdirSync(directoryPath))

    await Promise.all(promises) //.then(function () { done() })
}

const generateVersioningFile = async function () {
    let jsonObject = {
        buildTime: new Date(),
        trackers: []
    }

    //joining path of directory
    const directoryPath = path.join(__dirname, 'bundles')
    var promises = []

    var generateTrackerList = function (trackerArray) {
        for (let trackerId of trackerArray) {
            // If its a directory
            if (!fs.statSync(path.join(directoryPath, trackerId)).isDirectory()) {
                console.log('not a Directory, skipping ' + trackerId)
                return
            }

            let finalPath = `./bundles/${trackerId}/source.js`

            promises.push(
                new Promise((res, rej) => {
                    let req = require(finalPath)
                    let tracker = req[trackerId]

                    let classInstance = new tracker(null)

                    // make sure the icon is present in the includes folder.
                    if (!fs.existsSync(path.join(directoryPath, trackerId, 'includes', classInstance.icon))) {
                        console.log('[ERROR] [' + trackerId + '] Icon must be inside the includes folder')
                        rej()
                        return
                    }

                    jsonObject.trackers.push({
                        id: trackerId,
                        name: classInstance.name,
                        author: classInstance.author,
                        desc: classInstance.description,
                        website: classInstance.authorWebsite,
                        version: classInstance.version,
                        icon: classInstance.icon
                    })

                    res()
                })
            )
        }
    }

    generateTrackerList(fs.readdirSync(directoryPath))
    await Promise.all(promises)

    // Write the JSON payload to file
    fs.writeFileSync(
        path.join(directoryPath, 'versioning.json'),
        JSON.stringify(jsonObject)
    )
}

const deleteFolderRecursive = function (folderPath) {
    folderPath = folderPath.trim()
    if (folderPath.length == 0 || folderPath === '/') return

    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file, index) => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    }
};

const copyFolderRecursive = function (tracker, target) {
    tracker = tracker.trim()
    if (tracker.length == 0 || tracker === '/') return

    target = target.trim()
    if (target.length == 0 || target === '/') return

    if (!fs.existsSync(tracker)) return

    var files = [];
    //check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(tracker));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(tracker).isDirectory()) {
        files = fs.readdirSync(tracker);
        files.forEach(function (file) {
            var curSource = path.join(tracker, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursive(curSource, targetFolder);
            } else {
                fs.copyFileSync(curSource, path.join(targetFolder, file));
            }
        });
    }
}

// exports.bundle = bundleTrackers
exports.bundle = gulp.series(bundleTrackers, generateVersioningFile)