var levelXF = 3,	//幸福奖 300
	level10 = 6,	//十等奖 60
	level9 = 7,	//九等奖 75
	level8 = 60,	//八等奖 60
	level7 = 40,	//七等奖 40
	level6 = 24,	//六等奖 24
	level5 = 12,	//五等奖 12
	level4 = 5,		//四等奖 5
	level3 = 6,		//三等奖 6
	level2 = 3,		//二等奖 3
	level1 = 2,		//一等奖 2
	levelJX = 4,	//惊喜奖 4
	levelTD = 1;	//特等奖 1

//奖项类别
window.prizeLevel = [{
		'label': 'levelXF',
		'text': '幸福奖',
		'count': levelXF, //总个数
		'complete': false,
		'surplus': levelXF,	//剩余个数
		'n': 50	//一次抽取个数
	},{
		'label': 'level10',
		'text': '十等奖',
		'count': level10,
		'complete': false,
		'surplus': level10,
		'n': 20
	},{
		'label': 'level9',
		'text': '九等奖',
		'count': level9,
		'complete': false,
		'surplus': level9,
		'n': 20
	},{
		'label': 'level8',
		'text': '八等奖',
		'count': level8,
		'complete': false,
		'surplus': level8,
		'n': 20
	},{
		'label': 'level7',
		'text': '七等奖',
		'count': level7,
		'complete': false,
		'surplus': level7,
		'n': 20
	},{
		'label': 'level6',
		'text': '六等奖',
		'count': level6,
		'complete': false,
		'surplus': level6,
		'n': 12
	},{
		'label': 'level5',
		'text': '五等奖',
		'count': level5,
		'complete': false,
		'surplus': level5,
		'n': 6
	},{
		'label': 'level4',
		'text': '四等奖',
		'count': level4,
		'complete': false,
		'surplus': level4,
		'n': 1
	},{
		'label': 'level3',
		'text': '三等奖',
		'count': level3,
		'complete': false,
		'surplus': level3,
		'n': 1
	},{
		'label': 'level2',
		'text': '二等奖',
		'count': level2,
		'complete': false,
		'surplus': level2,
		'n': 1
	},{
		'label': 'level1',
		'text': '一等奖',
		'count': level1,
		'complete': false,
		'surplus': level1,
		'n': 1
	},{
		'label': 'levelJX',
		'text': '惊喜奖',
		'count': levelJX,
		'complete': false,
		'surplus': levelJX,
		'n': 1
	},{
		'label': 'levelTD',
		'text': '特等奖',
		'count': levelTD,
		'complete': false,
		'surplus': levelTD,
		'n': 1
	}];
