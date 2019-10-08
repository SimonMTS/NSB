const remote = require('electron').remote;
const wav = require('wav');
const portAudio = require('node-portaudio');
const fs = require('fs');
const Speaker = require('speaker');
// const portAudioOG = require("naudiodon");

const outputTableHTML = '<tr><td>&DEVICE_NAME&</td><td><div class="custom-control custom-checkbox float-right"><input type="checkbox" class="custom-control-input" id="&CHECKBOX_NAME&"><label class="custom-control-label" for="&CHECKBOX_NAME&"></label></div></td></tr>';

(function() {

    {
        
        let devices = portAudio.getDevices()
        for ( let d in devices ) {
            console.log(devices[d]);

            if ( devices[d].maxOutputChannels <= 0 ) continue;

            let html = outputTableHTML;
            html = html.replace('&DEVICE_NAME&', devices[d].name);
            html = html.replace('&CHECKBOX_NAME&', d);

            document.querySelector('.output tbody').insertAdjacentHTML('beforeend', html);
        }

        // playAudio();
        // playAudio1();
        // playAudio2();
        playAudio3();

        const playButton = document.getElementById('play_test');

        playButton.addEventListener("click", event => {
            playAudio3();
        });
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

function playAudio() {

    var reader = new wav.Reader();
    const file = fs.createReadStream('./page/test.wav');

    reader.on('format', function (format) {
        console.log(format);
        
        const audioOutput = new portAudio.AudioOutput({
            channelCount: 2,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: format.sampleRate,
            deviceId : -1 // Use -1 or omit the deviceId to select the default device
        });

        reader.pipe(audioOutput);
        audioOutput.start();
    });

    file.pipe(reader);

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
    const rs = fs.createReadStream('./page/test.wav');

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
    const rs = fs.createReadStream('./page/test.wav');
    
    // setup to close the output stream at the end of the read stream
    rs.on('end', () => ao.end());
    
    // Start piping data and start streaming
    rs.pipe(ao);
    ao.start();

}

function playAudio3() {

    var reader = new wav.Reader();
    const file = fs.createReadStream('./page/test.wav');

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
    var rs = fs.createReadStream('./page/test.wav');
    
    // Start piping data and start streaming
    rs.pipe(ao);
    ao.start();

}