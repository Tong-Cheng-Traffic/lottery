
var can = require('canvas');

var fs = require("fs");

var members = require("./js/jtData").members;

var dir = './img/member/';

function draw(opts) {
    opts = Object.assign({
        bgColor: '#666666',
        fontColor: '#ffffff',
        data: { jobNo: 14346, name: '张俊' },
    }, opts);
    var data = opts.data;

    const canvas = new can.Canvas(200, 200);
    // const canvas = new can.Canvas(128, 128);
    const ctx = canvas.getContext('2d');

    var fStyle = opts.bgColor;
    if (!fStyle) { // 填充渐变
        fStyle = ctx.createLinearGradient(0, 0, 0, 200);
        fStyle.addColorStop(0, opts.bgColor1);
        fStyle.addColorStop(1, opts.bgColor2);
    }

    ctx.fillStyle = fStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 32px "Microsoft YaHei"';
    ctx.fillStyle = opts.fontColor;

    function oldD() {
        var txt = data.jobNo + "\r\n  " + data.name;
        var m = ctx.measureText(txt);
        // console.log(m, canvas.width, canvas.height);
        ctx.fillText(txt, (canvas.width - m.width) / 2, (canvas.height - m.emHeightDescent) / 2 + 10);  // + 15
        // ctx.fillText(txt, (canvas.width - m.width) / 2, 40);
        // ctx.fillText(txt, (canvas.width - m.width) / 2, 130);
    }

    function newD() {
        var top = 90;
        var txt = data.jobNo;
        var m = ctx.measureText(txt);
        ctx.fillText(txt, (canvas.width - m.width) / 2, top);
        top += m.emHeightAscent;

        top += 15;
        txt = data.name;
        m = ctx.measureText(txt);
        ctx.fillText(txt, (canvas.width - m.width) / 2, top);
    }

    newD();

    var bts = canvas.toBuffer();
    fs.writeFileSync(`${dir + data.jobNo}.png`, bts);
}

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

//var arr = ['#97350b', '#266ea5', '#00847f', '#2f818e', '#08917c', '#08917c', '#6b458c', '#7a4526'];
//var arr = ['#2b4490', '#2a5caa', '#585eaa', '#003a6c', '#426ab3']; //, '#dea32c', '#006c54', '#76becc'];
var arr = [
    { c1: '#37F5FF', c2: '#345FFF' },
    { c1: '#60FFD2', c2: '#0089D8' },
    { c1: '#7C4BEA', c2: '#422FF5' },
    { c1: '#4B9EF2', c2: '#743AEC' },
];
for (var i = 0, len = members.length; i < len; i++) {
    var idx = i % arr.length,
        ii = arr[idx];
    draw({
        bgColor: typeof ii === "string" ? ii : null,
        bgColor1: ii.c1,
        bgColor2: ii.c2,
        data: members[i],
    });
}
