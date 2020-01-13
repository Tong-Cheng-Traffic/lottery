import preinit
from flask import Flask, request, redirect, send_from_directory
from sqlalchemy.sql.expression import func
from flask_admin import Admin, AdminIndexView
from flask_babelex import Babel
from database import db
from models import Staff, StaffView, Lottery, LotteryView, Lucky, LuckyView, ImportView, DataView, CommonView, \
    ResponseMsg

app = Flask(__name__, static_folder='static', static_url_path='/static')

babel = Babel(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lottery.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['BABEL_DEFAULT_LOCALE'] = 'zh_CN'
app.config['SECRET_KEY'] = 'lottery_secret_key'

db.init_app(app)

preinit.init()
if preinit.isRunInPack:
    @app.route("/admin/static/<path:p>")
    def statics(p):
        return send_from_directory('static', filename='admin/' + p)

admin = Admin(app, index_view=AdminIndexView(
    name='首页',
    template='admin/welcome.html',
    url='/admin',
), name='抽奖后台', template_mode='bootstrap3')

admin.add_view(StaffView(Staff, db.session, name='员工名单'))
admin.add_view(ImportView(name='导入名单', endpoint='import'))
admin.add_view(LotteryView(Lottery, db.session, name='奖项设置'))
admin.add_view(LuckyView(Lucky, db.session, name='中奖信息'))
admin.add_view(DataView(name='数据管理', endpoint='data'))
admin.add_view(CommonView(name='抽奖页面', endpoint='front', ))


@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()


# 首页
@app.route("/")
def index():
    return redirect("/admin", 302)


# 奖项列表
@app.route('/lottery/list')
def lottery_all():
    lottery_list = db.session.query(Lottery).order_by(
        Lottery.sort.asc(), Lottery.id.desc()).all()
    temp = []
    for l in lottery_list:
        temp.append(l.to_json())
    res = ResponseMsg(temp)
    return res.json_body()


# 根据奖项ID获取奖项信息
@app.route('/lottery/info')
def lottery_info():
    lottery_id = request.args.get('id')
    # 奖项信息
    lottery = db.session.query(Lottery).filter_by(id=lottery_id).first()
    if lottery is not None:
        # 中奖人员列表
        lucky_query = db.session.query(Lucky).filter_by(
            lottery_id=lottery_id).order_by(Lucky.id.asc()).all()
        lucky_list = []
        for lucky in lucky_query:
            lucky_list.append(lucky.to_json())
        lottery_detail = lottery.to_json()
        lottery_detail['luckyList'] = lucky_list
        # 剩余数量
        lottery_detail['remain'] = lottery.count - len(lucky_list)

        res = ResponseMsg(lottery_detail)
        return res.json_body()
    else:
        res = ResponseMsg(is_success=False)
        return res.json_body()


# 抽奖
@app.route('/lottery/generate')
def lottery_generate():
    lottery_id = request.args.get('id')
    # 奖项信息
    lottery = db.session.query(Lottery).filter_by(id=lottery_id).first()
    if lottery is not None:
        # 已抽中本奖项的人数
        this_lucky_count = 0
        # 已中奖人员列表（工号）
        # 本奖项是否可以与其他奖项重复中奖
        if lottery.repeat == 1:
            # 此奖项与其他奖项不冲突
            # 只要没有中此奖项就可以参与抽奖，与是否中其他奖项无关
            lucky_query = db.session.query(Lucky).filter(
                Lucky.lottery_id == lottery.id).all()
        else:
            # 此奖项与其他不可重复中奖的奖项互斥
            # 只要中了非上面那中类型的奖项，就不能参与抽奖
            lucky_query = db.session.query(Lucky).filter(
                Lucky.lottery_repeat == 0).all()

        old_lucky_staff_no = []
        for s in lucky_query:
            if str(s.lottery_id) == lottery_id:
                this_lucky_count += 1
            old_lucky_staff_no.append(s.staff_no)
        # 抽奖数（剩余数量是否够本次抽奖）
        new_lucky_count = 0
        rate = str.split(lottery.rate, ',')
        if len(rate) > 1:
            if this_lucky_count == 0:
                new_lucky_count = int(rate[0])
            else:
                count = 0
                for i in range(0, len(rate)):
                    count += int(rate[i])
                    if count >= this_lucky_count:
                        if len(rate) > (i+1):
                            new_lucky_count = int(rate[i + 1])
                        break
        else:
            new_lucky_count = int(lottery.rate)
            if new_lucky_count > lottery.count - this_lucky_count:
                new_lucky_count = lottery.count - this_lucky_count
        # 抽奖
        # 从奖项指定名单类型里抽
        new_lucky_query = db.session. \
            query(Staff). \
            filter(Staff.type == lottery.staff_type, Staff.no.notin_(old_lucky_staff_no)). \
            order_by(func.random()). \
            limit(new_lucky_count)

        new_lucky_list = []
        for s in new_lucky_query:
            lucky_staff = Lucky(s.name, s.no, lottery.name,
                                lottery.id, lottery.repeat)
            # 写入数据库
            db.session.add(lucky_staff)
            new_lucky_list.append(s.to_json())
        db.session.commit()

        res = ResponseMsg(new_lucky_list)
        return res.json_body()
    else:
        res = ResponseMsg(is_success=False)
        return res.json_body()


@app.route("/lottery/random")
def get_random():
    limit = request.args.get('limit')
    try:
        limit = int(limit)
    except Exception:
        limit = 100
    query = db.session.query(Staff).filter(
        Staff.type == 0).order_by(func.random()).limit(limit)
    temp = []
    for s in query:
        temp.append(s.to_json())
    res = ResponseMsg(temp)
    return res.json_body()


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
