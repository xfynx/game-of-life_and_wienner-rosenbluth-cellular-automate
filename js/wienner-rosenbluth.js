$(document).ready(function () {
    window.requestAnimFrame = (function () {
        return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();
    window.cancelRequestAnimFrame = (function () {
        return window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout
    })();

    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d");

    canvas.width = 500;
    canvas.height = 500;

    $('#canvas').css('background-color', 'rgba(0, 0, 0, 1)');

    var map = [
        [0, 0],
        [0, 0]
    ];

    var cellWidth = canvas.width / map.length,
        cellHeight = canvas.height / map.length;

    function drawGrid() {
        var drawGridFlag = document.getElementById("draw-grid-flag");
        if (drawGridFlag.checked) {
            var X = 0,
                Y = 0;
            context.lineWidth = 2;
            context.strokeStyle = "#a00";
            for (var i = 0; i < map.length + 1; i++) {
                context.beginPath();
                context.moveTo(X, Y);
                context.lineTo(X, canvas.height);
                context.closePath();
                context.stroke();
                X += cellWidth;
            }
            X = 0;
            for (i = 0; i < map.length + 1; i++) {
                context.beginPath();
                context.moveTo(X, Y);
                context.lineTo(canvas.width, Y);
                context.closePath();
                context.stroke();
                Y += cellHeight;
            }
        }
    }

    function draw() {
        clearAll();
        drawGrid();
        var currentX = 0,
            currentY = 0;
        context.lineWidth = 5;
        context.fillStyle = "rgb(0,255,0)";
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                if (map[i][j] === 1) {
                    context.fillRect(currentX + 2, currentY + 2, cellWidth - 5, cellHeight - 5);
                }
                currentX += cellWidth;
            }
            currentX = 0;
            currentY += cellHeight;
        }

        currentX = 0, currentY = 0;

        context.lineWidth = 5;
        context.fillStyle = "rgb(255,0,0)";
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                if (map[i][j] === 2) {
                    context.fillRect(currentX + 2, currentY + 2, cellWidth - 5, cellHeight - 5);
                }
                currentX += cellWidth;
            }
            currentX = 0;
            currentY += cellHeight;
        }

        $("#alive").text(checkState());
    }

    function recalculateMap() {
        //copy
        var next_map = [];
        for (var i = 0; i < map.length; i++)
            next_map[i] = map[i].slice();

        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                var i_minus = i - 1;
                var i_plus = i + 1;
                var j_minus = j - 1;
                var j_plus = j + 1;

                if (i_minus === -1)
                    i_minus = map.length - 1;
                if (i_plus === map[i].length || i_plus === -1)
                    i_plus = 0;
                if (j_minus === -1)
                    j_minus = map[i].length - 1;
                if (j_plus === map.length || j_plus === -1)
                    j_plus = 0;

                if (map[i][j] == 0 && (map[i_minus][j_minus] == 1
                    || map[i][j_minus] == 1
                    || map[i_plus][j_minus] == 1
                    || map[i_minus][j] == 1
                    || map[i_plus][j] == 1
                    || map[i_minus][j_plus] == 1
                    || map[i][j_plus] == 1
                    || map[i_plus][j_plus] == 1)) {
                    next_map[i][j] = 1;
                }

                if (map[i][j] == 1) {
                    next_map[i][j] = 2;
                }
                if (map[i][j] == 2) {
                    next_map[i][j] = 0;
                }
            }
        }

        map = [];
        for (var i = 0; i < next_map.length; i++)
            map[i] = next_map[i].slice();
    }

    function checkState() {
        var count = 0;
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                if (map[i][j] === 1)
                    count++;
            }
        }
        return count;
    }

    function randomizeMap() {
        var roll;
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[i].length; j++) {
                roll = getRandomizer(0, 2);
                if (roll === 2)
                    map[i][j] = 2;
                else if (roll === 1)
                    map[i][j] = 1;
                else
                    map[i][j] = 0;
            }
        }
    }

    function getRandomizer(bottom, top) {
        return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
    }

    function calculateCell(x, y) {
        var i = Math.floor(x / Math.floor(cellHeight));
        var j = Math.floor(y / Math.floor(cellWidth));
        if (map[j][i] === 2)
            map[j][i] = 0;
        if (map[j][i] === 1)
            map[j][i] = 2;
        else
            map[j][i] = 1;
        clearAll();
        draw();
    }

    function makeMap(size) {
        map = [];
        for (var i = 0; i < size; i++) {
            map[i] = [];
            for (var j = 0; j < size; j++) {
                map[i][j] = 0;
            }
        }

        cellWidth = canvas.width / map.length;
        cellHeight = canvas.height / map.length;
    }

    function isNotValid(v) {
        return v === "" || v === "0" || v === "1" || v === undefined || v == NaN;
    }

    function setTiming() {
        timing = document.getElementById('ms').value;
        if (isNotValid(timing)) {
            timing = "250";
        }
        timer = $.timer(function () {
            start();
        }, parseInt(timing), true);
    }

    function start() {
        if (checkState()) {
            incGeneration();
            draw();
            recalculateMap();
        }
        else {
            draw();
            timer.pause();
        }
    }

    function incGeneration() {
        var gen = parseInt($("#generation").text());
        gen++;
        $("#generation").text(gen);
    }

    function clearAll() {
        canvas.width = canvas.width;
        drawGrid();
    }

    $(canvas).click(function (e) {
        var canvasOffset = $(canvas).offset();
        var canvasX = Math.floor(e.pageX - canvasOffset.left);
        var canvasY = Math.floor(e.pageY - canvasOffset.top);
        calculateCell(canvasX, canvasY);
    });

    var randomizeButton = document.getElementById('randomize');
    randomizeButton.addEventListener('click', function (event) {
        randomizeMap();
        draw();
    });

    var drawButton = document.getElementById('draw');
    drawButton.addEventListener('click', function (event) {
        var size = $('#size').val();
        if (isNotValid(size))
            size = "2";
        makeMap(parseInt(size));
        $("#generation").text("0");
        draw();
    });

    var timer;

    var runButton = document.getElementById('run');
    runButton.addEventListener('click', function (event) {
        setTiming();
        timer.play();
        $("#status").text("STARTED");
    });

    var stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', function (event) {
        draw();
        timer.pause();
        $("#status").text("STOPPED");
    });

});