$(function() {
    // 当前奖项信息
    var lotteryData = {
        // 当前奖项信息
        lotteryInfo: {},
        // 用于展示的员工列表
        staffList: []
    };

    var copies = [];
    var timeid;
    var timeid_eff;
    var index = 0;
    var isTimer = false;
    var isStop = true; //抽奖停止
    var time = 3;
    var isOver = false;

    var camera, scene, renderer, group;
    var controls;

    var objects = [];
    var targets = { table: [], sphere: [], helix: [], grid: [] };

    var cols = 13;
    var rows = 6;
    // 元素占据空间大小
    var itemSize = { width: 190, height: 190 };
    var shapes = ["table", "sphere", "helix", "grid"];

    var animated = false;

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 20000);
    scene = new THREE.Scene();
    group = new THREE.Group();

    // var axesHelper = new THREE.AxesHelper(15000);

    //数组元素乱序
    Array.prototype.shuffle = function() {
        var input = this;

        for (var i = input.length - 1; i >= 0; i--) {
            var randomIndex = Math.floor(Math.random() * (i + 1));
            var itemAtIndex = input[randomIndex];

            input[randomIndex] = input[i];
            input[i] = itemAtIndex;
        }
        return input;
    };

    function init() {
        randomStaff(cols * rows, function(data) {
            lotteryData.staffList = data;
            setUI();
        });
    }

    function setUI() {
        var current;

        //cols = 18;
        //rows = Math.ceil(lotteryData.staffList.length / cols);

        group.rotation.y = 0;
        camera.position.set(0, 0, 2600);

        // reset
        index = 0;
        copies = [];
        objects = [];
        targets = { table: [], sphere: [], helix: [], grid: [] };
        while (group.children.length > 0) {
            group.remove(group.children[0]);
        }
        group.position.set(0, 0, 0);
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

        // scene.add(axesHelper);

        // table
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                if (!(index >= lotteryData.staffList.length)) {
                    current = lotteryData.staffList[index];

                    var element = document.createElement("div");
                    element.setAttribute("id", "item_" + index++);
                    element.className = "element";

                    var username = document.createElement("div");
                    username.className = "name";
                    username.innerHTML = current["staffName"];
                    element.appendChild(username);

                    var jobno = document.createElement("div");
                    jobno.className = "jobno";
                    jobno.innerHTML = current["staffNo"];
                    element.appendChild(jobno);

                    var object = new THREE.CSS3DObject(element);
                    object.position.x = Math.random() * 4000 - 2000;
                    object.position.y = Math.random() * 4000 - 2000;
                    object.position.z = Math.random() * 4000 - 2000;
                    //object.position.z = 0;
                    // scene.add(object);
                    group.add(object);

                    objects.push(object);
                    copies.push(current);

                    var object = new THREE.Object3D();
                    object.position.x = j * itemSize.width - (cols * itemSize.width) / 2 + 70 + 80;
                    object.position.y = -(i * itemSize.height) + ((rows - 1) * itemSize.height) / 2;

                    targets.table.push(object);
                }
            }
        }
        scene.add(group);

        /*
        // sphere
        var vector = new THREE.Vector3();
        var spherical = new THREE.Spherical();
        for (var i = 0, l = objects.length; i < l; i++) {
            var phi = Math.acos(-1 + (2 * i) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;
            var object = new THREE.Object3D();
            spherical.set(700, phi, theta);
            object.position.setFromSpherical(spherical);
            vector.copy(object.position).multiplyScalar(2);
            object.lookAt(vector);
            targets.sphere.push(object);
        }
        */

        // helix
        var vector = new THREE.Vector3();
        var cylindrical = new THREE.Cylindrical();
        for (var i = 0, l = objects.length; i < l; i++) {
            var theta = i * 0.175 + Math.PI;
            var y = -(i * rows) + 350 - 100;
            var object = new THREE.Object3D();
            cylindrical.set(1000, theta, y);
            object.position.setFromCylindrical(cylindrical);
            vector.x = object.position.x * 2;
            vector.y = object.position.y;
            vector.z = object.position.z * 2;
            object.lookAt(vector);
            targets.helix.push(object);
        }

        /*
        // grid
        for (var i = 0; i < objects.length; i++) {
            var object = new THREE.Object3D();
            object.position.x = (i % 5) * 400 - 800;
            object.position.y = -(Math.floor(i / 5) % 5) * 400 + 800;
            object.position.z = Math.floor(i / 25) * 1000 - 2000;
            // object.position.z = -(Math.floor(i / 25)) * 1000;
            targets.grid.push(object);
        }
        */

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize(window.innerWidth + 180, window.innerHeight);
        renderer.domElement.style.position = "absolute";
        document.getElementById("container").appendChild(renderer.domElement);

        controls = new THREE.TrackballControls(camera, renderer.domElement);
        this.zoomSpeed = 1;
        this.panSpeed = 0.2;
        controls.addEventListener("change", render);

        transform(targets.table, 2000);
        if (!animated) {
            animated = true;
            animate();
        }

        setTimeout(function() {
            $("#menu").fadeIn();
            active();
        }, 2000);

        // c = new THREE.OrbitControls(camera, renderer.domElement);
    }

    //倒计时
    function timer() {
        if (time == 0) {
            isTimer = false;
            $("#countdown").fadeOut();
            lotteryAni();
            time = 3;
        } else {
            isTimer = true;
            $("#countdown").text(time);
            TweenLite.fromTo(
                $("#countdown"),
                0.3,
                { autoAlpha: 0, scale: 0 },
                {
                    autoAlpha: 0.8,
                    scale: 1,
                    ease: Back.easeInOut,
                    onComplete: function() {
                        time--;
                        setTimeout(function() {
                            timer();
                        }, 500);
                    }
                }
            );
        }
    }

    function start() {
        var tip = "";

        if (isStop) {
            isStop = false;
            // document.getElementById('music').play();
            var rate = lotteryData.lotteryInfo.rate;
            if (rate > lotteryData.lotteryInfo.remain) {
                rate = lotteryData.lotteryInfo.remain;
            }

            hideTip();

            tip = "当前奖项：" + lotteryData.lotteryInfo.name + "<br>抽取名额：" + rate;

            $(".lottery-text").html(tip);
            $("#countdown").fadeIn();
            timer();
        }
    }

    function lotteryAni() {
        // 公司抽奖只用这种种效果(圆环+围绕椭圆轨迹旋转)
        // 椭圆运动轨迹
        var x = 0,
            y = 0,
            a = 300,
            b = 100,
            angle = 360,
            z = 0,
            arr = [],
            changeZ = false;
        for (var i = 0; i < angle; i++) {
            var hudu = (Math.PI / 180) * i,
                x1 = a * Math.sin(hudu) + x,
                y1 = y - b * Math.cos(hudu);
            arr[i] = [];
            arr[i][0] = x1;
            arr[i][1] = y1;
        }

        transform(targets.helix, 1000);

        function run() {
            group.rotation.y -= 0.013;
            if (!changeZ && arr[z][0] < group.position.x) {
                changeZ = true;
            }
            if (changeZ) group.position.y = arr[z][1];
            group.position.x = arr[z][0];
            z >= angle - 1 ? (z = 0) : z++;
            render();
            timeid_eff = setTimeout(run, 16);
        }
        timeid_eff = setTimeout(run, 900);
    }

    function active() {
        var staffs = [];
        if (timeid) {
            clearInterval(timeid);
        }
        timeid = setInterval(function() {
            if (staffs.length < 100) {
                // 随机获取员工列表
                $.get({
                    url: "/lottery/random",
                    data: { limit: 1000 },
                    success: function(result) {
                        if (result.code === 200) {
                            var data = result.data || [];
                            staffs = staffs.concat(data);
                        }
                    }
                });
            }
            if (staffs.length < 1) return;
            var count = 10;
            if (lotteryData.staffList.length < 50) {
                count = 5;
            } else if (lotteryData.staffList.length < 10) {
                count = 1;
            }

            $(".element").removeClass("active");
            var len = copies.length;
            for (var i = 0; i < count - 1; i++) {
                var staff = staffs.shift();
                var item = Math.floor(Math.random() * len);
                $("#item_" + item + " .name").text(staff.staffName);
                $("#item_" + item + " .jobno").text(staff.staffNo);
                $("#item_" + item).addClass("active");
            }
        }, 150);
    }

    // 停止抽奖
    function stop() {
        getLucky(lotteryData.lotteryInfo.id, function(lucky) {
            var luckyHtml = "<h2>" + lotteryData.lotteryInfo.name + " 获奖名单</h2>",
                listHtml;

            isStop = true;
            // document.getElementById("music").pause();
            var colNum = 10;
            // 根据抽奖人数设置样式
            if (lucky.length <= 50) {
                colNum = 10;
            }
            if (lucky.length <= 30) {
                colNum = 6;
            }
            if (lucky.length <= 20) {
                colNum = 5;
            }
            if (lucky.length <= 10) {
                if (lucky.length % 5 === 0) {
                    colNum = 5;
                } else if (lucky.length % 4 === 0) {
                    colNum = 4;
                } else if (lucky.length % 3 === 0) {
                    colNum = 3;
                } else {
                    colNum = 2;
                }
            }

            var className = "";
            if (lucky.length <= 3) {
                className = "align-center";
            }

            if (timeid_eff) {
                clearTimeout(timeid_eff);
            }
            luckyHtml += '<div class="lucky_row ' + className + '">';
            for (var i = 0; i < lucky.length; i++) {
                luckyHtml +=
                    '<div class="luckyer-item"><span class="staff-name">' +
                    lucky[i].staffName +
                    "</span>" +
                    lucky[i].staffNo +
                    "</div>";
                if ((i + 1) % colNum === 0) {
                    luckyHtml += '</div><div class="lucky_row ' + className + '">';
                }
            }
            luckyHtml += "</div>";

            $(".element").removeClass("active");
            listHtml = $('<div class="luckyer-list"></div>').append(luckyHtml);
            $("#tip")
                .append(listHtml)
                .fadeIn();

            getLotteryInfo();

            setTimeout(function() {
                init();
            }, 500);
        });
    }

    //更新中奖信息
    function renderLotteryInfo() {
        var luckyList = lotteryData.lotteryInfo.luckyList;
        var listHtml = "";

        listHtml += "<h6>" + lotteryData.lotteryInfo.name + "</h6>";
        listHtml += "<ul>";
        for (var i = 0; i < luckyList.length; i++) {
            listHtml += "<li>" + luckyList[i].staffName + " " + luckyList[i].staffNo + "</li>";
        }
        listHtml += "</ul>";

        $(".list-box").html(listHtml);
    }

    function rand() {
        var n = Math.floor(Math.random() * copies.length);
        return copies[n] ? n : rand();
    }

    function random(minNum, maxNum) {
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    }

    // 隐藏中奖名单
    function hideTip() {
        $("#tip").fadeOut(function() {
            $(this).empty();
        });
    }

    function transform(targets, duration) {
        TWEEN.removeAll();

        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            var target = targets[i];

            new TWEEN.Tween(object.position)
                .to(
                    {
                        x: target.position.x,
                        y: target.position.y,
                        z: target.position.z
                    },
                    Math.random() * duration + duration
                )
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();

            new TWEEN.Tween(object.rotation)
                .to(
                    {
                        x: target.rotation.x,
                        y: target.rotation.y,
                        z: target.rotation.z
                    },
                    Math.random() * duration + duration
                )
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        }

        new TWEEN.Tween(this)
            .to({}, duration * 2)
            .onUpdate(render)
            .start();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        controls && controls.update();
    }

    function render() {
        renderer.render(scene, camera);
    }

    $("#list").on("click", function(event) {
        $(this).fadeOut();
    });

    // 获取奖项信息
    function getLotteryInfo(id) {
        id = id || lotteryData.lotteryInfo.id;
        $.get({
            url: "/lottery/info",
            data: { id: id },
            success: function(result) {
                if (result.code === 200) {
                    var data = result.data || {};
                    lotteryData.lotteryInfo = data;
                    $(".current-lottery-name").text(data.name);
                    $(".current-lottery-remain").text(data.remain);
                    // $('#info').fadeIn();
                    renderLotteryInfo();
                }
            }
        });
    }

    // 抽奖
    function getLucky(id, callback) {
        $.get({
            url: "/lottery/generate",
            data: { id: id },
            success: function(result) {
                if (result.code === 200) {
                    var data = result.data || [];
                    callback && callback(data);
                }
            }
        });
    }

    function randomStaff(limit, callback) {
        // 随机获取员工列表
        $.get({
            url: "/lottery/random",
            data: { limit: limit || 100 },
            success: function(result) {
                if (result.code === 200) {
                    var data = result.data || [];
                    callback && callback(data);
                }
            }
        });
    }

    // 获取奖项列表
    $.get("/lottery/list", function(result) {
        if (result.code === 200) {
            var data = result.data || [];
            var tpl = $("#tplLotteryItem").html();
            var compiled = _.template(tpl);
            $(".lottery-list").html(compiled({ lottery: data }));
            bindEvent();
            $(".btn-lottery-item")
                .first()
                .click();
        }
    });

    // 事件绑定
    function bindEvent() {
        // 奖项列表点击
        $(".btn-lottery-item").on("click", function() {
            $(".btn-lottery-item").removeClass("active");
            $(this).addClass("active");
            var id = $(this).data("id");
            getLotteryInfo(id);
        });
        // 开始抽奖
        $("#start").on("click", function() {
            if (lotteryData.lotteryInfo.remain > 0) {
                $(this)
                    .blur()
                    .hide();
                $("#stop").show();
                start();
            }
        });
        // 停止抽奖
        $("#stop").on("click", function() {
            $(this)
                .blur()
                .hide();
            $("#start").show();
            stop();
        });
        // 显示中奖名单
        $("#luckyers").on("click", function() {
            $("#list").fadeIn();
        });
        // 隐藏中奖名单
        $("#tip").on("click", function() {
            hideTip();
        });

        // 空格键
        $(document).keydown(function(e) {
            if (!e) var e = window.event;
            if (e.keyCode == 32) {
                if (isOver) return false;
                if (isStop) {
                    $("#start").click();
                } else {
                    if (!isTimer) {
                        $("#stop").click();
                    }
                }
            } else {
                hideTip();
            }
        });

        window.addEventListener("resize", onWindowResize, false);

        init();
    }
});
