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
    'attribute vec3 vColor; \n' +
    'attribute vec2 vTex; \r\n' +
    'varying vec2 varTex; \n' +
    'varying vec3 varCol; \n' +
    'void main() { \n' +

    ' gl_Position = matrixProj * matrixMv * vec4( vPos.xyz, 1.0); \r\n' +
    'varCol = vColor; \n' +
    'varTex = vTex; \n' +
    '} \n'; //+
//'} \n';

var FSHADER_SOURCE =

    'precision mediump float; \n' +
    'uniform float time; \n' +
    'uniform sampler2D tex; \n' +
    'uniform sampler2D tex2; \n' +
    'uniform vec3 col; \n' +
    'uniform vec2 mPos; \n' +
    'uniform float isTexEnabled; \n' +
    'varying vec3 varCol; \n' +
    'varying vec2 varTex; \n' +
    'void main() { \n' +
    ' gl_FragColor =  vec4(varCol * col, 1.0) * ( isTexEnabled > 0.0 ? (texture2D(tex, varTex) * abs(cos(time * 0.001))) + (texture2D(tex2, varTex + vec2(sin(time * 0.001))) * abs(sin(time * 0.001))) : vec4(1)); \n' +
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
var uniform_texEnabled;
var attribute_vPos;
var attribute_vColor;
var attribute_vTex;
var colorLocation;
var gl;

var cubeTexture2;

var modelViewPersp;

var pMatrix;
var mvMatrix;

var vBuffer;
var vBufferTriangle;
var vBufferPyramid;
var vBufferBox;
var vBufferTriangleLocation;

var koalaTexture;
var pugTexture;

var gridBuffer;
var shaderId;
var pointVerts =  [
    100, 200, 0, 1, 1, 1,0, 0,
    300, 100, 0,1, 1, 1,0, 0,
    400, 700, 0,1, 1, 1,0, 0,
    20, 500, 0,1, 1, 1,0, 0,
    800, 300, 0, 1, 1, 1,0, 0,
];

var xTranslation = 0;
var yTranslation = 0;
var zTranslation = 0;

var pyramidVerts =  [];
var boxVerts =  [];

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

function initTextures() {
    cubeTexture = gl.createTexture();
    cubeTexture2 = gl.createTexture();
    cubeImage = new Image();
    cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
    cubeImage.src = "koal.jpg";

    cubeImage2 = new Image();
    cubeImage2.onload = function() { handleTextureLoadedPug(cubeImage2, cubeTexture2); }
    cubeImage2.src = "pug.png";
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    koalaTexture = texture;
    gl.bindTexture(gl.TEXTURE_2D, null);
    //alert("done, " + texture);
}

function handleTextureLoadedPug(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    pugTexture = texture;
    gl.bindTexture(gl.TEXTURE_2D, null);
    //alert("done, " + texture);
}

function buildGridBuffer()
{
    pointVerts = [
        -1.0, 0.0, 0.0,0.2, 0, 0,0, 0,
        1.0, 0.0, 0.0,1, 0, 0,0, 0,

        0.0, -1.0, 0.0,0, 0.2, 0,0, 0,
        0.0, 1.0, 0.0,0, 1, 0,0, 0,

        0.0, 0.0, -1.0,0, 0, 0.2, 0, 0,
        0.0, 0.0, 1.0,0, 0, 1, 0, 0
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointVerts), gl.DYNAMIC_DRAW);
    gridBuffer.itemSize = 6;
    gridBuffer.numItems = 6;
}

function drawLine(x1, y1, z1, x2, y2, z2, r, g, b)
{
    var lineBufV = []
    lineBufV.push(x1, y1, z1, r, g, b, 0, 0, x2, y2, z2, r * 0.5, g * 0.5, b * 0.5, 0, 0);
    var lineBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineBufV), gl.DYNAMIC_DRAW);
    vBuffer.itemSize = 3;
    vBuffer.numItems = 2;
    gl.uniform1f(uniform_texEnabled, 0);
    gl.uniform3f(colorLocation, r, g, b);
    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.LINES, 0, 2);
    gl.disableVertexAttribArray(attribute_vPos);
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

function buildTriangleBuffer(time) {

    triangleVerts = [];
    triangleVerts.push(0, 1, 0, 1, 0, 1, 0, 0);
    triangleVerts.push(0.5, -1, 0, 1, 1, 0, 0, 1);
    triangleVerts.push(-0.5, -1, 0, 0, 1, 1, 1, 1);



    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferTriangle);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerts), gl.DYNAMIC_DRAW);
    vBufferTriangle.itemSize = 8;
    vBufferTriangle.numItems = 3;
}

function buildPyramidBuffer(time) {

    pyramidVerts = [];
    pyramidVerts.push(0, 1, 0,1, 1, 1, 0, 0);
    pyramidVerts.push(-1, -1, 0,1, 1, 1, 0, 0);
    pyramidVerts.push(1, -1, 0,1, 1, 1, 0, 0);

    pyramidVerts.push(0, 1, 0,1, 1, 1, 0, 0);
    pyramidVerts.push(-1, -1, 0,1, 1, 1, 0, 0);
    pyramidVerts.push(0, 0, 3,0, 0, 0, 0, 0);

    pyramidVerts.push(0, 1, 0,1, 1, 1, 0, 0);
    pyramidVerts.push(0, 0, 3,0, 0, 0, 0, 0);
    pyramidVerts.push(1, -1, 0,1, 1, 1, 0, 0);

    pyramidVerts.push(0, 0, 3,0, 0, 0, 0, 0);
    pyramidVerts.push(-1, -1, 0,1, 1, 1, 0, 0);
    pyramidVerts.push(1, -1, 0,1, 1, 1, 0, 0);



    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferPyramid);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidVerts), gl.DYNAMIC_DRAW);
    vBufferPyramid.itemSize = 8;
    vBufferPyramid.numItems = 3 * 4;
}
function buildSphere()
{
    var sphereVerts = [];

    for ( var i = -10; i <= 10; i ++ )
    {

    }

}

function buildBox() {

    boxVerts = [];

    // front / rear
    boxVerts.push(-1, -1, 1,1, 1, 0, 0, 1);
    boxVerts.push(-1, 1, 1,1, 1, 0, 0, 0);
    boxVerts.push(1, 1, 1,1, 1, 0, 1, 0);


    boxVerts.push(1, 1, 1,1, 1, 0, 1, 0);
    boxVerts.push(1, -1, 1,1, 1, 0, 1, 1);
    boxVerts.push(-1, -1, 1,1, 1, 0, 0, 1);

    boxVerts.push(-1, -1, -1,1, 1, 0, 0, 1);
    boxVerts.push(-1, 1, -1,1, 1, 0, 0, 0);
    boxVerts.push(1, 1, -1,1, 1, 0, 1, 0);


    boxVerts.push(1, 1, -1,1, 1, 0, 1, 0);
    boxVerts.push(1, -1, -1,1, 1, 0, 1, 1);
    boxVerts.push(-1, -1, -1,1, 1, 0, 0, 1);


    // right/left
    boxVerts.push(1, 1, 1,1, 0, 1, 0, 1);
    boxVerts.push(1, 1, -1,1, 0, 1, 0, 0);
    boxVerts.push(1, -1, -1,1, 0, 1, 1, 0);

    boxVerts.push(1, -1, -1,1, 0, 1, 1, 0);
    boxVerts.push(1, -1, 1,1, 0, 1, 1, 1);
    boxVerts.push(1, 1, 1,1, 0, 1, 0, 1);

    boxVerts.push(-1, 1, 1,1, 0, 1, 0, 1);
    boxVerts.push(-1, 1, -1,1, 0, 1, 0, 0);
    boxVerts.push(-1, -1, -1,1, 0, 1, 1, 0);

    boxVerts.push(-1, -1, -1,1, 0, 1, 1, 0);
    boxVerts.push(-1, -1, 1,1, 0, 1, 1, 1);
    boxVerts.push(-1, 1, 1,1, 0, 1, 0, 1);

    // top bottom
    boxVerts.push(1, 1, 1,0, 1, 1, 0, 1);
    boxVerts.push(1, 1, -1,0, 1, 1, 0, 0);
    boxVerts.push(-1, 1, -1,0, 1, 1, 1, 0);

    boxVerts.push(-1, 1, -1,0, 1, 1, 1, 0);
    boxVerts.push(-1, 1, 1,0, 1, 1, 1, 1);
    boxVerts.push(1, 1, 1,0, 1, 1, 0, 1);

    boxVerts.push(1, -1, 1,0, 1, 1, 0, 1);
    boxVerts.push(1, -1, -1,0, 1, 1, 0, 0);
    boxVerts.push(-1, -1, -1,0, 1, 1, 1, 0);

    boxVerts.push(-1, -1, -1,0, 1, 1, 1, 0);
    boxVerts.push(-1, -1, 1,0, 1, 1, 1, 1);
    boxVerts.push(1, -1, 1,0, 1, 1, 0, 1);


    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBox);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVerts), gl.DYNAMIC_DRAW);
    vBufferBox.itemSize = 8;
    vBufferBox.numItems = 3 * 12 ;
}

function drawGrid()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.uniform1f(uniform_texEnabled, 0);
    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);

    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.LINES, 0, gridBuffer.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}


function drawPyramidUp()
{
    mat4.identity(mvMatrix);
    //mat4.translate(mvMatrix, [time * 0.0001 * 20, time * 0.0001 * 60, 0.0]);
    mat4.scale(mvMatrix, [1, 1, 1]);
    mat4.translate(mvMatrix, [0, 7, 0.0 ]);
    mat4.rotate(mvMatrix, -Math.PI * 0.5, [1.0, 0.0, 0.0 ]);
    gl.uniform3f(colorLocation, 0, 1, 0);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);
    gl.uniform1f(uniform_texEnabled, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferPyramid);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.TRIANGLES, 0, vBufferPyramid.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}

function drawPyramidRight()
{
    mat4.identity(mvMatrix);
    //mat4.translate(mvMatrix, [time * 0.0001 * 20, time * 0.0001 * 60, 0.0]);
    mat4.scale(mvMatrix, [1, 1, 1]);
    mat4.translate(mvMatrix, [7, 0, 0.0 ]);
    mat4.rotate(mvMatrix, Math.PI * 0.5, [0.0, 1.0, 0.0 ]);
    gl.uniform3f(colorLocation, 1, 0, 0);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);
    gl.uniform1f(uniform_texEnabled, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferPyramid);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.TRIANGLES, 0, vBufferPyramid.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}

function drawBox(x, y, z, s, rx, ry, rz, a)
{
    //gl.activeTexture(gl.GL_TEXTURE0);

    mat4.identity(mvMatrix);
    //mat4.translate(mvMatrix, [time * 0.0001 * 20, time * 0.0001 * 60, 0.0]);
    mat4.scale(mvMatrix, [s, s, s]);
    mat4.translate(mvMatrix, [x, y, z, 0.0 ]);
    mat4.rotate(mvMatrix, a, [rx, ry, rz ]);
    gl.uniform3f(colorLocation, 0.6, 0.4, 0.8);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);
    gl.uniform1f(uniform_texEnabled, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBox);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.TRIANGLES, 0, vBufferBox.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
    gl.disableVertexAttribArray(attribute_vColor);
    gl.disableVertexAttribArray(attribute_vTex);
}

function drawPyramidFar()
{
    mat4.identity(mvMatrix);
    //mat4.translate(mvMatrix, [time * 0.0001 * 20, time * 0.0001 * 60, 0.0]);
    mat4.scale(mvMatrix, [1, 1, 1]);
    mat4.translate(mvMatrix, [0, 0, 7.0 ]);
    mat4.rotate(mvMatrix, Math.PI * 0.5, [0.0, 0.0, 1.0 ]);
    gl.uniform3f(colorLocation, 0, 0, 1);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);
    gl.uniform1f(uniform_texEnabled, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferPyramid);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);

    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.TRIANGLES, 0, vBufferPyramid.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}

function drawGridHelperScene()
{
    drawLine(0, -10, 0, 0, 10, 0    , 0, 1, 0);
    drawLine(-10, 0, 0, 10, 0, 0    , 1, 0, 0);
    drawLine(0, 0, 10, 0, 0, -10    , 0, 0, 1);

    for ( var x = -10; x <= 10; x ++)
        drawLine(x, -0.01, -10, x, -0.01, 10    , 0.4, 0.4, 0.4);

    for ( var y = -10; y <= 10; y ++)
        drawLine(-10, -0.01, y, 10, -0.01, y    , 0.4, 0.4, 0.4);

    //drawTriangle();
    drawPyramidUp();
    drawPyramidRight();
    drawPyramidFar();
}
function drawPlayGround()
{
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,koalaTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, pugTexture);
    //gl.glActiveTexture(0);
    //if ( Math.abs(Math.sin(time * 0.01)) * 1000 > 500 )
    //    gl.bindTexture(gl.TEXTURE_2D, koalaTexture);
    //else
    //    gl.bindTexture(gl.TEXTURE_2D, pugTexture);
    var WIDTH = 20;
    var HEIGHT = 20;
    var LENGTH = 10;
    var SIZE = 0.125 * Math.abs( Math.sin(time * 0.001) ) * 4 + 0.45;

    for (var x = 0; x < WIDTH; x++) {
        for (var y = 0; y < HEIGHT; y++) {
            if (x == 0 || x == WIDTH - 1) {
                for ( var l = 0; l < LENGTH; l ++ ) {
                    drawBox((x - WIDTH * 0.5) * SIZE * 4, l * SIZE * 4* Math.sin(time * 0.001 + y) * 10, (y - HEIGHT * 0.5 ) * SIZE * 4, SIZE, 0, 1, 1, -y * time * 0.0001);
                }
            }
            else if (y == HEIGHT - 1 || y == 0) {
                for ( var l = 0; l < 10; l ++ ) {
                    drawBox((x - WIDTH * 0.5) * SIZE * 4,  l * SIZE * 4 * Math.sin( time * 0.001 + x) * 10, (y - HEIGHT * 0.5 ) * SIZE * 4, SIZE, 0, 1, 1, -x * time * 0.0001);
                }
            }
        }
    }
}

function draw()
{
    mat4.identity(mvMatrix);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);

    drawGridHelperScene();
    drawPlayGround();

    drawBox(0 + (cursorX - innerWidth * 0.5)* 0.002, 40, 0 + (cursorY - innerHeight * 0.5)* 0.002, 3, 0, 0, 0);
}

function update()
{
    time += 16.666;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.useProgram(shaderId);


    gl.uniform1f(uniform_time, time);
    gl.uniform2f(uniform_mpos, cursorX - 669.0, cursorY - 550.0);

    mat4.identity(modelViewPersp);
    mat4.perspective(45, canvasx / canvasy, 1, 300, modelViewPersp );
    mat4.translate(modelViewPersp, [xTranslation, yTranslation, -150 + zTranslation]);
    //mat4.ortho( -200, 200, -150, 150, -1, 1, modelViewPersp);
    //mat4.scale(modelViewPersp, [Math.abs(Math.sin(time * 0.0004)) + Math.sin(time * 0.001) + 1.0,  + Math.sin(time * 0.001) + 1.0 , + Math.sin(time * 0.001) + 1.0]);
    //mat4.rotate(modelViewPersp, 0.19, [1, 0, 0]);
    mat4.rotate(modelViewPersp, Math.PI * 0.5, [1, 0, 0]);
    mat4.rotate(modelViewPersp, time * 0.0005, [0, 1, 0]);


    gl.uniformMatrix4fv(uniform_matrixProj, false, modelViewPersp);


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

    document.onkeydown = function(ev)
    {
        if ( ev.keyCode == 39 )
            xTranslation += 0.1;
        if ( ev.keyCode == 37 )
            xTranslation -= 0.1;
        if ( ev.keyCode == 38 )
            yTranslation += 0.1;
        if ( ev.keyCode == 40 )
            yTranslation -= 0.1;
    }

    document.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvasx = canvas.width;
    canvasy = canvas.height;

    gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.DEPTH_E)

    gl.viewport(0, 0, canvas.width, canvas.height);

    pMatrix = mat4.create();
    mat4.identity(pMatrix);
    mvMatrix = mat4.create();
    modelViewPersp = mat4.create();

    //pMatrix = makePerspective(toRad(45.0), canvas.width / canvas.height, 0.1, 100.0);

    mat4.identity(mvMatrix); // Set to identity
    mat4.identity(modelViewPersp); // Set to identity
    //mat4.translate(mvMatrix, [0, 0, -100]); // Translate back 10 units
    //mat4.lookAt(mvMatrix, [0, 0, -100], [0, 0, 0], [0, 1, 0]);
    mat4.ortho( -200, 200, -150, 150, -1, 1, modelViewPersp);

    //mat4.multiply(mvMatrix, pMatrix, modelViewPersp); // Sets modelViewPersp to modelView * persp

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
    printShaderStatus(fShader);


    gl.useProgram(shaderId);
    gl.program = shaderId;

    colorLocation = gl.getUniformLocation(shaderId, "col");
    uniform_time = gl.getUniformLocation(shaderId, "time");
    attribute_vPos = gl.getAttribLocation(shaderId, "vPos");
    attribute_vColor = gl.getAttribLocation(shaderId, "vColor");
    attribute_vTex = gl.getAttribLocation(shaderId, "vTex");
    uniform_mpos = gl.getUniformLocation(shaderId, "mPos");
    uniform_matrixProj = gl.getUniformLocation(shaderId, "matrixProj");
    uniform_matrixView =  gl.getUniformLocation(shaderId, "matrixMv");
    uniform_texEnabled = gl.getUniformLocation(shaderId, "isTexEnabled");
    gridBuffer = gl.createBuffer();
    //buildGridBuffer();
    vBuffer = gl.createBuffer();
    vBufferTriangle = gl.createBuffer();
    vBufferPyramid = gl.createBuffer();
    vBufferBox = gl.createBuffer();

    gl.uniform1i(gl.getUniformLocation(shaderId, "tex"), 0);  // texture unit 0
    gl.uniform1i(gl.getUniformLocation(shaderId, "tex2"), 1);  // texture unit 1

    buildPyramidBuffer();
    buildBox();
    initTextures();
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    time += 16.0;

    update();

}

