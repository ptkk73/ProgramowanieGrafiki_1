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
    'attribute vec3 vNormal; \n' +
    'attribute vec2 vTex; \r\n' +
    'varying vec2 varTex; \n' +
    'varying vec3 varPos; \n' +
    'varying vec3 varCol; \n' +
    'varying vec3 varNormal; \n' +
    'void main() { \n' +
    'vec4 xxx = matrixProj * matrixMv * vec4( vPos.xyz, 1); \n' +

    ' gl_Position =  matrixProj * matrixMv * vec4( vPos.xyz, 1); \r\n' +
    'vec4 xxxx = matrixProj * matrixMv *  vec4(vPos.xyz, 1);' +
    'varPos = vec3(xxxx.x, xxxx.y, xxxx.z); \n' +
    'varCol = vColor; \n' +
    'varTex = vTex; \n' +
    'varNormal = vNormal; \n' +
    '} \n'; //+
//'} \n';

var FSHADER_SOURCE =

    'precision mediump float; \n' +
    'uniform float time; \n' +
    'uniform sampler2D tex; \n' +
    'uniform vec3 col; \n' +
    'uniform vec2 mPos; \n' +
    'uniform float isTexEnabled; \n' +
    'varying vec3 varCol; \n' +
    'varying vec3 varPos; \n' +
    'varying vec2 varTex; \n' +
    'varying vec3 varNormal; \n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightPosition;\n' +  // Position of the light source
    'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
    'void main() { \n' +

    'vec3 lightPosition = vec3(mPos.x * 0.25, 0, -100); \n' +
    'vec4 ambient = vec4(u_AmbientLight, 1); \n' +
    'vec4 diffuse = vec4(u_LightColor, 1); \n' +
    'vec4 specular = vec4(1, 1, 1, 1); \n' +
    'float shininess = 3.0; \n' +

    'vec3 L = normalize(lightPosition - varPos); \n' +
    'vec3 E = normalize(-varPos); // we are in Eye Coordinates, so EyePos is (0,0,0) \n' +
    'vec3 R = normalize(-reflect(L,varNormal)); \n' +

    'vec4 Iamb = ambient; \n' +

    'vec4 Idiff = diffuse * max(dot(varNormal,L), 0.0); \n' +
    'Idiff = clamp(Idiff, 0.0, 1.0); \n' +

        // calculate Specular Term:
    'vec4 Ispec = specular * pow(max(dot(R,E),0.0), 1.4 * shininess); \n' +
    'Ispec = clamp(Ispec, 0.0, 1.0) * 1.2; \n' +
        // write Total Color:
    'float specVal = (Ispec.x + Ispec.y + Ispec.z) / 3.0; \n' +
    'vec4 pixelatedColor = vec4(col, 1) * texture2D(tex, varTex + vec2( sin(gl_FragCoord.x + time * 0.00), cos(gl_FragCoord.y + time * 0.001) )* 0.01  * isTexEnabled); \n' +
    'vec4 texColor = vec4(col, 1) * texture2D(tex, varTex); \n' +
    'vec4 finalColor = ((texColor * specVal) + ( pixelatedColor * (1.0 - specVal ))) *( Iamb + ( Idiff * 0.2 + Ispec )  ); \n' +
        'float grayscale = (finalColor.x + finalColor.y + finalColor.z) / 3.0; \n' +
    'vec3 invertColor = vec3(1.0 - finalColor.x, 1.0 -  finalColor.y, 1.0 - finalColor.z); \n' +

        ' if ( isTexEnabled > 0.0 ) \n '+
    'gl_FragColor = vec4(finalColor.x * specVal + grayscale * ( 1.0 - specVal),finalColor.y * specVal + grayscale * ( 1.0 - specVal),finalColor.z * specVal + grayscale * ( 1.0 - specVal), 1); \n' +

    ' else \n '+
    'gl_FragColor = vec4(finalColor.x, finalColor.y, finalColor.z, 1); \n' +
        //'gl_FragColor = vec4(varCol, 1.0); \n' +
        //' gl_FragColor =  vec4(varCol * col, 1.0) * ( isTexEnabled > 0.0 ?  : vec4(1)); \n' +
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
var uniform_lightPos;
var uniform_lightColor;
var uniform_ambientColor;
var attribute_vPos;
var attribute_vColor;
var attribute_vTex;
var colorLocation;
var gl;

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
var rockTexture;

var attribute_vNormal;
var gridBuffer;
var shaderId;
var pointVerts =  [
    100, 200, 0, 1, 1, 1,0, 0,
    300, 100, 0,1, 1, 1,0, 0,
    400, 700, 0,1, 1, 1,0, 0,
    20, 500, 0,1, 1, 1,0, 0,
    800, 300, 0, 1, 1, 1,0, 0,
];

var pacmanVerts =  [];
var triangleVerts =  [];
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
    cubeImage = new Image();
    cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
    cubeImage.src = "pugstuff.jpg";

    cubeTexture2 = gl.createTexture();
    cubeImage2 = new Image();
    cubeImage2.onload = function() { handleTextureLoaded2(cubeImage2, cubeTexture2); }
    cubeImage2.src = "koal.jpg";

    cubeTexture3 = gl.createTexture();
    cubeImage3 = new Image();
    cubeImage3.onload = function() { handleTextureLoaded3(cubeImage3, cubeTexture3); }
    cubeImage3.src = "rocks.jpg";
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


function handleTextureLoaded2(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    pugTexture = texture;
    gl.bindTexture(gl.TEXTURE_2D, null);
    //alert("done, " + texture);
}

function handleTextureLoaded3(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    rockTexture = texture;
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

function buildBox() {

    boxVerts = [];

    // front / rear
    boxVerts.push(-1, -1, 1,1, 1, 1, 0, 1, 0, 0, -1);
    boxVerts.push(-1, 1, 1,1, 1, 1, 0, 0, 0, 0, -1);
    boxVerts.push(1, 1, 1,1, 1, 1, 1, 0, 0, 0, -1);


    boxVerts.push(1, 1, 1,1, 1, 1, 1, 0, 0, 0, -1);
    boxVerts.push(1, -1, 1,1, 1, 1, 1, 1, 0, 0, -1);
    boxVerts.push(-1, -1, 1,1, 1, 1, 0, 1, 0, 0, -1);

    boxVerts.push(-1, -1, -1,1, 1, 1, 0, 1, 0, 0, -1);
    boxVerts.push(-1, 1, -1,1, 1, 1, 0, 0, 0, 0, -1);
    boxVerts.push(1, 1, -1,1, 1, 1, 1, 0, 0, 0, -1);


    boxVerts.push(1, 1, -1,1, 1, 1, 1, 0, 0, 0, -1);
    boxVerts.push(1, -1, -1,1, 1, 1, 1, 1, 0, 0, -1);
    boxVerts.push(-1, -1, -1,1, 1, 1, 0, 1, 0, 0, -1);


    // right/left
    boxVerts.push(1, 1, 1,1, 1, 1, 0, 1, 0, 0, -1);
    boxVerts.push(1, 1, -1,1, 1, 1, 0, 0, 0, 0, -1);
    boxVerts.push(1, -1, -1,1, 1, 1, 1, 0, 0, 0, -1);

    boxVerts.push(1, -1, -1,1, 1, 1, 1, 0, 0, 0, -1);
    boxVerts.push(1, -1, 1,1, 1, 1, 1, 1, 0, 0, -1);
    boxVerts.push(1, 1, 1,1, 1, 1, 0, 1, 0, 0, -1);

    boxVerts.push(-1, 1, 1,1, 1, 1, 0, 1, 0, 0, -1);
    boxVerts.push(-1, 1, -1,1, 1, 1, 0, 0, 0, 0, -1);
    boxVerts.push(-1, -1, -1,1, 1, 1, 1, 0, 0, 0, -1);

    boxVerts.push(-1, -1, -1,1, 1, 1, 1, 0, 0, 0, -1);
    boxVerts.push(-1, -1, 1,1, 1, 1, 1, 1, 0, 0, -1);
    boxVerts.push(-1, 1, 1,1, 1, 1, 0, 1, 0, 0, -1);

    // top bottom
    boxVerts.push(1, 1, 1,1, 1, 1, 0, 1, 0, 0, 1);
    boxVerts.push(1, 1, -1,1, 1, 1, 0, 0, 0, 0, 1);
    boxVerts.push(-1, 1, -1,1, 1, 1, 1, 0, 0, 0, 1);

    boxVerts.push(-1, 1, -1,1, 1, 1, 1, 0, 0, 0, 1);
    boxVerts.push(-1, 1, 1,1, 1, 1, 1, 1, 0, 0, 1);
    boxVerts.push(1, 1, 1,1, 1, 1, 0, 1, 0, 0, 1);

    boxVerts.push(1, -1, 1,1, 1, 1, 0, 1, 0, 0, -1);
    boxVerts.push(1, -1, -1,1, 1, 1, 0, 0, 0, 0, -1);
    boxVerts.push(-1, -1, -1,1, 1, 1, 1, 0, 0, 0, -1);

    boxVerts.push(-1, -1, -1,1, 1, 1, 1, 0, 0, 0, -1);
    boxVerts.push(-1, -1, 1,1, 1, 1, 1, 1, 0, 0, -1);
    boxVerts.push(1, -1, 1,1, 1, 1, 0, 1, 0, 0, -1);


    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBox);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVerts), gl.DYNAMIC_DRAW);
    vBufferBox.itemSize = 11;
    vBufferBox.numItems = 3 * 12 ;
}

function drawGrid()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.uniform1f(uniform_texEnabled, 0);
    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);
    gl.uniform3f(uniform_lightPos, 0, 0, 0);
    gl.uniform3f(uniform_lightColor, 1, 1, 1);
    gl.uniform3f(uniform_ambientColor, 1.0, 1.0, 1.0);

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
    gl.uniform3f(uniform_lightPos, 0, 0, 0);
    gl.uniform3f(uniform_lightColor, 1, 1, 1);
    gl.uniform3f(uniform_ambientColor, 1.0, 1.0, 1.0);

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

    gl.uniform3f(uniform_lightPos, 0, 0, 0);
    gl.uniform3f(uniform_lightColor, 1, 1, 1);
    gl.uniform3f(uniform_ambientColor, 1.0, 1.0, 1.0);

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

function drawBox(x, y, z, s, rx, ry, rz, a, lx, ly, lz)
{
    //gl.activeTexture(gl.GL_TEXTURE0);

    mat4.identity(mvMatrix);
    //mat4.translate(mvMatrix, [time * 0.0001 * 20, time * 0.0001 * 60, 0.0]);
    mat4.scale(mvMatrix, [s, s, s]);
    mat4.translate(mvMatrix, [x, y, z, 0.0 ]);
    mat4.rotate(mvMatrix, a, [rx, ry, rz ]);
    gl.uniform3f(colorLocation, 1, 1, 1);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);
    gl.uniform1f(uniform_texEnabled, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferBox);


    gl.uniform3f(uniform_lightPos, lx, ly, lz);
    gl.uniform3f(uniform_lightColor, 1, 1, 1);
    gl.uniform3f(uniform_ambientColor, 0.1, 0.1, 0.1);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 11 * 4, 0);
    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 11 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 11 * 4, 6 * 4);
    gl.enableVertexAttribArray(attribute_vNormal);
    gl.vertexAttribPointer(attribute_vNormal, 3, gl.FLOAT, false, 11 * 4, 8 * 4);
    gl.drawArrays(gl.TRIANGLES, 0, vBufferBox.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
    gl.disableVertexAttribArray(attribute_vColor);
    gl.disableVertexAttribArray(attribute_vTex);
    gl.disableVertexAttribArray(attribute_vNormal);
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
    gl.uniform3f(uniform_lightPos, 0, 0, 0);
    gl.uniform3f(uniform_lightColor, 1, 1, 1);
    gl.uniform3f(uniform_ambientColor, 1.0, 1.0, 1.0);

    gl.enableVertexAttribArray(attribute_vPos);
    gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 8 * 4, 0);

    gl.enableVertexAttribArray(attribute_vColor);
    gl.vertexAttribPointer(attribute_vColor, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
    gl.enableVertexAttribArray(attribute_vTex);
    gl.vertexAttribPointer(attribute_vTex, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
    gl.drawArrays(gl.TRIANGLES, 0, vBufferPyramid.numItems);
    gl.disableVertexAttribArray(attribute_vPos);
}

function draw()
{
    //drawGrid();

    //gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //
    //gl.enableVertexAttribArray(attribute_vPos);
    //gl.vertexAttribPointer(attribute_vPos, 3, gl.FLOAT, false, 0, 0);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, vBuffer.numItems);
    //gl.disableVertexAttribArray(attribute_vPos);


    mat4.identity(mvMatrix);
    gl.uniformMatrix4fv(uniform_matrixView, false, mvMatrix);

    drawLine(0, -10, 0, 0, 10, 0    , 0, 1, 0);
    drawLine(-10, 0, 0, 10, 0, 0    , 1, 0, 0);
    drawLine(0, 0, 10, 0, 0, -10    , 0, 0, 1);

    for ( var x = -10; x <= 10; x ++)
        drawLine(x, -0.001, -10, x, -0.001, 10    , 0.4, 0.4, 0.4);

    for ( var y = -10; y <= 10; y ++)
        drawLine(-10, -0.001, y, 10, -0.001, y    , 0.4, 0.4, 0.4);

    //drawTriangle();
    drawPyramidUp();
    drawPyramidRight();
    drawPyramidFar();

    var boxX = -Math.abs(Math.sin(time * 0.001) * 1.8 + 0.7) * 150.0;
    var boxY = Math.sin(time * 0.001) * 150.0;
    var boxZ = -Math.abs(Math.cos(time * 0.001)) * 150.0;

    //drawBox(boxX, 10, boxZ, 0.1, 0, 0, 0, 0, boxX, 10, boxZ);

    gl.bindTexture(gl.TEXTURE_2D, rockTexture);
    drawBox(0, 0, 0, 50, 0, 1, 0, 0, boxX, 10, boxZ);


    var lightPosX = Math.sin(time * 0.002) * 2.71;
    var lightPosY = Math.cos(time * 0.002) * 2.71;

    var pos1x = Math.sin(time * 0.001) * 2.5;
    var pos2x =  -Math.cos(time * 0.001) * 2.5;

    gl.bindTexture(gl.TEXTURE_2D, koalaTexture);
    drawBox(pos1x , 0 , pos2x, 4, 2, 1, 0, time * 0.001, boxX , 10, boxZ );

    gl.bindTexture(gl.TEXTURE_2D, pugTexture);
    drawBox(pos1x + lightPosX, 2, pos2x + lightPosY, 4, 0, 0, 0, 0, boxX, 10, boxZ);


    //gl.bindTexture(gl.TEXTURE_2D, koalaTexture  + 1);
    //for ( var c = 0; c < 10; c ++ )
        //drawBox( Math.sin(time * 0.001 + c) * 130.0,  0, Math.cos(time * 0.001 + c) * 130.0, 0.25, 1, 1, 1, time * 0.001 + c, 0, 0, 0);
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
    mat4.translate(modelViewPersp, [0, 0, -30]);
    //mat4.ortho( -200, 200, -150, 150, -1, 1, modelViewPersp);
    //mat4.scale(modelViewPersp, [Math.abs(Math.sin(time * 0.0004)) + Math.sin(time * 0.001) + 1.0,  + Math.sin(time * 0.001) + 1.0 , + Math.sin(time * 0.001) + 1.0]);
    mat4.rotate(modelViewPersp, 0.30, [1, 0, 0]);
    mat4.rotate(modelViewPersp, time * 0.0001, [0, 1, 0]);


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
    attribute_vNormal = gl.getAttribLocation(shaderId, "vNormal");
    uniform_mpos = gl.getUniformLocation(shaderId, "mPos");
    uniform_matrixProj = gl.getUniformLocation(shaderId, "matrixProj");
    uniform_matrixView =  gl.getUniformLocation(shaderId, "matrixMv");
    uniform_texEnabled = gl.getUniformLocation(shaderId, "isTexEnabled");
    uniform_lightPos = gl.getUniformLocation(shaderId, "u_LightPosition");
    uniform_lightColor = gl.getUniformLocation(shaderId, "u_LightColor");
    uniform_ambientColor = gl.getUniformLocation(shaderId, "u_AmbientLight");
    gridBuffer = gl.createBuffer();
    //buildGridBuffer();
    vBuffer = gl.createBuffer();
    vBufferTriangle = gl.createBuffer();
    vBufferPyramid = gl.createBuffer();
    vBufferBox = gl.createBuffer();
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

