//driver code
const myCanvas = document.getElementById("lander-canvas");
const ctx = myCanvas.getContext("2d");
var numNodes = 200; //number of nodes in simulation
var lineDistance = 25; //max distance to connect nodes
var lineWidth = 1;
//TODO: Add slider to change number of nodes and line distance

var nodeArray = []; //array to hold the node objects
var refRadius = 1;
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
var isUpdatingArray = false; //to prevent accessing undefined indexes
init();
refresh(100,100, (ctx,ratio, doUpdate)=>{
    if(!isUpdatingArray){
    update(ctx, ratio, doUpdate);
    }
});

//check radio selections
    var amounts = document.getElementsByName("amount-radio");
    var amountVal = amounts[3].value;
    for(let i = 0; i < amounts.length; ++i){
        amounts[i].addEventListener("click",()=>{
            if(amounts[i].value != amountVal){
                isUpdatingArray = true;
                amountVal = Number(amounts[i].value); //ensure value is treated as a number and not string
                updateNodeAmount(amountVal);
                isUpdatingArray = false;
            }
            //console.log(amountVal);
        });
    }
    var nodeLengths = document.getElementsByName("length-radio");
    var lengthVal = nodeLengths[0].value;
    for(let i = 0; i < nodeLengths.length; ++i){
        nodeLengths[i].addEventListener("click",()=>{
            if(nodeLengths[i].value != lengthVal){
                lengthVal = Number(nodeLengths[i].value);
                lineDistance = lengthVal;
                console.log(lineDistance);
            }
        });
    }

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
function updateNodeAmount(newAmount){
    if(newAmount > numNodes){
        for(let i = 0; i < (newAmount-numNodes); ++i){
            var node = {
                xCord: randomRangeInt(0 + nodeCordPadding, myCanvas.clientWidth - nodeCordPadding),
                yCord: randomRangeInt(0 + nodeCordPadding, myCanvas.clientHeight - nodeCordPadding),
                xVel: randomRangeInt(velocityRange[0], velocityRange[1])*Math.cos((Math.random()*2*Math.PI)),
                yVel: randomRangeInt(velocityRange[0], velocityRange[1])*Math.sin((Math.random()*2*Math.PI)),
            }
            nodeArray.push(node);
        }
    }else{
        for(let i = 0; i < (numNodes-newAmount); ++i){
            nodeArray.pop();
        }
    }
    numNodes = newAmount;
}
function update(ctx, ratio, doUpdate){
    if(doUpdate){
    updatePosition(ctx);
    }
    drawCanvas(ctx);
}

function updatePosition(ctx){
    for(let i = 0; i < numNodes; ++i){
        if(nodeArray[i]){
        keepInBounds(nodeArray[i]);
        nodeArray[i].xCord += ((nodeArray[i].xVel/velocityLimiter));
        nodeArray[i].yCord += ((nodeArray[i].yVel/velocityLimiter));
        }else{
            console.log(`Fail node: index ${i}`);
        }
    }
    // console.log(nodeArray[0].xCord);
}

function keepInBounds(node){
    if(!node){return;}
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
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = lineWidth;
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
        //resize nodes and node tethers
        //from 300-800 px screen sizes
        refRadius = scale(myCanvas.width,300, 800, 0.05, 1.0, true);
        lineWidth = scale(myCanvas.width,300, 800, 0.05, 1.0, true);
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
        //don't redraw while array is being changed by radio buttons
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

function scale (number, inMin, inMax, outMin, outMax, clamp=false) {
    if(!clamp){
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }else{
        if(number > inMax){
            return Math.min((number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin,outMax);
        }else if(number < inMin){
            return Math.max((number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin,outMin);
        }else{
            return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        }
    }
}
console.log(scale(700,300, 800, 0.1, 1.0, true));