const remote = require('electron').remote;
const wav = require('wav');
const fs = require('fs');
// const portAudio = require('node-portaudio');
// const Speaker = require('speaker'); 
const portAudio = require("naudiodon");
const store = require('electron-store');
const Store = new store();
const readline = require('readline');

const outputTableHTML = `
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

const soundTableHTML = `
<tr>
    <td>&NUMBER&</td>
    <td
        class="playable"
        data-location="&LOCATION&"
    >&NAME&</td>
</tr>
`;

(function() {

    {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(process.env.PORTABLE_EXECUTABLE_DIR + '/sounds.txt'),
            output: process.stdout,
            console: false
        });

        lineNumber = 1;
        readInterface.on('line', function(line) {
            // console.log(line);

            let name = line.replace(/^.*\\/, '').replace(/\.wav/, '');

            let html = soundTableHTML;
            html = html.replace(/&LOCATION&/g, line);
            html = html.replace(/&NAME&/g, name);
            html = html.replace(/&NUMBER&/g, lineNumber);
            lineNumber++;

            document.querySelector('.sounds tbody').insertAdjacentHTML('beforeend', html);

            let elem = document.querySelector('.sounds tbody tr:last-child td:last-child');
            elem.addEventListener("click", event => {

                if ( document.querySelector('input[name="device"]:checked') == null ) return;
                
                deviceID = parseInt( document.querySelector('input[name="device"]:checked').value );
                Store.set('deviceID', deviceID);

                if (!Number.isInteger(deviceID) || deviceID < 0) return;

                try {
                    playAudio(deviceID, elem.dataset.location);

                    let audio = new Audio(elem.dataset.location);
                    audio.volume = 0.1;
                    audio.play();
                } catch (e) {
                    console.log(e);
                }

            }); 
        });
    }

    {
        
        let devices = portAudio.getDevices()
        for ( let d in devices ) {
            // console.log(devices[d]);

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

    {
        document.onreadystatechange = () => {
            if (document.readyState == "complete") {
                init();
            }
        };
    
        function init() {
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

})();

function playAudioGlobal( i ) {

    let elem = document.querySelector('.sounds tbody tr:nth-child('+i+') td:last-child');
    
    if ( document.querySelector('input[name="device"]:checked') == null ) return;
                
    deviceID = parseInt( document.querySelector('input[name="device"]:checked').value );
    Store.set('deviceID', deviceID);

    if (!Number.isInteger(deviceID) || deviceID < 0) return;

    try {
        playAudio(deviceID, elem.dataset.location);

        let audio = new Audio(elem.dataset.location);
        audio.volume = 0.1;
        audio.play();
    } catch (e) {
        console.log(e);
    }

};

function playAudio( deviceID, fileLocation ) {

    let reader = new wav.Reader();
    const file = fs.createReadStream(fileLocation);

    reader.on('format', function (format) {
        console.log(format);
        
        const audioOutput = new portAudio.AudioIO({
            outOptions: {
              channelCount: format.channels,
              sampleFormat: portAudio.SampleFormat16Bit,
              sampleRate: format.sampleRate,
              deviceId: deviceID
            }
        });
        
        file.on('end', () => console.log('file end'));
        audioOutput.on('end', () => console.log('audioOutput end'));
        reader.on('end', () => console.log('reader end'));

        reader.pipe(audioOutput);
        audioOutput.start();
        // audioOutput.quit();
    });

    file.pipe(reader, {
        end: false
    });

}

function playAudio1() {

    const fs = require('fs');
    // const portAudio = require('node-portaudio');

    // Create an instance of AudioOutput, which is a WriteableStream
    const ao = new portAudio.AudioOutput({
        channelCount: 2,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: 48000,
        deviceId : -1 // Use -1 or omit the deviceId to select the default device
    });

    // handle errors from the AudioOutput
    ao.on('error', err => console.error);

    // Create a stream to pipe into the AudioOutput
    // Note that this does not strip the WAV header so a click will be heard at the beginning
    const rs = fs.createReadStream('C:/Users/simon/Music/Cummy Quotes Wav/A Splash Of Cum To Seal The Deal.wav');

    // setup to close the output stream at the end of the read stream
    rs.on('end', () => ao.end());

    // Start piping data and start streaming
    rs.pipe(ao);
    ao.start();

}

function playAudio2() {

    // Create an instance of AudioOutput, which is a WriteableStream
    const ao = new portAudio.AudioOutput({
        channelCount: 2,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: 48000,
        deviceId : -1 // Use -1 or omit the deviceId to select the default device
    });
    
    // handle errors from the AudioOutput
    ao.on('error', err => console.error);
    
    // Create a stream to pipe into the AudioOutput
    // Note that this does not strip the WAV header so a click will be heard at the beginning
    const rs = fs.createReadStream('C:/Users/simon/Music/Cummy Quotes Wav/A Splash Of Cum To Seal The Deal.wav');
    
    // setup to close the output stream at the end of the read stream
    rs.on('end', () => ao.end());
    
    // Start piping data and start streaming
    rs.pipe(ao);
    ao.start();

}

function playAudio3() {

    var reader = new wav.Reader();
    const file = fs.createReadStream('C:/Users/simon/Music/Cummy Quotes Wav/A Splash Of Cum To Seal The Deal.wav');

    reader.on('format', function (format) {
        // cant seem to change output devise
        format.device = "CABLE Input (VB-Audio Virtual Cable)";

        console.log(format);
        reader.pipe(new Speaker(format));
    });

    file.pipe(reader, {
        end: false
    });

}

function playAudio4() {

    const fs = require('fs');
 
    // Create an instance of AudioIO with outOptions, which will return a WritableStream
    var ao = new portAudio.AudioIO({
    outOptions: {
        channelCount: 2,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: 48000,
        deviceId: -1 // Use -1 or omit the deviceId to select the default device
    }
    });
    
    // Create a stream to pipe into the AudioOutput
    // Note that this does not strip the WAV header so a click will be heard at the beginning
    var rs = fs.createReadStream('C:/Users/simon/Music/Cummy Quotes Wav/A Splash Of Cum To Seal The Deal.wav');
    
    // Start piping data and start streaming
    rs.pipe(ao);
    ao.start();

}