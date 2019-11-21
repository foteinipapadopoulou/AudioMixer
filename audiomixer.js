
const volumeButton=document.getElementById("volume");
const playButton=document.getElementById("play");
const bassButton=document.getElementById("bass");
const trebleButton=document.getElementById("treble");
const middleButton=document.getElementById("middle");
const startCompressor=document.getElementById("startingCom");
var ratio;
var knee;
var attack;
var threshold;
var release;
var canvasCt=document.getElementById("canvas1");
var canvasCtx=canvasCt.getContext('2d');
var attributes=document.getElementById("attr");
const compressorButton=document.getElementById("compressor");
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
var mybuffer=null;
var source=null;
var analyser=null;
var bass;
var treble;
var middle;
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
middleButton.addEventListener('click',function(){
  if(middleButton.getAttribute('active')==="true"){
    bass.connect(middle);
    middle.connect(treble);
    middleButton.innerHTML='Disable Middle';
    middleButton.setAttribute('active',"false");
  }else{
    middle.disconnect(treble);
    bass.disconnect(middle);
    bass.connect(treble);
    middleButton.innerHTML='Enable Middle';
    middleButton.setAttribute('active',"true");
  }
},false);
bassButton.addEventListener('click',function(){
  if(bassButton.getAttribute('active')==="true"){
    bass.gain.setValueAtTime(20,audioCtx.currentTime);
    console.log(bass.gain.value)
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

startCompressor.addEventListener('click',function(){
  ratio=document.getElementById("ratio").value;
  knee=document.getElementById("knee").value;
  attack=document.getElementById("attack").value;
  threshold=document.getElementById("threshold").value;
  release=document.getElementById("release").value;
  var msg;
  if(IsValid()){
    compressor.threshold.setValueAtTime(parseFloat(threshold), audioCtx.currentTime);
    compressor.knee.setValueAtTime(parseFloat(knee), audioCtx.currentTime);
    compressor.ratio.setValueAtTime(parseFloat(ratio), audioCtx.currentTime);
    compressor.attack.setValueAtTime(attack, audioCtx.currentTime);
    compressor.release.setValueAtTime(release, audioCtx.currentTime);
    msg="Success activation"
  }else{
    msg="Error with Attributes!"
  }
  document.getElementById("alarmmsg").innerHTML = msg;

  setTimeout(function(){
      document.getElementById("alarmmsg").innerHTML = '';
    }, 3000);
},false);

function IsValid(){
  return threshold>=-100 && threshold<=0 && knee>=0 && knee<=40 && ratio>=1 && ratio<=20 && attack>=0 && attack<=1 && release >=0 && release <=1;
}

compressorButton.addEventListener('click',function(){
    if(compressorButton.getAttribute('active')==="true"){
      gainNode.disconnect(audioCtx.destination);
      gainNode.connect(compressor);
      compressor.connect(audioCtx.destination);
        compressorButton.innerHTML='Disable compressor';
        compressorButton.setAttribute("active","false");
        attributes.style.display='block';
    }else{
        compressor.disconnect(audioCtx.destination);
        gainNode.disconnect(compressor);
        gainNode.connect(audioCtx.destination);
        compressorButton.innerHTML='Enable compressor'
        compressorButton.setAttribute("active","true");
        attributes.style.display='none';
    }
},false);


playButton.addEventListener('click', function() {
  if (audioCtx.state === 'suspended') {
       audioCtx.resume();
   }
    if(state==="stopped"){
        source=playSound(mybuffer);
        source.start();
        state="playing";
    }else{
        source.stop();
        state="stopped";
    }
},false);

volumeButton.addEventListener('input',function(){
        gainNode.gain.value=this.value/100;
        document.getElementById("volumedisplay").innerHTML = this.value;
},false)

function transferComplete(evt){
  document.getElementById("wait").innerHTML="Loading Completed";
  setTimeout(function(){
      document.getElementById("wait").innerHTML = '';
    }, 3000);
}
function loadSound(url){
    var req=new XMLHttpRequest();
    req.addEventListener("load",transferComplete);
    req.open('GET',url,true);
    //req.setRequestHeader('Access-Control-Allow-Origin', '*');
    var state=0
    req.responseType='arraybuffer';
    req.onload=function(){
        audioCtx.decodeAudioData(req.response,function(buffer){
            mybuffer=buffer;

        },function(e){ console.log("Error with decoding audio data" + e.err);state=1;});
    }

    req.send();


}

function playSound(buffer){

    analyser=audioCtx.createAnalyser();
    compressor= audioCtx.createDynamicsCompressor();
    bass=audioCtx.createBiquadFilter();
    treble=audioCtx.createBiquadFilter();
    middle=audioCtx.createBiquadFilter();
    gainNode=audioCtx.createGain();
    gainNode.gain.value=0.5;
    source=audioCtx.createBufferSource();
    analyser.smoothingTimeConstant = 0.6
    source.buffer=mybuffer;
    source.connect(bass);
    //analyser.connect(bass);
    bass.connect(treble);
    treble.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Manipulate the Biquad filter
    bass.type="lowshelf";
    bass.frequency.setValueAtTime(400,audioCtx.currentTime);
    bass.gain.setValueAtTime(0,audioCtx.currentTime);
    middle.frequency.setValueAtTime(1000,audioCtx.currentTime);
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
