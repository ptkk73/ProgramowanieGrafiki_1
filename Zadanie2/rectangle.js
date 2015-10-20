/**
 * Created by student on 2015-10-14.
 */
/**
 * Created by student on 2015-10-07.
 */


var time = 0.0;

function drawScene()
{

    var canvas = document.getElementById("myCanvasForRendering");
    var context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    drawCheckboard(context, canvas, time);
    drawClock(context, canvas, time);
    time += 16.0;

    window.requestAnimationFrame(drawScene);


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

function drawCheckboard(context, canvas, time)
{
    var CHSIZE = 100.0;

    var partsW = canvas.width / CHSIZE;
    var partH = canvas.height / CHSIZE;


    context.fillStyle = 'rgba(0, 0, 255, 1)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for ( var i = 0; i < partsW; i ++ )
    {
        for ( var u = 0; u < partH; u ++ )
        {
            if ( i % 2 == u % 2 ) {
                context.fillStyle = 'rgba(255, 0, 0, 0.3)';
                context.fillRect(i * CHSIZE, u * CHSIZE, CHSIZE, CHSIZE);
                context.fillStyle = 'rgba(255, 0, 0, 0.7)';
                context.fillRect(i * CHSIZE * (Math.abs(Math.sin(time * 0.0003) )  * 0.05 + 0.95 ),
                    u * CHSIZE * (Math.abs(Math.sin(time * 0.0003) )  * 0.05 + 0.95 ),
                    CHSIZE * (Math.abs(Math.sin(time * 0.0003) )  * 0.05 + 0.95 ),
                    CHSIZE * (Math.abs(Math.sin(time * 0.0003) )  * 0.05 + 0.95 ));
            }

        }
    }
}

function drawClock(context, canvas)
{

    var x = canvas.width * 0.5;
    var y = canvas.height * 0.5;

    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.strokeWidth = 16.0;
    drawEllipse(context, 373, 373,
        300, 300,
        'rgba(0, 0, 0, 1.0)', 'rgba(0, 0, 255, 1.0)');
    for ( var i = 0; i < 12; i ++ ) {

        var f = Math.PI / 6;


        drawEllipse(context, 500 - Math.sin(i * f + Math.PI + Math.PI /6) * 100,
            500 + Math.cos(i * f + Math.PI + Math.PI /6) * 100,
            45, 45,
            'rgba(40, 40, 40, 1.0)', 'rgba(0, 0, 0, 1.0)');
        context.fillStyle = 'rgba(255, 255, 255, 1)';
        context.font = "24px Arial";
        context.fillText((i + 1).toString(),500 - Math.sin(i * f + Math.PI + Math.PI /6) * 100 + 10, 500 + Math.cos(i * f + Math.PI + Math.PI /6) * 100 + 30);

    }
    var locTim = time - 60 * 60  * 5;

    context.fillStyle = 'rgba(255, 0, 0, 1.0)';
    context.strokeStyle = 'rgba(50, 150, 200, 1.0)';
    context.lineWidth = 7.0;
    context.moveTo(0, 0);
    context.beginPath();

    context.lineTo(520, 520);
    context.lineTo(520 - Math.sin(-locTim * 0.001 / 60.0 / 60.0 - Math.PI + Math.PI /6) * 100, 520 - Math.cos(-locTim / 60.0 / 60.0 * 0.001 / 60.0 + Math.PI + Math.PI /6) * 100 );
    context.closePath();
    context.stroke();


    context.fillStyle = 'rgba(255, 0, 0, 1.0)';
    context.strokeStyle = 'rgba(255, 150, 0, 1.0)';
    context.lineWidth = 4.0;
    context.moveTo(0, 0);
    context.beginPath();

    context.lineTo(520, 520);
    context.lineTo(520 - Math.sin(-locTim * 0.001 / 60.0 - Math.PI + Math.PI /6) * 100, 520 - Math.cos(-locTim / 60.0 * 0.001 / 60.0 + Math.PI + Math.PI /6) * 100 );
    context.closePath();
    context.stroke();


    context.strokeStyle = 'rgba(0, 150, 255, 1.0)';
    context.lineWidth = 2.0;
    context.moveTo(0, 0);
    context.beginPath();

    context.lineTo(520, 520);
    context.lineTo(520 - Math.sin(-locTim  * 0.001 - Math.PI + Math.PI /6) * 100, 520 - Math.cos(-locTim * 0.001 + Math.PI + Math.PI /6) * 100 );
    context.closePath();
    context.stroke();
}