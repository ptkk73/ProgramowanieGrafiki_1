/**
 * Created by student on 2015-10-07.
 */

var x = 600;
function drawTriangle(context, x, y, size)
{
    context.moveTo(x, y);
    context.beginPath();
    context.lineTo(x + size * 2, y);
    context.lineTo(x + size, y - size);
    context.lineTo(x, y);
    context.closePath();
    context.fill();
}

function lt(context, x, y)
{
    context.lineTo(x, y);
}
function drawMainFunction()
{
    drawElephant();
}
function drawRectangle()
{
    var canvas = document.getElementById("myCanvasForRendering");
    var context = canvas.getContext('2d');


    context.fillStyle = 'rgba(226, 156, 56, 1.0)';
    context.fillRect(600, 200, 600, 300);

    context.fillStyle = 'rgba(0, 0, 255, 1.0)';
    context.fillRect(400, 130, 400, 200);

    context.fillStyle = 'rgba(0, 122, 255, 1.0)';
    context.fillRect(900, 430, 50, 100);

    context.fillStyle = 'rgba(0, 122, 255, 1.0)';
    context.fillRect(1100, 430, 50, 100);

    context.fillStyle = 'rgba(122, 255, 0, 1.0)';
    drawTriangle(context, 400, 200, 100);
    drawTriangle(context, 600, 200, 100);

    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    for ( var i = 0 ; i < 19; i ++ ) {
        drawTriangle(context, 400 + i * 20, 300, 10);
        drawTriangle(context, 420 + i * 20, 300, 10);
    }




    context.fillStyle = 'rgba(56, 56, 56, 1.0)';
    context.moveTo(500, 200);
    context.beginPath();
    lt(context, 450, 220);
    lt(context, 420, 280);
    lt(context, 380, 400);
    lt(context, 360, 420);
    lt(context, 320, 460);
    lt(context, 310, 506);
    lt(context, 330, 506);
    lt(context, 350, 400);
    lt(context, 500, 200);
    context.closePath();
    context.fill();


    context.fillStyle = 'rgba(56, 56, 56, 1.0)';
    context.moveTo(500, 200);
    context.beginPath();
    lt(context,870 +  450, 750 - 220);
    lt(context,870 +  420, 750 - 280);
    lt(context,870 +  380, 750 - 400);
    lt(context,870 +  360, 750 - 420);
    lt(context,870 +  320, 750 - 460);
    lt(context,870 +  310, 750 - 506);
    lt(context,870 +  330, 750 - 506);
    lt(context,870 +  350, 750 - 400);
    lt(context,870 +  500, 750 - 200);
    context.closePath();
    context.fill();



}

function setFill(context, x)
{
    context.fillStyle = x;
}

function drawEllipse(ctx, x, y, w, h, fillColor, strokeColor) {
    var kappa = .5522848,
        ox = (w / 2) * kappa,
        oy = (h / 2) * kappa,
        xe = x + w,
        ye = y + h,
        xm = x + w / 2,
        ym = y + h / 2;

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}


function drawEnvironment(context, canvas)
{




    drawGrass(context, canvas);
}

function drawGrass(context, canvas)
{
    context.fillStyle = 'rgba(10, 200, 60, 1.0)';
    context.fillRect(0, canvas.height - 200, canvas.width, 200);
}
function drawSun(context, canvas)
{
    // draw rays
    context.beginPath();
    context.fillStyle = 'rgba(200, 220, 20, 0.4)';
    var x = canvas.width - 800;
    var y = 260;
    context.moveTo(x, y);
    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x + 100 * 1.9, y);
    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x + 160 * 1.9, y + 50 * 1.9);

    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x + 200 * 1.9, y + 150 * 1.9);
    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x + 140 * 1.9, y + 220 * 1.9);
    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x + 80 * 1.9, y + 200 * 1.9);

    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x + 40 * 1.9, y + 100 * 1.9);
    context.bezierCurveTo(x + 800, y - 200, x + 800, y - 240,x , y );

    context.fill();
    context.strokeStyle = 'rgba(260, 160, 40, 0.1)';
    context.stroke();


    // drawSun
    drawEllipse(context, canvas.width - 300, 60, 200, 170, 'rgba(200, 220, 20, 1.0)', 'rgba(260, 160, 40, 0.40)');
}
function drawGrassOverlay(context, canvas)
{
    var scale = 1.0;
    for ( var i = 0; i < 50; i ++ )
    {
        // draw straw
        context.fillStyle = 'rgba(50, 60, 20, 1.0)';
        //context.fillRect(100 + i * 30.0, 100, 100, 100);
        var x = i * 30.0;
        var y = canvas.height - 200 + (i % 5) * 30.0;
        context.fillRect(x , y , 10 * scale, 40 * scale);
        drawEllipse(context,x - 10 * scale, y - 50 * scale, 30 * scale, 60 * scale, 'rgba(10, 120, 20, 1.0)', 'rgba(10, 80, 20, 1.0)');
    }
}

function drawSky(context, canvas)
{
    context.fillStyle = 'rgba(144, 256, 255, 1.0)';
    context.fillRect(0, 0, canvas.width, canvas.height);



}

function drawScene()
{
    var canvas = document.getElementById("myCanvasForRendering");
    var context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawSky(context, canvas);

    drawEnvironment(context, canvas);

    drawElephant(context);


    drawGrassOverlay(context, canvas);

    drawSun(context, canvas);
}

function drawElephant(context) {

    var x = 800;
    var y = 400;




    context.beginPath();
    context.fillStyle = 'rgba(100, 100, 100, 1.0)';

    context.moveTo(x, y);
    context.bezierCurveTo(x + 100, y, x + 100, y,x + 100, y);
    context.bezierCurveTo(x + 160, y + 50, x + 160, y + 50,x + 160, y + 50);

    context.bezierCurveTo(x + 200, y + 150, x + 200, y + 150,x + 200, y + 150);
    context.bezierCurveTo(x + 140, y + 22, x + 140, y + 22,x + 140, y + 220);
    context.bezierCurveTo(x + 80, y + 160, x + 80, y + 160,x + 80, y + 160);

    context.bezierCurveTo(x - 120, y + 160, x - 120, y + 160,x - 120, y + 160);

    context.bezierCurveTo(x - 190, y + 220, x - 190, y + 220,x - 190, y + 220);

    context.bezierCurveTo(x - 230, y + 110, x - 230, y + 110,x - 230, y + 110);

    context.bezierCurveTo(x - 200, y + 20, x - 200, y + 20,x - 200, y + 20);

    context.fill();
    context.strokeStyle = 'rgba(60, 60, 60, 1.0)';
    context.stroke();


    // ear
    drawEllipse(context, x - 255, y - 145 , 90, 160, 'rgba(85, 85, 85, 1.0)' ,'rgba(60, 60, 60, 1.0)');
    // head
    drawEllipse(context, x - 320, y - 50 , 240, 160, 'rgba(100, 100, 100, 1.0)' ,'rgba(60, 60, 60, 1.0)');


    // ear
    drawEllipse(context, x - 240, y - 130 , 90, 160, 'rgba(90, 90, 90, 1.0)' ,'rgba(60, 60, 60, 1.0)');
    // ear
    drawEllipse(context, x - 235, y - 95 , 70, 130, 'rgba(70, 70, 70, 1.0)' ,'rgba(60, 60, 60, 1.0)');

    drawEllipse(context, x - 290, y - 28, 30, 30, 'rgba(222, 222, 222, 1.0)', 'rgba(70, 70, 70, 1.0)' );
    drawEllipse(context, x - 290, y - 28, 20, 20, 'rgba(0, 0, 0, 1.0)', 'rgba(20, 20, 20, 1.0)' );



    // traaaaaaaaba

    var tx = x - 280;
    var ty = y + 40;


    context.beginPath();
    context.fillStyle = 'rgba(100, 100, 100, 1.0)';
    context.moveTo(tx, ty);

    context.bezierCurveTo(tx - 50, ty - 80, tx - 50, ty - 80, tx - 50, ty - 80);

    context.bezierCurveTo(tx - 60, ty - 94, tx - 60, ty - 90, tx - 60, ty - 90);
    context.bezierCurveTo(tx - 80, ty - 120, tx - 80, ty - 120, tx - 80, ty - 120)
    context.bezierCurveTo(tx - 110, ty - 220,tx - 90, ty - 180, tx - 100, ty - 200);
    context.bezierCurveTo(tx - 140, ty - 185, tx - 140, ty - 195, tx - 140, ty - 195);
    context.bezierCurveTo(tx - 110, ty - 130, tx - 110, ty - 130, tx - 110, ty - 130);
    context.bezierCurveTo(tx - 70, ty - 70, tx - 70, ty - 70, tx - 70, ty - 70);
    context.bezierCurveTo(tx - 35, ty - 20, tx - 40, ty - 20, tx - 40, ty - 20);
    context.bezierCurveTo(tx, ty, tx, ty, tx, ty);

    context.fill();
    context.strokeStyle = 'rgba(60, 60, 60, 0.2)';
    context.stroke();
}

