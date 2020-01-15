
var util = {
    random: function (max, min) {
        max = max || 10;
        min = min || 0;
        var val = Math.floor(Math.random() * max + min);
        return val;
    },

    isNumber: function (num) {
        return typeof num === 'number';
    },

    isString: function (obj) {
        return typeof obj === 'string';
    },

    fromCache: function (cacheKey, toParse = true) {
        var data = localStorage.getItem(cacheKey);
        if (toParse && data) {
            try {
                return JSON.parse(data);
            } catch (ex) {
                console.error(ex);
            }
        } else {
            return data;
        }
    },

    toCache: function (cacheKey, data) {
        if(!this.isString(data)) {
            data = JSON.stringify(data);
        }
        localStorage.setItem(cacheKey, data);
    },
    
};

var Roxik = function () {
    function Roxik(config) {
        this.config = config;
        this.stopState = -1;
        this.models = [];
        this.initialize();
        // this.animate();
    }

    Roxik.prototype.initialize = function () {
        this.initializeEngine();
        this.initializeCamera();
        this.initializeLights();
        this.initializeMaterials();
        this.initializeObjects();
        this.initializeFilters();
        this.initializeListeners();       
    }

    Roxik.prototype.initializeEngine = function () {
        this.scene = new THREE.Scene();
 
        var loader = new THREE.TextureLoader();
        var texture = loader.load('./img/bg.png');
        this.scene.background = texture;
        // this.scene.background = new THREE.Color(0xffffff);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        this.renderer.setSize(this.config.renderWidth, this.config.renderHeight);
    }

    Roxik.prototype.initializeCamera = function () {
        this.camera = new THREE.PerspectiveCamera(55, this.config.renderWidth / this.config.renderHeight, 0.001, 1000);

        this.camera.position.x = 2;
        this.camera.position.y = 2;
        this.camera.position.z = -2;

        this.cameraController = new CameraController();
        this.cameraController.camera = this.camera;
    }

    // 初始化灯光
    Roxik.prototype.initializeLights = function () {
        this.ambientLight = new THREE.DirectionalLight(0x9090aa);  //周围环境
        this.ambientLight.position.set(-10, 10, -10).normalize();
        this.scene.add(this.ambientLight);

        var light = new THREE.HemisphereLight(0xffffff, 0x444444);  // 半球光
        light.position.set(1, 1, 1);
        this.scene.add(light);
    }

    // 初始化材料
    Roxik.prototype.initializeMaterials = function () {
        // this.cubeMaterial = new THREE.MeshBasicMaterial({  // 立方体材料
        //     color: 0xdddddd
        // });
        // this.cubeMaterial.wireframe = true;
    }

    Roxik.prototype.initializeObjects = function () {

        this.cameraController.models = this.models;

        this.motionController = new MotionController();
        this.motionController.models = this.models;

        // this.cube = new THREE.CubeGeometry(18, 18, 18, 4, 4, 4);
        // this.cubeMesh = new THREE.Mesh(this.cube, this.cubeMaterial);
        // this.scene.add(this.cubeMesh);
    }

    Roxik.prototype.getMesh = function (data) {

        var loader = this.loader || (this.loader = new THREE.TextureLoader());
        var geometry = this.geometry || (this.geometry = new THREE.IcosahedronBufferGeometry(0.32, 2));

        var texture = loader.load('img/member/' + data.jobNo + '.png');

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        texture.repeat.set(2, 1);

        var mbm = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });

        var mesh = new THREE.Mesh(geometry, mbm);
        mesh.jTag = data;

        return mesh;
    }

    Roxik.prototype.reset = function () {
         for (var i = this.models.length - 1; i > -1; i--) {
            this.scene.remove(this.models[i]);
        }
        this.models.length = 0;
        this.motionController.reset();
    }

    Roxik.prototype.shuffle = function (list) {        
       
        this.reset();
        
        list = [].concat(list);

        var bet = 0.7;
        var offset = (8 - 1) * bet * 0.5;

        while (list.length > 0) {
            var idx = util.random(list.length),
                member = list[idx];
            list.splice(idx, 1);

            var m = this.getMesh(member);

            m.position.set(util.random() * bet - offset, util.random() * bet - offset, util.random() * bet - offset);

            this.models.push(m);
            this.scene.add(m);
        }
        console.log(this.models.length);

        this.motionController.changeScene(this.motionController.CYLINDER);
    }

    Roxik.prototype.initializeFilters = function () { }

    Roxik.prototype.initializeListeners = function () {
        window.addEventListener("resize", this.updateDimensions.bind(this));
        document.addEventListener("keydown", this.keydownHandler.bind(this));
    }

    Roxik.prototype.toggle = function () {
        var ss = this.stopState;
        if (ss === -1) {
            this.config.container.append(this.renderer.domElement);
            this.stopState = 0;
            this.animate();
        } else if (ss === 1) {
            this.stopState = 0;
        } else {
            this.stopState = 1;
        }
    }

    Roxik.prototype.animate = function () {

        requestAnimationFrame(this.animate.bind(this));

        if (this.stopState) return;

        this.cameraController.step();
        this.motionController.step();

        this.renderer.render(this.scene, this.camera);
    }

    Roxik.prototype.updateDimensions = function () {
        var width = this.config.renderWidth;
        var height = this.config.renderHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    Roxik.prototype.keydownHandler = function (event) {
        var keyCode = event.which;
        console.log("keyCode", keyCode);
        switch (keyCode) {
            case 49:
            case 97:
                this.motionController.changeScene(this.motionController.CYLINDER);
                break;
            case 50:
            case 98:
                this.motionController.changeScene(this.motionController.SPHERE);
                break;
            case 51:
            case 99:
                this.motionController.changeScene(this.motionController.CUBE);
                break;
            case 52:
            case 100:
                this.motionController.changeScene(this.motionController.TUBE);
                break;
            case 53:
            case 101:
                this.motionController.changeScene(this.motionController.WAVE);
                break;
            case 54:
            case 102:
                this.motionController.changeScene(this.motionController.GRAVITY);
                break;
            case 55:
            case 103:
                this.motionController.changeScene(this.motionController.ANTIGRAVITY);
                break;
        }
    }

    return Roxik;
}();

var CameraController = function () {
    function CameraController() {
        this.camera = null;
        this.models = [];

        this.frame = 1000;
        this.sceneLimit = 90;
        this.tm;
        this.target = new THREE.Vector3(0, 0, 0);
        this.cs = 0;
        this.gy = 0;
        this.l = 0;
        this.bl = 6;
        this.ts = 0;
        this.r = 0;
        this.rp = 0.03;
    }

    CameraController.prototype.step = function () {

        if (++this.frame > this.sceneLimit) {
            this.frame = 0;
            this.sceneLimit = Math.floor(Math.random() * 60 + 30);
            this.tm = this.models[Math.floor(Math.random() * this.models.length)];
            //this.tm = this.models[0];
            this.ts = 0;
            this.cs = 0;
            this.gy = Math.random() * 8 - 4;
            this.rp = Math.random() * 0.06 - 0.03;
            this.bl = Math.random() * 4 + 7;
        }

        if (this.ts < 0.05) {
            this.ts += 0.005;
        }

        if (this.cs < 0.5) {
            this.cs += 0.005;
        }

        this.target.x += (this.tm.position.x - this.target.x) * this.ts;
        this.target.y += (this.tm.position.y - this.target.y) * this.ts;
        this.target.z += (this.tm.position.z - this.target.z) * this.ts;

        this.camera.lookAt(this.target);

        this.r += this.rp;
        this.l += (this.bl - this.l) * 0.1;
        //var speed = Math.random() * (Math.floor(Math.random() * 10) % 2 === 0 ? -0.1 : 0.1);
        this.camera.position.x += (Math.cos(this.r) * this.l + this.tm.position.x - this.camera.position.x) * this.cs;
        this.camera.position.y += (this.tm.position.y + this.gy - this.camera.position.y) * this.cs;
        this.camera.position.z += (Math.sin(this.r) * this.l + this.tm.position.z - this.camera.position.z) * this.cs;
    }

    return CameraController;

}();

var MotionController = function () {
    function MotionController() {
        this.CYLINDER = 0;
        this.SPHERE = 1;
        this.CUBE = 2;
        this.TUBE = 3;
        this.WAVE = 4;
        this.GRAVITY = 5;
        this.ANTIGRAVITY = 6;

        this.models = [];

        this.scene = this.CYLINDER;
        this.sceneLimit = 560; // 100;
        this.frame = 0;
        this.cutoff = 0;
        this.r = 0.0;
        this.r0 = 0.0;
        this.rp = 0.0;
        this.rl = 0.0;
    }

    MotionController.prototype.reset = function() {
        this.cutoff = 0;
    }

    MotionController.prototype.changeScene = function (scene) {
        var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
        this.cutoff = 0;
        this.scene = scene;
        this.frame = 0;

        this.sceneLimit = 180;  // 360
        this.frame = 60;

        switch (this.scene) {
            case this.CYLINDER:
                this.cylinder();
                break;
            case this.SPHERE:
                this.sphere();
                break;
            case this.CUBE:
                this.cube();
                break;
            case this.TUBE:
                this.tube();
                break;
            case this.WAVE:
                this.wave();
                break;
            case this.GRAVITY:
                this.gravity();
                break;
            case this.ANTIGRAVITY:
                this.antigravity();
                break;
        }
    }

    MotionController.prototype.cylinder = function () {
        var n = 0;
        var r = Math.PI * 2 / this.models.length;
        var d = r * Math.floor(Math.random() * 40 + 1);

        for (var i = 0; i < this.models.length; i++) {
            var m = this.models[i];
            m.speed = 0;
            m.accel = Math.random() * 0.05 + 0.022;
            m.animate = false;
            m.dest = new THREE.Vector3();

            if (i < this.models.length - 50) {
                m.dest.x = Math.cos(n) * 4;
                m.dest.y = i * 0.008 - (this.models.length - 50) * 0.004;
                m.dest.z = Math.sin(n) * 4;
            } else {
                m.dest.x = Math.random() * 14 - 7;
                m.dest.y = Math.random() * 14 - 7;
                m.dest.z = Math.random() * 14 - 7;
            }

            n = n + d;
        }
    }

    MotionController.prototype.sphere = function () {
        var s = 0;
        var c = 0;
        var r = Math.PI * 2 / this.models.length;
        var d = r * Math.floor(Math.random() * 40 + 1);
        var d2 = Math.random() * 5 + 3;

        for (var i = 0; i < this.models.length; i++) {
            var m = this.models[i];
            m.speed = 0;
            m.accel = Math.random() * 0.05 + 0.022;
            m.animate = false;
            m.dest = new THREE.Vector3();

            var d1 = Math.cos(s) * d2;

            if (Math.random() > 0.06) {
                m.dest.x = Math.cos(c) * d1;
                m.dest.y = Math.sin(s) * d2;
                m.dest.z = Math.sin(c) * d1;
            } else {
                m.dest.x = Math.random() * 7 - 7;
                m.dest.y = Math.random() * 7 - 7;
                m.dest.z = Math.random() * 7 - 7;
            }

            s = s + r;
            c = c + d;
        }
    }

    MotionController.prototype.cube = function () {
        var a = Math.random() * 0.05 + 0.022;
        var n = 0;
        var l = 1;

        while (true) {
            if (l * l * l > this.models.length) {
                l--;
                break;
            }

            l++;
        }

        for (var i = 0; i < l; i++) {
            for (var j = 0; j < l; j++) {
                for (var k = 0; k < l; k++) {
                    var m = this.models[n++];
                    m.speed = 0;
                    m.accel = a;
                    m.animate = false;
                    m.dest = new THREE.Vector3();

                    m.dest.x = i * 0.8 + -(l - 1) * 0.8 * 0.5;
                    m.dest.y = j * 0.8 + -(l - 1) * 0.8 * 0.5;
                    m.dest.z = k * 0.8 + -(l - 1) * 0.8 * 0.5;
                }
            }
        }
    }

    MotionController.prototype.tube = function () {
        var a = Math.random() * 0.05 + 0.022;
        var v = 0.02 + Math.random() * 0.025;
        var dx = -v * this.models.length * 0.44;
        var d = 1.2 + Math.random() * 1;

        for (var i = 0; i < this.models.length; i++) {
            var m = this.models[i];
            m.speed = 0;
            m.accel = a;
            m.animate = false;
            m.dest = new THREE.Vector3();

            if (Math.random() > 0.05) {
                m.dest.x = i * v + dx;
                m.dest.y = Math.random() * d - d * 0.5;
                m.dest.z = Math.random() * d - d * 0.5;
            } else {
                m.dest.x = Math.random() * 14 - 7;
                m.dest.y = Math.random() * 14 - 7;
                m.dest.z = Math.random() * 14 - 7;
            }
        }
    }

    MotionController.prototype.wave = function () {
        var a = Math.random() * 0.05 + 0.022;
        var n = 0;
        var l = Math.floor(Math.sqrt(this.models.length));
        var d = -(l - 1) * 0.55 * 0.5;
        var r = 0;
        var t = Math.random() * 0.3 + 0.05;
        var s = Math.random() * 1 + 1;

        this.r = 0;
        this.r0 = 0;
        this.rl = Math.random() * 1 + 1;
        this.rp = Math.random() * 0.3 + 0.1;

        for (var i = 0; i < l; i++) {
            var ty = Math.cos(r) * s;
            r += t;

            for (var j = 0; j < l; j++) {
                n += 1;
                var m = this.models[n - 1];
                m.speed = 0;
                m.accel = a;
                m.animate = false;
                m.dest = new THREE.Vector3();
                m.dir = new THREE.Vector3();

                m.dir.x = m.dir.y = m.dir.z = 0;
                m.dest.x = i * 0.55 + d;
                m.dest.y = ty;
                m.dest.z = j * 0.55 + d;
            }
        }

        while (n < this.models.length) {
            var m = this.models[n];
            m.speed = 0;
            m.accel = a;
            m.animate = false;
            m.dest = new THREE.Vector3();

            m.dest.x = Math.random() * 14 - 7;
            m.dest.y = Math.random() * 14 - 7;
            m.dest.z = Math.random() * 14 - 7;
            n++;
        }
    }

    MotionController.prototype.gravity = function () {
        this.sceneLimit = 60;

        for (var i = 0; i < this.models.length; i++) {
            var m = this.models[i];
            m.dir = new THREE.Vector3();

            m.speed = 0;
            m.accel = 0.5;
            m.animate = false;
            m.dir.y = Math.random() * -0.2;
        }
    }

    MotionController.prototype.antigravity = function () {
        for (var i = 0; i < this.models.length; i++) {
            var m = this.models[i];
            m.speed = 0;
            m.accel = 0.5;
            m.animate = false;
            m.dir = new THREE.Vector3();

            m.dir.x = Math.random() * 0.25 - 0.125;
            m.dir.y = Math.random() * 0.25 - 0.125;
            m.dir.z = Math.random() * 0.25 - 0.125;
        }
    }

    MotionController.prototype.step = function () {
        var m = null;

        switch (this.scene) {
            case this.CYLINDER:
            case this.SPHERE:
            case this.CUBE:
            case this.TUBE:
                for (var i = 0; i < this.cutoff; i++) {
                    m = this.models[i];

                    if (!m.animate) {
                        if (m.speed < 0.8) {
                            m.speed = m.speed + m.accel;
                        }

                        var c0 = m.dest.x - m.position.x;
                        var c1 = m.dest.y - m.position.y;
                        var c2 = m.dest.z - m.position.z;
                        m.position.x = m.position.x + c0 * m.speed;
                        m.position.y = m.position.y + c1 * m.speed;
                        m.position.z = m.position.z + c2 * m.speed;
                        if (Math.abs(c0) < 0.05 && Math.abs(c1) < 0.05 && Math.abs(c2) < 0.05) {
                            m.animate = true;
                            m.position.x = m.dest.x;
                            m.position.y = m.dest.y;
                            m.position.z = m.dest.z;
                        }
                    }
                }

                var _maxp = Math.floor(this.models.length / 40);
                this.cutoff += _maxp;
                if (this.cutoff > this.models.length)
                    this.cutoff = this.models.length;

                break;

            case this.WAVE:
                var cos = 0;
                var max = Math.floor(Math.sqrt(this.models.length));
                var cc = 0;

                for (var _i = 0; _i < max; _i++) {
                    cos = Math.cos(this.r) * this.rl;
                    this.r = this.r + this.rp;
                    for (var j = 0; j < max; j++) {
                        m = this.models[cc++];
                        m.dest.y = cos;
                    }
                }

                this.r0 += 0.11;
                this.r = this.r0;

                for (var _i2 = 0; _i2 < this.cutoff; _i2++) {
                    m = this.models[_i2];
                    if (m.speed < 0.5) {
                        m.speed += m.accel;
                    }

                    m.position.x = m.position.x + (m.dest.x - m.position.x) * m.speed;
                    m.position.y = m.position.y + (m.dest.y - m.position.y) * m.speed;
                    m.position.z = m.position.z + (m.dest.z - m.position.z) * m.speed;
                }

                var _maxp = Math.floor(this.models.length / 40);
                this.cutoff += _maxp;
                if (this.cutoff > this.models.length)
                    this.cutoff = this.models.length;

                break;

            case this.GRAVITY:
                for (var _i3 = 0; _i3 < this.models.length; _i3++) {
                    m = this.models[_i3];
                    m.position.y = m.position.y + m.dir.y;
                    m.dir.y = m.dir.y - 0.06;
                    if (m.position.y < -9) {
                        m.position.y = -9;
                        m.dir.y = m.dir.y * -m.accel;
                        m.accel = m.accel * 0.9;
                    }
                }

                break;

            case this.ANTIGRAVITY:
                for (var _i4 = 0; _i4 < this.cutoff; _i4++) {
                    m = this.models[_i4];
                    m.position.x = m.position.x + m.dir.x;
                    m.position.y = m.position.y + m.dir.y;
                    m.position.z = m.position.z + m.dir.z;
                }

                this.cutoff += 30;
                if (this.cutoff > this.models.length)
                    this.cutoff = this.models.length;

                break;
        }

        if (++this.frame > this.sceneLimit)
            this.changeScene(Math.floor(Math.random() * 7));
    }

    return MotionController;
}();
