# Node Sound Board
A simple, Nodejs SoundBoard. For usage info see below.
![alt text](https://raw.githubusercontent.com/SimonMTS/NSB/master/example.png?token=AD7AJFTU2ABSMDTHQSZAAPK5U52A4)

NSB plays audio into two output devices, the default & one you select.
To play audio through your microfone you need to install a [virtual audio cable].

* Set the cable output as your default recording device.
* Then in your microfone settings enable "listen to this devive" and select cable input as playback device.
* In NSB select cable input aswell.
Your microfone and NSB will now output into cable input which will pipe to cable output, which is now your default recording device.


To add sounds to NSB simply add their paths to `sounds.txt`, that is in the same folder as `NSB.exe`.

For example:
```
C:\path\to\test sound 1.wav
C:\path\to\test sound 2.wav
C:\path\to\test sound 3.wav
```

Numpad 0 + the numpad keys act as shortcuts to play the first 9 sounds, num0+num1 => 1, etc.

Num0 + del key stops the active audio.


[virtual audio cable]: https://www.vb-audio.com/Cable/
