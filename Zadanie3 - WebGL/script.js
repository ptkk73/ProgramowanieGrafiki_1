/**
 * Created by student on 2015-10-21.
 */

var VSHADER_SOURCE =
    'precision mediump float;' +
    'attribute vec3 vPos;' +
    'void main() {\n' +
    ' gl_Position = vec4(vPos * 100.0, 1.0) ; \n' +
    '} \n';

var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform float time; \n' +
    'void main() {\n' +
    ' gl_FragColor = vec4(sin(time), 1.0, 0.0, 1.0); \n' +
    '} \n';

var time = 0.0;
var uniform_time;
var attribute_vPos;
var gl;

var triangleBuffer;
var shaderId;
var triangleVerts =  [
    0.5, 0.4, 0.0,
    0.25, 0.8, 0.0,
    0.75, 0.8, 0.0
];

function buildTriangle() {

    triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerts), gl.STATIC_DRAW);
    triangleBuffer.itemSize = 3;
    triangleBuffer.numItems = 3;
}

function drawTriangle()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(attribute_vPos);
}

function update()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.useProgram(shaderId);

    gl.uniform1f(uniform_time, time);

    drawTriangle();

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

    buildTriangle();
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    time += 16.0;

    update();

}

