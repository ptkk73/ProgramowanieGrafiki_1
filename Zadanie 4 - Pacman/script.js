/**
 * Created by student on 2015-10-21.
 */
var VSHADER_SOURCE =
    'precision mediump float; \n' +
    'uniform float time; \n' +
    'uniform vec2 mPos; \n' +
    'uniform mat4 matrixProj; \n' +
    'uniform mat4 matrixMv; \n' +
    'attribute vec3 vPos; \n' +
    'void main() { \n' +
    ' gl_Position = matrixProj * vec4( vPos.xy, -50, 1); } \n'; //+
    //'} \n';

var FSHADER_SOURCE =
    'precision mediump float; \n' +
    'uniform float time; \n' +
    'void main() { \n' +
    ' gl_FragColor = vec4(1.0, sin(time * 0.001) * 0.5 + 0.5, abs(sin(time * 0.002)), 1.0); \n' +
    '} \n';

var cursorX = 0.0;
var cursorY = 0.0;

var canvasx = 0.0;
var canvasy = 0.0;

var time = 0.0;
var uniform_time;
var uniform_mpos;
var uniform_matrixProj;
var uniform_matrixView;
var attribute_vPos;
var gl;

var modelViewPersp;

var pMatrix;
var mvMatrix;

var vBuffer;
var gridBuffer;
var shaderId;
var pointVerts =  [
    100, 200, 0,
    300, 100, 0,
    400, 700, 0,
    20, 500, 0,
    800, 300, 0
];

var pacmanVerts =  [];

function toRad(d)
{
    return d * Math.PI / 180.0;
}

function makePerspective(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
};

function buildGridBuffer()
{
    pointVerts = [
        -1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        0.0, -1.0, 0.0,
        0.0, 1.0, 0.0,

        0.0, 0.0, -1.0,
        0.0, 0.0, 1.0
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointVerts), gl.DYNAMIC_DRAW);
    gridBuffer.itemSize = 3;
    gridBuffer.numItems = 6;
}

function buildPacmanBuffer(time) {

    pacmanVerts = [];
    pacmanVerts.push(0, 0, 0);

    var PRECISION = 300;
    var mouthDilationDeg = toRad(60.0 * Math.abs(Math.sin(time * 0.005)));
    var startAngle = Math.PI * 0.5 + (mouthDilationDeg ) * 0.5;


    for ( var i = 0; i < PRECISION; i ++)
    {
        var step = ( i * (Math.PI * 2.0 - mouthDilationDeg) / PRECISION);
        var currDeg = startAngle + step;
        pacmanVerts.push(Math.sin(currDeg), Math.cos(currDeg), 0 );
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pacmanVerts), gl.DYNAMIC_DRAW);
    vBuffer.itemSize = 3;
    vBuffer.numItems = PRECISION + 1;
}

function drawGrid()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, gridBuffer.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}

function draw()
{
    drawGrid();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vBuffer.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}

function update()
{
    time += 16.666;

    buildPacmanBuffer(time);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.useProgram(shaderId);

    gl.uniform1f(uniform_time, time);
    gl.uniform2f(uniform_mpos, cursorX - 669.0, cursorY - 550.0);
    gl.uniformMatrix4fv(uniform_matrixProj, false, modelViewPersp);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);

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


    document.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvasx = canvas.width;
    canvasy = canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);

    pMatrix = mat4.create();
    mat4.identity(pMatrix);
    mvMatrix = mat4.create();
    pMatrix = makePerspective(toRad(45.0), canvas.width / canvas.height, 0.1, 100.0);

    mat4.identity(mvMatrix); // Set to identity
    //mat4.translate(mvMatrix, [0, 0, -100]); // Translate back 10 units
    mat4.lookAt(mvMatrix, [0, 0, -100], [0, 0, 0], [0, 1, 0]);
    modelViewPersp = mat4.create();

    mat4.multiply(mvMatrix, pMatrix, modelViewPersp); // Sets modelViewPersp to modelView * persp

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
    uniform_mpos = gl.getUniformLocation(shaderId, "mPos");
    uniform_matrixProj = gl.getUniformLocation(shaderId, "matrixProj");
    uniform_matrixView =  gl.getUniformLocation(shaderId, "matrixMv");

    gridBuffer = gl.createBuffer();
    buildGridBuffer();
    vBuffer = gl.createBuffer();
    buildPacmanBuffer();
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    time += 16.0;

    update();

}

