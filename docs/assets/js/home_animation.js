//driver code
const myCanvas = document.getElementById("lander-canvas");
const ctx = myCanvas.getContext("2d");
var numNodes = 50;
var lineDistance = 150; //max distance to connect nodes
var nodeArray = []; //array to hold the node objects
const refRadius = 1;
var radiusTolerance = refRadius+1;
const nodeCordPadding = 5;
const velocityRange = [5,10]; //in pixel per second
const velocityLimiter = 10; //less means faster movement
const fps = 30; //30 seems to be a good balance for slower and faster screens
const interval = Math.floor(1000/fps);
var startTime = performance.now();
var previousTime = startTime;
var currentTime = 0;
var deltaTime = 0;
init();
refresh(100,100, (ctx,ratio, doUpdate)=>{
    update(ctx, ratio, doUpdate);
});




//function declarations
function init(){
    //for now, radius = 3;
    for(let i = 0; i < numNodes; ++i){
        var node = {
            xCord: randomRangeInt(0 + nodeCordPadding, myCanvas.clientWidth - nodeCordPadding),
            yCord: randomRangeInt(0 + nodeCordPadding, myCanvas.clientHeight - nodeCordPadding),
            xVel: randomRangeInt(velocityRange[0], velocityRange[1])*Math.cos((Math.random()*2*Math.PI)),
            yVel: randomRangeInt(velocityRange[0], velocityRange[1])*Math.sin((Math.random()*2*Math.PI)),
        }
        //console.log(node.xCord);
        nodeArray.push(node);
    }
}
function update(ctx, ratio, doUpdate){
    if(doUpdate){
    updatePosition(ctx);
    }
    drawCanvas(ctx);
}

function updatePosition(ctx){
    for(let i = 0; i < numNodes; ++i){
        keepInBounds(nodeArray[i]);
        nodeArray[i].xCord += ((nodeArray[i].xVel/velocityLimiter));
        nodeArray[i].yCord += ((nodeArray[i].yVel/velocityLimiter));
    }
    // console.log(nodeArray[0].xCord);
}

function keepInBounds(node){
    if(node.xCord + ((node.xVel/velocityLimiter))<= radiusTolerance){
        node.xVel = -node.xVel;
    }else if(node.xCord + ((node.xVel/velocityLimiter))>= myCanvas.width-radiusTolerance){
        node.xVel = -node.xVel;
    }
    if(node.yCord + ((node.yVel/velocityLimiter))<= radiusTolerance){
        node.yVel = -node.yVel;
    }else if(node.yCord + ((node.yVel/velocityLimiter))>= myCanvas.height-radiusTolerance){
        node.yVel = -node.yVel;
    }
}

function drawCanvas(ctx){
    let alphaValue = 1.0;
    ctx.clearRect(0,0, myCanvas.width, myCanvas.height);
    ctx.globalCompositeOperation = "lighter";
    for(let i = 0; i < numNodes; ++i){
        ctx.beginPath();
        ctx.arc(nodeArray[i].xCord, nodeArray[i].yCord, refRadius, 0, 2 * Math.PI);
        //ctx.lineWidth = 1;
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        //draw connecting lines for current node
        for(let j = 0; j < numNodes; ++j){
            if(nodeArray[i]!=nodeArray[j]){
                if(distanceBtwnNodes(nodeArray[i],nodeArray[j])<lineDistance){
                    ctx.beginPath();
                    ctx.moveTo(nodeArray[i].xCord, nodeArray[i].yCord);
                    ctx.lineTo(nodeArray[j].xCord, nodeArray[j].yCord);
                    alphaValue = scale(distanceBtwnNodes(nodeArray[i],nodeArray[j]),0,lineDistance,1.0,0.0);
                    ctx.strokeStyle = `rgba(255,255,0, ${alphaValue})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }
}

function refresh(referenceWidth, referenceHeight, drawFunction, timestamp) {
    if(myCanvas.clientWidth != myCanvas.width || myCanvas.clientHeight != myCanvas.height){
        myCanvas.width = myCanvas.clientWidth;
        myCanvas.height = myCanvas.clientHeight;
        for(let i = 0; i < numNodes; ++i){
            if((nodeArray[i].xCord <= myCanvas.width + radiusTolerance) && (nodeArray[i].xCord >= myCanvas.width - radiusTolerance)){
                nodeArray[i].xCord += 2 * radiusTolerance;
                //prevent nodes getting stuck in screen width while resizing screen
                //also allows for fun interactions with nodes when stretching screen
            }
        }
    }
    const ratio = Math.min(
      myCanvas.width / referenceWidth,
      myCanvas.height / referenceHeight
    );
    ctx.scale(ratio, ratio);
    currentTime = timestamp;
    deltaTime = currentTime - previousTime;
    if(deltaTime > interval){
        previousTime = currentTime - (deltaTime % interval);
        drawFunction(ctx, ratio, true);
    }else{
        drawFunction(ctx, ratio, false);
    }
    requestAnimationFrame((time) => {
        refresh(referenceWidth, referenceHeight, drawFunction, time);
      });
  }

//helper functions
function randomRangeInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distanceBtwnNodes(node1, node2){
    var xs = 0;
    var ys = 0;
    xs = node2.xCord - node1.xCord;
    xs = xs * xs;
    ys = node2.yCord - node1.yCord;
    ys = ys * ys;
    return Math.sqrt( xs + ys );
}

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}