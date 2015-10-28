/**
 * Created by student on 2015-10-21.
 */

var VSHADER_SOURCE =
    'precision mediump float; \n' +
    'uniform float time; \n' +
    'attribute vec2 vPos; \n' +
    'void main() { \n' +
    ' gl_PointSize = 20.0 * abs(sin(time * 0.002)); \n' +
    ' gl_Position = vec4(vPos * sin(time * 0.002), 0, 800.0 + sin(time * 0.0005) * 400.0) ;} \n'; //+
    //'} \n';

var FSHADER_SOURCE =
    'precision mediump float; \n' +
    'uniform float time; \n' +
    'void main() { \n' +
    ' gl_FragColor = vec4(1.0, sin(time * 0.001) * 0.5 + 0.5, abs(sin(time * 0.002)), 1.0); \n' +
    '} \n';


var time = 0.0;
var uniform_time;
var attribute_vPos;
var gl;

var vBuffer;
var shaderId;
var pointVerts =  [
    100, 200,
    300, 100,
    400, 700,
    20, 500,
    800, 300
];

function buildBuffer() {


    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointVerts), gl.DYNAMIC_DRAW);
    vBuffer.itemSize = 2;
    vBuffer.numItems = 5;
}

function draw()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, 5);
    gl.disableVertexAttribArray(attribute_vPos);
}

function randomizePoints()
{
    pointVerts = [];
    for ( var i = 0; i < 5; i ++ )
    {
        pointVerts.push(Math.random() * 800.0);
        pointVerts.push(Math.random() * 600.0);
    }
    buildBuffer();
}


function update()
{
    time += 16.666;
    if ( Math.abs(Math.sin(time * 0.002)) < 0.01 )
        randomizePoints();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.useProgram(shaderId);


    gl.uniform1f(uniform_time, time);

    draw();

    gl.flush();


    window.requestAnimationFrame(update);
}

function printShaderStatus(shader)
{
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    console.log('Shader compiled successfully: ' + compiled);
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log('Shader compiler log: ' + compilationLog);
}
function drawScene()
{

    var canvas = document.getElementById("myCanvasForRendering");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if ( !gl )
    {
        alert('something went to hell');
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);


    var fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, FSHADER_SOURCE);
    gl.compileShader(fShader);
    printShaderStatus(fShader);

    var vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, VSHADER_SOURCE);
    gl.compileShader(vShader);
    printShaderStatus(vShader);
    //alert(gl.getError());

    shaderId = gl.createProgram();
    gl.attachShader(shaderId, vShader);
    gl.attachShader(shaderId, fShader);
    gl.linkProgram(shaderId);


    gl.useProgram(shaderId);
    gl.program = shaderId;

    uniform_time = gl.getUniformLocation(shaderId, "time");
    attribute_vPos = gl.getAttribLocation(shaderId, "vPos");
    vBuffer = gl.createBuffer();
    buildBuffer();
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    time += 16.0;

    update();

}

