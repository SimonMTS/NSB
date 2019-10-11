const remote = require('electron').remote;
const wav = require('wav');
const fs = require('fs');
const portAudio = require("naudiodon");
const store = require('electron-store');
const Store = new store();
const readline = require('readline');

let outputTableHTML,
    soundTableHTML;
{
    outputTableHTML = `
        <tr>
            <td>
                <div class="custom-control custom-radio">
                    <input class="form-check-input" type="radio" name="device" id="&RADIO_NAME&" value="&RADIO_NAME&" unchecked>
                    <label class="form-check-label" for="&RADIO_NAME&">
                        &DEVICE_NAME&
                    </label>
                </div>
            </td>
        </tr>
    `;
    
    soundTableHTML = `
        <tr>
            <td>&NUMBER&</td>
            <td
                class="playable"
                data-location="&LOCATION&"
            >&NAME&</td>
        </tr>
    `;
}

let audioOutputs = null;
let audioElems = null;


let setDevices;
{

    setDevices = function setDevices( devices ) {

        for ( let d in devices ) {

            if ( devices[d].maxOutputChannels <= 0 ) continue;

            let html = outputTableHTML;
            html = html.replace(/&DEVICE_NAME&/g, devices[d].name);
            html = html.replace(/&RADIO_NAME&/g, d);

            // console.log( Store.get('deviceID') + "-" + d );

            if ( Store.get('deviceID') != null && Store.get('deviceID') == d ) {
                html = html.replace(/unchecked/g, 'checked');
            }

            document.querySelector('.output tbody').insertAdjacentHTML('beforeend', html);
        }

    }

}

let getFiles,
    setSound;
{

    getFiles = function getFiles() {

        const readInterface = readline.createInterface({
            input: fs.createReadStream(process.env.PORTABLE_EXECUTABLE_DIR + '/sounds.txt'),
            output: process.stdout,
            console: false
        });

        lineNumber = 1;
        readInterface.on('line', function( line ) {

            let name = line.replace(/^.*\\/, '').replace(/\.wav/, '');

            setSound( line, lineNumber, name );
            lineNumber++;

        });

    }

    setSound = function setSound( line, lineNumber, name ) {

        let html = soundTableHTML;
            html = html.replace(/&LOCATION&/g, line);
            html = html.replace(/&NAME&/g, name);
            html = html.replace(/&NUMBER&/g, lineNumber);

        document.querySelector('.sounds tbody').insertAdjacentHTML('beforeend', html);

        let elem = document.querySelector('.sounds tbody tr:last-child td:last-child');
        elem.addEventListener("click", event => {
            
            playAudio( elem.dataset.location );

        });

    }

}

let playAudioGlobal,
    playAudio,
    playTodevice,
    stopAudio;
{

    playAudioGlobal = function playAudioGlobal( index ) {

        let elem = document.querySelector('.sounds tbody tr:nth-child('+index+') td:last-child');
    
        if ( elem == null ) return;
    
        playAudio( elem.dataset.location );
    
    };
    
    playAudio = function playAudio( location ) {
    
        if ( document.querySelector('input[name="device"]:checked') == null ) return;
    
        deviceID = parseInt( document.querySelector('input[name="device"]:checked').value );
        Store.set('deviceID', deviceID);
    
        if (!Number.isInteger(deviceID) || deviceID < 0) return;
    
        try {
            if ( audioOutputs != null || audioElems != null) {
                audioOutputs.quit();
                audioElems.pause();
                audioElems.remove();
    
                // setTimeout(function() { playAudio( location ); }, 500);
    
                audioElems = null;
                audioOutputs = null;
                // return;
            }
    
            playTodevice(deviceID, location);
    
            audioElems = new Audio(location);
            audioElems.volume = 0.1;
            audioElems.play();
        } catch (e) {
            console.log(e);
        }
    
    }
    
    playTodevice = function playTodevice( deviceID, fileLocation ) {
    
        let reader = new wav.Reader();
        const file = fs.createReadStream(fileLocation);
    
        reader.on('format', function (format) {
            console.log(format);
            
            audioOutputs = new portAudio.AudioIO({
                outOptions: {
                  channelCount: format.channels,
                  sampleFormat: portAudio.SampleFormat16Bit,
                  sampleRate: format.sampleRate,
                  deviceId: deviceID
                }
            });
            
            file.on('end', () => console.log('file end'));
            audioOutputs.on('end', () => console.log('audioOutput end'));
            reader.on('end', () => console.log('reader end'));
    
            reader.pipe(audioOutputs);
            audioOutputs.start();
        });
    
        file.pipe(reader, {
            end: false
        });
    
    }
    
    stopAudio = function stopAudio() {
    
        audioOutputs.quit();
        audioElems.pause();
        audioElems.remove();
    
        audioElems = null;
        audioOutputs = null;
        
    }

}

let setWindowsButtons;
{

    setWindowsButtons = function setWindowsButtons() {

        let window = remote.getCurrentWindow();
        const minButton = document.getElementById('min-button'),
            maxButton = document.getElementById('max-button'),
            restoreButton = document.getElementById('restore-button'),
            closeButton = document.getElementById('close-button');

        minButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.minimize();
        });

        maxButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.maximize();
            toggleMaxRestoreButtons();
        });

        restoreButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.unmaximize();
            toggleMaxRestoreButtons();
        });

        // Toggle maximise/restore buttons when maximisation/unmaximisation
        // occurs by means other than button clicks e.g. double-clicking
        // the title bar:
        toggleMaxRestoreButtons();
        window.on('maximize', toggleMaxRestoreButtons);
        window.on('unmaximize', toggleMaxRestoreButtons);

        closeButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.close();
        });

        function toggleMaxRestoreButtons() {
            window = remote.getCurrentWindow();
            if (window.isMaximized()) {
                maxButton.style.display = "none";
                restoreButton.style.display = "flex";
            } else {
                restoreButton.style.display = "none";
                maxButton.style.display = "flex";
            }
        }

    }

}



(function() {

    getFiles();

    let devices = portAudio.getDevices()
    setDevices( devices );

    document.onreadystatechange = () => {
        if ( document.readyState == "complete" ) {
            setWindowsButtons();
        }
    };

})();