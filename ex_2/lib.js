let accuracy = 0.001; //this'll give the bezier 100 segments
let previousBezierPoint = {}
let vectors = []
let actions = []

const HEIGHT = 800
const WIDTH = 1200
// const STARTING_X = 100
const OFFSET = 200
function cleanCanvas() {
    /**
     * Clean the canvas
     * */
    let ctx = getContext();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function getLeftBaseCoordinate() {
    /**
     * Returns the left base coordinates of the page
     * */
    return myCanvas.offsetLeft + myCanvas.clientLeft;
}

function getTopBaseCoordinate() {
    /**
     * Returns the top base coordinates of the page
     * */
    return myCanvas.offsetTop + myCanvas.clientTop;
}

function getContext() {
    /**
     * Returns the canvas for drawing
     * */
    let c = document.getElementById("myCanvas");
    return c.getContext("2d");
}

function drawParallelogram(x1, y1, x2, y2, x3) {
    /**
     * Draw parallelogram in the requested coordinates
     * */
    const diff = x3 - x2;
    MyLine(x1, y1, x2, y1, 0, 0, 0)
    MyLine(x2, y1, x3, y2, 0, 0, 0)
    MyLine(x3, y2, x1 + diff, y2, 0, 0, 0)
    MyLine(x1 + diff, y2, x1, y1, 0, 0, 0)

}

function drawDiagonal(x1, y1, x2, y2) {
    /**
     * Draw diagonals on the requested coordinates
     * */
    MyLine(x1, y1, x2 + 40, y2, 0, 0, 255)
    MyLine(x2, y1, x1 + 40, y2, 0, 0, 255)
}

function drawPolygon(x1, x2, y1, y2) {
    drawDiagonal(x1, y1, x2, y2);
    drawParallelogram(x1, y1, x2, y2);
}

function getCircleDiameter(x2, x1, y2, y1) {
    /**
     * Return diameter of circle in the requested coordinates
     * */
    const diffX = Math.pow((x2 - x1 + 40), 2);
    const diffY = Math.pow((y2 - y1), 2);
    const diffs = diffX + diffY;
    return parseInt(Math.sqrt(diffs));
}

function MyCircle(circle) {
    /**
     * Draw circle based on center point and radius
     */
    const stepSize = 2 * Math.PI / 50;
    let angle = 0;
    let prevPx = -1, prevPy = -1, px = -1, py = -1;
    while (angle <= 2 * Math.PI) {
        // Loop until the angle is 2 Pi (360 degrees)
        px = (Math.sin(angle) * circle.radius) + circle.x;
        py = (-Math.cos(angle) * circle.radius) + circle.y;
        if (prevPx > -1 && prevPy > -1) {
            MyLine(prevPx, prevPy, px,py, 0, 0, 0);
        }
        prevPx = px;
        prevPy = py;
        angle = angle + stepSize;
    }
    // Last iteration to complete circle
    px = (Math.sin(angle) * circle.radius) + circle.x;
    py = (-Math.cos(angle) * circle.radius) + circle.y;
    MyLine(prevPx, prevPy, px,py, 0, 0, 0);
}

function drawCircle(x1, x2, y1, y2) {
    /**
     * Draw circle in the requested coordinates
     * */
    const radius = getCircleDiameter(x2, x1, y2, y1) / 2;
    const circle = {
        x: (x1 + x2 + 40) / 2,
        y: (y1 + y2) / 2,
        radius: radius
    }
    MyCircle(circle);

}

function getBezierPoints(t, p0, p1, p2, p3) {
    /**
     * Return bezier points on four points
     * */
    let cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;

    let cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;

    let x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    let y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

    return {x: x, y: y};
}

function divideIntoSegments(startPoint, endPoint) {
    /*
    * Returns four middle points between two points
    * */
    let {x: x1, y: y1} = startPoint;
    let {x: x2, y: y2} = endPoint;

    let dx = (x2 - x1) / 3;
    let dy = (y2 - y1) / 3;

    let interiorPoints = [];

    for (let i = 1; i < 3; i++)
        interiorPoints.push({x: x1 + i * dx, y: y1 + i * dy});

    return [startPoint, ...interiorPoints, endPoint];
}

function drawBezier(x1, x2, x3, x4, y1, y2, y3, y4) {
    /**
     * Draw Bezier
     * */
    let points = [{x: x1, y: y1}, {x: x2, y: y2}, {x: x3, y: y3}, {x: x4, y: y4}];

    // Based on accuracy, render the bezier points
    for (let i = 0; i < 1 + accuracy; i += accuracy) {
        // i == t
        const p = getBezierPoints(i, points[0], points[1], points[2], points[3]);
        if (previousBezierPoint.x && previousBezierPoint.y) {
            MyLine(previousBezierPoint.x, previousBezierPoint.y, p.x, p.y, 0, 0, 0)
        }
        previousBezierPoint = p;
    }
}

function getErrorInterval(dy1, dx1) {
    let px = 2 * dy1 - dx1;
    let py = 2 * dx1 - dy1;
    return {px, py};
}

function MyLine(x1, y1, x2, y2, r, g, b) {
    // console.log("drawing line", {x1, y1, x2, y2})
    vectors.push({
        x1, y1, x2, y2
    })
    /**
     * Renders a line in the requestedd coordinates and colors
     */
    let x, y, dx, dy, dx1, dy1, xe, ye, i;

    // Calculate the deltas
    dx = x2 - x1;
    dy = y2 - y1;

    // Calculates the absolute value of the deltas
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);


    // Calculates error intervals for both axis
    const errorInterval = getErrorInterval(dy1, dx1);


    // Computes the dominant axis
    if (dy1 <= dx1) {

        if (dx >= 0) {
            // Line is drawn left to right
            x = x1; y = y1; xe = x2;
        } else {
            // Line is drawn right to left
            x = x2; y = y2; xe = x1;
        }
        pixel(x, y, r, g, b);

        // Rasterize the line
        for (i = 0; x < xe; i++) {
            x = x + 1;

            // Deal with octants...
            if (errorInterval.px < 0) {
                errorInterval.px = errorInterval.px + 2 * dy1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    y = y + 1;
                } else {
                    y = y - 1;
                }
                errorInterval.px = errorInterval.px + 2 * (dy1 - dx1);
            }

            // Draw pixel from line span at
            // currently rasterized position
            pixel(x, y, r, g, b);
        }
    } else {
        // The line is Y-axis dominant
        // Line is drawn bottom to top
        if (dy >= 0) {
            x = x1; y = y1; ye = y2;
        } else { // Line is drawn top to bottom
            x = x2; y = y2; ye = y1;
        }
        pixel(x, y, r, g, b);
        // Rasterize the line
        for (i = 0; y < ye; i++) {
            y = y + 1;
            // Deal with octants...
            if (errorInterval.py <= 0) {
                errorInterval.py = errorInterval.py + 2 * dx1;
            } else {
                if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                    x = x + 1;
                } else {
                    x = x - 1;
                }
                errorInterval.py = errorInterval.py + 2 * (dx1 - dy1);
            }
            // currently rasterized position
            pixel(x, y, r, g, b);
        }
    }
}

function pixel(x, y, r, g, b) {
    var ctx = getContext();
    var imgData = ctx.createImageData(1, 1);
    var i;
    for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = r;
        imgData.data[i+1] = g;
        imgData.data[i+2] = b;
        imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, x, y);
}


function renderCircles(list) {
    for (const i in list) {
        MyCircle(list[i])
    }
}



function renderLines(list) {
    for (const i in list) {
        const {x1, y1, x2, y2} = list[i];
        MyLine(x1, y1, x2, y2, 0, 0, 0);
    }
}

function renderParallelograms(list) {
    for (const i in list) {
        const {x1, y1, x2, y2, x3} = list[i];
        drawParallelogram(x1, y1, x2, y2 ,x3);
    }
}

function renderCurves(list) {
    for (const i in list) {
        const {x1, y1, x2, y2, x3, y3, x4, y4} = list[i];
        drawBezier(x1, x2, x3, x4, y1, y2, y3, y4);
        previousBezierPoint = {}
    }
}


function move (x, y) {
    actions.push({x, y})
    if (actions.length > 1) {
        cleanCanvas();
        const dX = actions[1].x - actions[0].x
        const dY = actions[1].y - actions[0].y
        for (const i in vectors) {
            vectors[i].x1 += dX
            vectors[i].y1 += dY
            vectors[i].x2 += dX
            vectors[i].y2 += dY
            MyLine(vectors[i].x1, vectors[i].y1, vectors[i].x2, vectors[i].y2, 0 ,0, 0)
        }
        actions = []
    }
    console.log("finish move");
}


function scale () {
    cleanCanvas();
    const vectorCpy = [...vectors];
    vectors = [];
    for (const i in vectorCpy) {
        vectorCpy[i].x1 *= 0.5
        vectorCpy[i].y1 *= 0.5
        vectorCpy[i].x2 *= 0.5
        vectorCpy[i].y2 *= 0.5
        MyLine(vectorCpy[i].x1, vectorCpy[i].y1, vectorCpy[i].x2, vectorCpy[i].y2, 0 ,0, 0)
    }
    console.log("finish scale");
}


function rotate () {
    cleanCanvas();
    const vectorCpy = [...vectors];
    vectors = [];
    // const angle = 0.698132;
    var pi = Math.PI;
    const degrees = 40
    const angle = degrees * (pi/180);
    // const angle = 3.141593;
    for (const i in vectorCpy) {

        const x1 = vectorCpy[i].x1 * Math.cos(angle)
        const x2 = vectorCpy[i].x2 * Math.cos(angle)
        const y1 = vectorCpy[i].y1 * Math.sin(angle)
        const y2 = vectorCpy[i].y2 * Math.sin(angle)

        const x1t = x1 * Math.cos(angle) - y1 * Math.sin(angle)
        const x2t = x2 * Math.cos(angle) - y2 * Math.sin(angle)
        const y1t = y1 * Math.cos(angle) + x1 * Math.sin(angle)
        const y2t = y2 * Math.cos(angle) + x2 * Math.sin(angle)

        vectorCpy[i].x1 = x1t
        vectorCpy[i].y1 = y1t
        vectorCpy[i].x2 = x2t
        vectorCpy[i].y2 = y2t

        MyLine(vectorCpy[i].x1, vectorCpy[i].y1, vectorCpy[i].x2, vectorCpy[i].y2, 0 ,0, 0)
    }
    console.log("finish rotate");
}


function mirrorY (offsetX, offsetY) {
    console.log(offsetX)
    cleanCanvas();
    const vectorCpy = [...vectors];
    vectors = [];
    for (const i in vectorCpy) {
        const x1 = vectorCpy[i].x1
        const y1 = vectorCpy[i].y1
        const x2 = vectorCpy[i].x2
        const y2 = vectorCpy[i].y2
        vectorCpy[i].x1 = WIDTH + OFFSET - x1
        vectorCpy[i].x2 = WIDTH + OFFSET - x2
        MyLine(vectorCpy[i].x1, vectorCpy[i].y1, vectorCpy[i].x2, vectorCpy[i].y2, 0 ,0, 0)
    }
    console.log("finish scale");
}

function mirrorX (offsetX, offsetY) {
    cleanCanvas();
    const vectorCpy = [...vectors];
    vectors = [];
    for (const i in vectorCpy) {
        const x1 = vectorCpy[i].x1
        const y1 = vectorCpy[i].y1
        const x2 = vectorCpy[i].x2
        const y2 = vectorCpy[i].y2
        vectorCpy[i].y1 = HEIGHT - y1
        vectorCpy[i].y2 = HEIGHT - y2
        MyLine(vectorCpy[i].x1, vectorCpy[i].y1, vectorCpy[i].x2, vectorCpy[i].y2, 0 ,0, 0)
    }
    console.log("finish scale");
}

function mirrorXY (offsetX, offsetY) {
    cleanCanvas();
    const vectorCpy = [...vectors];
    vectors = [];
    for (const i in vectorCpy) {
        const x1 = vectorCpy[i].x1
        const y1 = vectorCpy[i].y1
        const x2 = vectorCpy[i].x2
        const y2 = vectorCpy[i].y2
        vectorCpy[i].x1 = WIDTH + OFFSET - x1
        vectorCpy[i].y1 = HEIGHT - y1
        vectorCpy[i].x2 = WIDTH + OFFSET - x2
        vectorCpy[i].y2 = HEIGHT - y2
        MyLine(vectorCpy[i].x1, vectorCpy[i].y1, vectorCpy[i].x2, vectorCpy[i].y2, 0 ,0, 0)
    }
    console.log("finish scale");
}
