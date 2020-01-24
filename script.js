
const algoCanvas = document.getElementById('algoCanvas');
const ctx = algoCanvas.getContext('2d');
const ctxDim = {width: 500, height: 500};
const ctxPad = 0.1;

Array.prototype.asyncForEach = async function (callback) {
  for (let index = 0; index < this.length; index++) {
    await callback(this[index], index, this);
  }
};

const wait = (ms) => new Promise(r => setTimeout(() => r(), ms ? ms : 100));

giftWrapping();


async function giftWrapping() {
  await wait(1000);

  let start = null;
  const drawInterval = 1000 / 10;
  let selectedPoint1 = null;
  let selectedPoint2 = null;
  const pointsOnHull = [];
  let checkLine1 = null;
  let checkLine2 = null;
  let done = false;
  const interval = setInterval(() => draw(), drawInterval);

  const numPoints = 10;
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: ctxDim.width * ctxPad + Math.random() * (ctxDim.width - (2 * ctxDim.width * ctxPad)),
      y: ctxDim.height * ctxPad + Math.random() * (ctxDim.height - (2 * ctxDim.height * ctxPad)),
    });
    await wait(75);
  }

  await wait(500);
  // find left most point
  let leftPoint = {x: ctxDim.width, y: ctxDim.height / 2};
  await points.asyncForEach(async(point) => {
    selectedPoint1 = point;
    if (point.x < leftPoint.x) {
      leftPoint = point;
      selectedPoint2 = point;
    }
    await wait(500);
  });
  selectedPoint2 = leftPoint;

  // find point on hull
  let currentPoint = leftPoint;
  selectedPoint2 = currentPoint;
  let nextPoint = points[0] !== currentPoint ? points[0] : points[1];
  do {
    pointsOnHull.push(currentPoint);
    console.log('pointsOnHull', pointsOnHull, pointsOnHull.length);
    await points.asyncForEach(async (point) => {
      if (currentPoint === point) {
        return;
      }
      selectedPoint1 = point;
      checkLine1 = [currentPoint, selectedPoint1];
      if (rightTurn(currentPoint, nextPoint, point)) {
        nextPoint = point;
        checkLine2 = [currentPoint, nextPoint];
      }
      await wait(500);
    });
    currentPoint = nextPoint;
    selectedPoint2 = currentPoint;
    nextPoint = pointsOnHull[0];
  } while (currentPoint !== pointsOnHull[0]);

  function rightTurn(a, b, right) {
    const m = [
      [1, a.x, a.y],        // a, b, c
      [1, b.x, b.y],        // d, e, f
      [1, right.x, right.y] // g, h, i
    ];
    // a(ei − fh) − b(di − fg) + c(dh − eg)
    let det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]);
    det += -m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

    console.log('rightTurn', det);
    return det >= 0;
  }

  selectedPoint1 = null;
  selectedPoint2 = null;
  checkLine1 = null;
  checkLine2 = null;
  done = true;
  clearInterval(interval);
  draw();
  console.log('pointsOnHull', pointsOnHull, pointsOnHull.length, 'done');

  function drawLine(a, b, lineWidth, color) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = 'lightgrey';
    ctx.beginPath();
    ctx.rect(0, 0, ctxDim.width, ctxDim.height);
    ctx.fill();

    const pointRadius = 5;
    const pointColor = 'black';
    const selectColor1 = 'blue';
    const selectColor2 = 'grey';
    const edgeColor = 'black';
    const lineWidth = 2;

    points.forEach((point) => {
      ctx.fillStyle = pointColor;
      if (point === selectedPoint1) {
        ctx.fillStyle = selectColor1;
      } else if (point === selectedPoint2) {
        ctx.fillStyle = selectColor2;
      }
      const circle = new Path2D();
      circle.moveTo(point.x, point.y);
      circle.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
      ctx.fill(circle);
    });

    if (pointsOnHull.length > 1) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = edgeColor;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pointsOnHull[0].x, pointsOnHull[0].y);
      pointsOnHull.forEach((point, index) => {
        const nextPoint = pointsOnHull[(index + 1) % pointsOnHull.length];
        if (index === 0) {
          return;
        }
        ctx.lineTo(point.x, point.y);
      });
      if (done) {
        ctx.lineTo(pointsOnHull[0].x, pointsOnHull[0].y);
      }
      ctx.stroke();
    }
    if (checkLine2) {
      drawLine(checkLine2[0], checkLine2[1], lineWidth, selectColor2);
    }
    if (checkLine1) {
      drawLine(checkLine1[0], checkLine1[1], lineWidth, selectColor1);
    }
  }

}
