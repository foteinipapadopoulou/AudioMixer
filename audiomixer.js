
const volumeButton=document.getElementById("volume");
const playButton=document.getElementById("play");
const bassButton=document.getElementById("bass");
const trebleButton=document.getElementById("treble");
var canvasCt=document.getElementById("canvas1");
var canvasCtx=canvasCt.getContext('2d');
const compressorButton=document.getElementById("compressor");
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
var mybuffer=null;
var source=null;
var analyser=null;
var bass;
var treble;
var gainNode;
var compressor;
var state="stopped"
loadSound("https://dl.dropbox.com/s/roxjy4c2f7z5y6f/The%20Police%20-%20Roxanne%20%28Official%20Music%20Video%29.mp3?dl=0");
source=playSound(mybuffer)

analyser.fftSize=1024;
var bufferLength = analyser.frequencyBinCount;
var WIDTH=500;
var HEIGHT=100;
var dataArray = new Uint8Array(bufferLength);
canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
draw();

bassButton.addEventListener('click',function(){
  if(bassButton.getAttribute('active')==="true"){
    bass.gain.setValueAtTime(25,audioCtx.currentTime);
    bassButton.innerHTML='Disable Bass';
    bassButton.setAttribute('active',"false");
  }else{
    bass.gain.setValueAtTime(0,audioCtx.currentTime);
    bassButton.innerHTML='Enable Bass';
    bassButton.setAttribute('active',"true");
  }
},false);

trebleButton.addEventListener('click',function(){
  if(trebleButton.getAttribute('active')==="true"){
    treble.gain.setValueAtTime(25,audioCtx.currentTime);
    trebleButton.innerHTML='Disable Treble';
    trebleButton.setAttribute('active',"false");
  }else{
    treble.gain.setValueAtTime(0,audioCtx.currentTime);
    trebleButton.innerHTML='Enable Treble';
    trebleButton.setAttribute('active',"true");
  }
},false);

compressorButton.addEventListener('click',function(){
    if(compressorButton.getAttribute('active')==="true"){
        gainNode.disconnect(audioCtx.destination);
        gainNode.connect(compressor);
        compressor.connect(audioCtx.destination);
        compressorButton.innerHTML='Disable compressor';
        compressorButton.setAttribute('active',"false");
    }else{
        compressor.disconnect(audioCtx.destination);
        gainNode.disconnect(compressor);
        gainNode.connect(audioCtx.destination);
        compressorButton.innerHTML='Enable compressor'
        compressorButton.setAttribute("active","true");
    }
},false);


playButton.addEventListener('click', function() {
  if (audioCtx.state === 'suspended') {
       audioCtx.resume();
   }
    if(state==="stopped"){
        source=playSound(mybuffer);
        source.start();
        document.getElementById("demo").innerHTML = "started";
        state="playing";
    }else{
        source.stop();
        state="stopped";
        document.getElementById("demo").innerHTML = "paused";
    }
},false);

volumeButton.addEventListener('input',function(){
        gainNode.gain.value=this.value/100;
        console.log(this.value/100)
        document.getElementById("volumedisplay").innerHTML = this.value;
},false)


function loadSound(url){
    var req=new XMLHttpRequest();
    req.open('GET',url,true);
    //req.setRequestHeader('Access-Control-Allow-Origin', '*');
    req.responseType='arraybuffer';
    req.onload=function(){
        audioCtx.decodeAudioData(req.response,function(buffer){
            mybuffer=buffer;
        },function(e){ console.log("Error with decoding audio data" + e.err); });
    }
    req.send();
}

function playSound(buffer){
    analyser=audioCtx.createAnalyser();
    compressor= audioCtx.createDynamicsCompressor();
    bass=audioCtx.createBiquadFilter();
    treble=audioCtx.createBiquadFilter();
    gainNode=audioCtx.createGain();
    gainNode.gain.value=0.5;
    source=audioCtx.createBufferSource();

    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    analyser.smoothingTimeConstant = 0.6
    source.buffer=mybuffer;

    source.connect(analyser);
    analyser.connect(bass);
    bass.connect(treble);
    treble.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    // Manipulate the Biquad filter
    bass.type="lowshelf";
    bass.frequency.setValueAtTime(400,audioCtx.currentTime);
    bass.gain.setValueAtTime(0,audioCtx.currentTime);
    treble.type = "highshelf";
    treble.frequency.setValueAtTime(2000, audioCtx.currentTime);
    treble.gain.setValueAtTime(0, audioCtx.currentTime);


    return source;
}

    function draw(){
        var drawVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();
        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT/2;

            if(i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
          }
        canvasCtx.lineTo(WIDTH, HEIGHT/2);
        canvasCtx.stroke();
    };




//set up the different audio nodes we will use for the app
/*
var analyser = audioCtx.createAnalyser();
var distortion = audioCtx.createWaveShaper();

var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

// connect the nodes together

source = audioCtx.createMediaStreamSource(stream);
source.connect(analyser);
analyser.connect(distortion);
distortion.connect(biquadFilter);
biquadFilter.connect(convolver);
convolver.connect(gainNode);


// Manipulate the Biquad filter

biquadFilter.type = "lowshelf";
biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);*/
