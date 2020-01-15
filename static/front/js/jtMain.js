
(function () {

    var prize = [
        {
            name: "探花奖",
            counts: [7, 7],
        },
        {
            name: "状元奖",
            counts: [2, 3],
        },

        {
            name: "百花奖",
            counts: [20, 20],
        },
        {
            name: "榜眼奖",
            counts: [2, 3],
        },
        {
            name: "秀才奖",
            counts: [5, 5, 5, 5],
        },

        {
            name: "天降馅饼奖",
            counts: [1],
        }
    ];
 
    function checkRepeat() {
        for (var i = 0, len = __allMembers.length; i < len; i++) {
            var ii = __allMembers[i];
            for (var j = i + 1; j < len; j++) {
                var jj = __allMembers[j];
                if (ii.jobNo === jj.jobNo) {
                    console.error("有重复的：" + ii.jobNo);
                    debugger
                    return;
                }
            }
        }
        console.log("无重复！");
    }
    checkRepeat();
 
    function isExists(luckyers, member) {
        return ctrl.isExists(luckyers, member);
    }

    var _lastCurrMembers;

    function getCurrMembers(prizeItem, luckyers) {
        var list = [],
            prizeName = prizeItem.name,
            count = prizeItem.getCurrCount();

        for (var i = 0, len = __allMembers.length; i < len; i++) {
            var member = __allMembers[i];
            var isIn = isExists(luckyers, member);
            if (!isIn) {
                list.push(member);
            }
        }

        if (list.length < count) { // 人数少于奖品数
            var max = __allMembers.length,
                cc = count - list.length;
            console.log("人数少于奖品数，再随机 " + cc + "个");
            while (list.length < count) {
                var idx = util.random(max);
                var m = __allMembers[idx];
                if (!isExists(list, m)) {
                    list.push(m);
                }
            }
        }

        _lastCurrMembers = list;
        return list;
    }

    function extractCurrLuckyers(prizeItem, luckyers) {
        var list = [],
            currMembers = _lastCurrMembers || [],
            prizeName = prizeItem.name,
            count = prizeItem.getCurrCount();

        function addPrize(m) {
            var newM = Object.assign({}, m, {
                prize: prizeName
            });
            list.push(newM);
        }

        if (count >= currMembers.length) { // 处理极端情况 奖品数大于等于人数
            console.log('奖品数大于等于人数 ' + count + " " + currMembers.length);
            for (var i = 0; i < currMembers.length; i++) {
                var m = currMembers[i];
                addPrize(m);
            }
            return list;
        }

        while (list.length < count) {
            var idx = util.random(currMembers.length);
            var m = currMembers[idx];
            addPrize(m);
            currMembers.splice(idx, 1);
        }

        return list;
    }

    ctrl.overwrite(prize, getCurrMembers, extractCurrLuckyers);

    ctrl.init();

})();