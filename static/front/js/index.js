
(function () {

    var luckCtrl = {
        prize: [],

        currIdx: -1,

        getCurrItem: function () {
            return this.prize[this.currIdx];
        },

        getNextItem: function () {
            return this.prize[this.currIdx + 1];
        },

        findItem: function (name) {
            return this.prize.find(i => i.name === name);
        },

        isOver: function () {
            var item = this.getCurrItem();
            if (item && item.isDone()) {
                return this.currIdx >= this.prize.length - 1;
            }
            return !item;
        },

        cacheKey: 'luckPrize',

        save: function () {
            util.toCache(this.cacheKey, this.prize);
            http("modifyPrize", { paras: JSON.stringify(this.prize) });
        },

        fromCache: function () {
            return util.fromCache(this.cacheKey);
        },

        next: function () {
            if (this.isOver()) {
                console.log("is over !");
                return false;
            }
            var item = this.getCurrItem();
            item.nextCount();
            if (item.isDone()) {
                this.currIdx++;
            }
            this.save();
            this.showInfo();
            return !this.isOver();
        },

        showInfo: function () {
            var item = this.getCurrItem();
            if (item) {
                $("#info").html(`抽取：${item.name} <br /> 剩余：${item.getSurplusCount()}`);
            } else {
                $("#info").html(`已抽完`);
            }
        },

        toString: function () {
            var txt = '========================\r\n', sum = 0;
            for (var i in this.prize) {
                var item = this.prize[i];
                sum += item.getSum();
                txt += `${item.name}: 总数(${item.getSum()}) 需抽取(${item.counts.length})次 已抽取(${item.countsIdx})次 \r\n`;
            }
            return txt + `\r\n======== 共 ${this.prize.length} 个奖项，${sum} 个奖品 ========`;
        },

        init: function (newPrize) {
            newPrize = newPrize || [];
            var proto = {
                getSum: function () {
                    return this.counts.reduce((prev, curr) => prev + curr);
                },

                getSurplusCount: function () {
                    var c = 0;
                    for (var i = this.countsIdx, len = this.counts.length; i < len; i++) {
                        c += this.counts[i];
                    }
                    return c;
                },

                getCurrCount: function () {
                    return this.counts[this.countsIdx];
                },

                nextCount: function () {
                    this.countsIdx++;
                },

                isDone: function () {
                    var maxIdx = this.counts.length - 1;
                    if (this.countsIdx > maxIdx) {
                        return true;
                    }
                    return false;
                }
            };

            for (var i = 0, len = this.prize.length; i < len; i++) {
                var item = this.prize[i];
                var newItem = newPrize.find(ii => ii.name === item.name);
                item.countsIdx = (newItem || {}).countsIdx || 0;
                item.__proto__ = proto;
                if (this.currIdx === -1 && !item.isDone()) {
                    this.currIdx = i;
                }
            }

            this.showInfo();

            console.log(this.toString());
        },

    };


    var container = $(document.body);

    var config = {
        container,
        renderWidth: container.width(),
        renderHeight: container.height(),
    };

    function http(apiName, data, callback, opts) {
        opts = Object.assign({
            method: 'post',
            timeout: 6000,
        }, opts);
        $.ajax({
            url: '/api/' + apiName,
            data: data,
            type: opts.method,
            timeout: opts.timeout,
            success: function (res) {
                console.log(res);
                callback && callback(true, res);
            },
            error: function (res) {
                console.error(res);
                callback && callback(false, res);
            }
        });
    }

    var
        _lastLuckyers,
        _alreadyLuckData = {};

    var ctrl = {

        audio: document.getElementById('music'),

        roxik: null,

        get stopState() {
            return this.roxik.stopState;
        },

        keydownHandler: function (e) {
            if (e.keyCode === 32) {
                this.toggle();
            }
        },

        cdCount: 0,
        cdTimer: null,
        get toggleEnable() {
            return this.cdCount === 0;
        },
        countDown: function () {
            this.cdTimer && clearTimeout(this.cdTimer);
            if (this.cdCount === 0) {
                $('#tip, #countdown').fadeOut();
                this.roxik.toggle();
            } else {
                $('#countdown').text(this.cdCount);
                TweenLite.fromTo($('#countdown'), 0.3, { autoAlpha: 0, scale: 0 }, {
                    autoAlpha: .8, scale: 1, ease: Back.easeInOut, onComplete: () => {
                        this.cdCount--;
                        this.cdTimer = setTimeout(this.countDown.bind(this), 1000);
                    }
                });
            }
        },
        startCountDown: function () {
            this.cdCount = 3;
            var item = luckCtrl.getCurrItem();
            var tip = '当前奖项：' + item.name + '<br>抽取名额：' + item.getCurrCount();
            $('.lottery-text').html(tip);
            $('#tip, #countdown').fadeIn();
            this.countDown();
        },

        isExists: function (luckyers, member) {
            var jobNo = member.jobNo;
            if (Array.isArray(luckyers)) {
                var arr = luckyers;
                if (arr.find(ii => ii.jobNo === jobNo)) {
                    return true;
                }
            } else {
                for (var i in luckyers) {
                    var arr = luckyers[i] || [];
                    if (arr.find(ii => ii.jobNo === jobNo)) {
                        return true;
                    }
                }
            }
            return false;
        },

        showLuckyers: function (prizeItem, list) {
            if (!prizeItem) {
                var lastName = this.lastPrizeName();
                if (lastName) {
                    prizeItem = luckCtrl.findItem(lastName);
                }
                if (!prizeItem) {
                    alert("无中奖名单！");
                    return;
                }
            }
            if (!list) {
                list = _alreadyLuckData[prizeItem.name];
                if (!list) {
                    alert("无中奖人名单！");
                }
            }

            var itemClass,
                luckyHtml = '<h2>恭喜' + prizeItem.name + '获得者</h2>',
                lotteryCount = list.length,
                luckResult = $("#luckResult");
            if (lotteryCount > 80) {
                luckResult.addClass('wide');
                itemClass = 'luckyer-item5';
            } else if (lotteryCount > 30) {
                luckResult.addClass('wide');
                itemClass = 'luckyer-item4';
            } else if (lotteryCount > 10 && lotteryCount <= 30) {
                luckResult.removeClass('wide');
                itemClass = 'luckyer-item2';
            } else {
                luckResult.removeClass('wide');
                itemClass = 'luckyer-item1';
            }

            for (var i = 0; i < lotteryCount; i++) {
                var luckyItem = list[i];
                luckyHtml += '<div class="' + itemClass + '">' + luckyItem['name'] + ' ' + luckyItem['jobNo'] + '</div>';
            }

            luckResult.html('<div class="luckyer-list">' + luckyHtml + '</div>').fadeIn();
        },

        shuffle: function () {
            var item = luckCtrl.getCurrItem();
            var list = this.getCurrMembers(item, _alreadyLuckData);
            this.roxik.shuffle(list);
        },

        cacheKey: 'luckyers',

        save: function () {
            util.toCache(this.cacheKey, _alreadyLuckData);
            http("pushNames", { paras: JSON.stringify(_lastLuckyers) });
        },

        fromCache: function () {
            return util.fromCache(this.cacheKey);
        },

        // 获取或设置最后抽奖名称
        lastPrizeName: function (lastName) {
            var key = "lastPrizeName";
            if (arguments.length) {
                util.toCache(key, lastName);
            } else {
                return util.fromCache(key, false);
            }
        },

        extractAndSave: function () {
            var item = luckCtrl.getCurrItem();
            var data = _alreadyLuckData;
            _lastLuckyers = this.extractCurrLuckyers(item, data);
            data[item.name] = (data[item.name] || []).concat(_lastLuckyers);
            this.save();
            this.lastPrizeName(item.name);
            this.showLuckyers(item, _lastLuckyers);
        },

        // run or stop
        toggle: function () {

            if (luckCtrl.isOver()) return;

            if (!this.toggleEnable) return;

            if (this.stopState) {
                $("#luckResult, #menu").fadeOut();
                $("#slogan").fadeOut();
                this.audio.play();
                this.startCountDown();
            } else {
                this.cdCount = 1;
                setTimeout(() => {
                    this.cdCount = 0;
                }, 100);

                this.roxik.toggle();
                this.audio.pause();
                this.extractAndSave();

                if (luckCtrl.next()) {
                    setTimeout(() => {
                        this.shuffle();
                    }, 300);
                }
            }
        },

        getCurrMembers: function (prizeItem, luckyers) {
            var list = [];
            var len = util.random(618, 10);
            for (var i = 0; i < len; i++) {
                list.push({
                    jobNo: i % 8 + 14346,
                    name: '张俊',
                });
            }
            return list;
        },

        extractCurrLuckyers: function (prizeItem, luckyers) {
            var list = [],
                count = prizeItem.getCurrCount();
            for (var i = 0; i < count; i++) {
                list.push({
                    jobNo: util.random() % 8 + 14346,
                    name: '张俊',
                });
            }
            return list;
        },

        overwrite: function (prize, getCurrMembers, extractCurrLuckyers) {
            prize && (luckCtrl.prize = prize);
            getCurrMembers && (this.getCurrMembers = getCurrMembers);
            extractCurrLuckyers && (this.extractCurrLuckyers = extractCurrLuckyers);
        },

        init: function () {

            this.roxik = new Roxik(config);

            var initData = (prize, luckData) => {

                luckCtrl.init(prize);

                luckData && (_alreadyLuckData = luckData);

                if (luckCtrl.isOver()) {
                    console.log("is over !");
                    return;
                }

                this.shuffle();

                //$("#btnRun").on("click", this.toggle.bind(this));
                this.lastPrizeName() && $("#btnLuckyers").on("click", () => { this.showLuckyers(); }).fadeIn();
                document.addEventListener("keydown", this.keydownHandler.bind(this));
            };

            initData(luckCtrl.fromCache(), this.fromCache());

        },

    };

    window.ctrl = ctrl;

})();
