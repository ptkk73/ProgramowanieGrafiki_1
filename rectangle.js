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



    for (  )


}