const c = 299792458

// Setup canvas and axis
function resize(){
    let c = document.getElementById("canvas");
    c.width = document.body.clientWidth;
    c.height = document.body.clientHeight;
}

resize();

let events = []
let lines = []
let canvas = new fabric.Canvas('canvas', {
    selection:false,
    hasControls: false
});
let lineStart = null;

function drawAxis(){
    let line = new fabric.Line([canvas.width/2 - 500,canvas.height/2,canvas.width/2 + 500, canvas.height/2], {
        stroke: 'black'
    });
    let line2 = new fabric.Line([canvas.width/2,canvas.height/2-300,canvas.width/2, canvas.height/2  + 300], {
        stroke: 'black'
    });

    canvas.add(line);
    canvas.add(line2);
}

drawAxis();

let selectedTool = null;
const tools = ['drag-tool', 'line-tool', 'event-tool', 'boost-tool']

function setUpToolbar(){
    tools.forEach((e) => {
        let currentTool = document.getElementById(e);
        currentTool.addEventListener('click', () => {
            selectedTool.classList.remove('selected');
            currentTool.classList.add('selected');
            selectedTool = currentTool;

            if(e == 'drag-tool'){
                console.log(fabric.Line)
                console.log(fabric.Line.prototype)
                fabric.Line.prototype.hasBorders = true;
                fabric.Line.prototype.hasControls = true;
                fabric.Line.prototype.lockMovementX = false;
                fabric.Line.prototype.lockMovementY = false;
            } else {
                fabric.Line.prototype.hasBorders = false;
                fabric.Line.prototype.hasControls =  false;
                fabric.Line.prototype.lockMovementX = true;
                fabric.Line.prototype.lockMovementY = true;
            }
        })
    });
    selectedTool = document.getElementById(tools[0]);
    selectedTool.classList.add('selected');
}

setUpToolbar();



function onMouseDown(e){
    let pointer = this.getPointer(e);
    if(selectedTool.id === 'line-tool'){
        
    } else if(selectedTool.id === 'event-tool'){
        let circle = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            fill: 'red',
            radius: 3,
            hasControls: false,
            hasBorders: false
        });
        this.add(circle);
        events.push(circle);
        console.log();
    } else if(selectedTool.id === 'boost-tool'){

    }

}

function onMouseUp(e){
    let pointer = this.getPointer(e);
    if(selectedTool.id === 'line-tool'){
        if(lineStart){
            let line = new fabric.Line(lineStart.concat([pointer.x, pointer.y]), {
                stroke: 'red',
                hasControls: false
            });
            canvas.add(line);
            lines.push(line);
            lineStart = null;
        } else {
            lineStart = [pointer.x, pointer.y]
        }
    }
}

canvas.on('mouse:down', onMouseDown);
canvas.on('mouse:up', onMouseUp);



function boost(v){
    beta = v / c;
    gamma = Math.sqrt(1 - v**2/c**2);

    // returns ctPrime, xPrime
    function lorentz(ct, x){
        return [gamma * (ct - beta * x), gamma * (x - beta * ct)]
    }
    // convert a circle to a new circle with updated position (ct, x)
    function boostEvent(event){
        let ct = event.left - canvas.width/2;
        let x = canvas.height/2 - event.top;

        let [ctPrime, xPrime] = lorentz(ct, x);

        event.left = ctPrime + canvas.width/2;
        event.top = canvas.height/2 - xPrime;
    }

    function boostLine(line){
        let ct = line.x1 - canvas.width/2;
        let x = canvas.height/2 - line.y1;
        let [ctPrime, xPrime] = lorentz(ct, x);
        line.set({'x1': ctPrime + canvas.width/2, 'y1': canvas.height/2 - xPrime});

        ct = line.x2 - canvas.width/2;
        x = canvas.height/2 - line.y2;
        [ctPrime, xPrime] = lorentz(ct, x);
        line.set({'x2': ctPrime + canvas.width/2, 'y2': canvas.height/2 - xPrime});
    }

    events.forEach((e) => {
        boostEvent(e);
    })
    lines.forEach((l) => {
        boostLine(l);
    });
    canvas.renderAll();
}
