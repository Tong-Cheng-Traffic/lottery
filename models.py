from flask_admin.contrib.sqla import ModelView
from flask_admin import BaseView, expose
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
from flask import request, flash, jsonify, redirect
from excel import read_excel
from database import db

# 名单类型
staff_type_choice = [('0', '全员'), ('1', '现场')]

# 奖项重复类型
repeat_type_choice = [('0', '不可重复'), ('1', '可重复')]


def get_staff_type(staff_type):
    type_name = '未知'
    for i in staff_type_choice:
        if str(staff_type) == i[0]:
            type_name = i[1]
    return type_name


def get_repeat_type(repeat_type):
    type_name = '未知'
    for i in repeat_type_choice:
        if str(repeat_type) == i[0]:
            type_name = i[1]
    return type_name


class Staff(db.Model):
    __tablename__ = 'staff'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    no = db.Column(db.String(50))
    type = db.Column(db.Integer, default=0)

    def __init__(self, name=None, no=None, staff_type=1):
        self.name = name
        self.no = no
        self.type = staff_type

    def __repr__(self):
        return '<Staff %r>' % self.name

    def to_json(self):
        return {
            'id': self.id,
            'staffName': self.name,
            'staffNo': self.no
        }

    @hybrid_property
    def staff_type(self):
        return get_staff_type(self.type)


class StaffView(ModelView):
    create_modal = True

    form_choices = {'type': staff_type_choice}

    page_size = 100

    column_labels = dict(id='ID', name='姓名', no='工号', type='类型', staff_type='类型')
    column_sortable_list = ['id', 'type']
    column_searchable_list = ['name', 'no']
    column_list = ('id', 'name', 'no', 'staff_type')
    column_default_sort = ('id', True)


class Lottery(db.Model):
    __tablename__ = 'lottery'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    count = db.Column(db.Integer)
    rate = db.Column(db.String(50))
    sort = db.Column(db.Integer)
    staff_type = db.Column(db.Integer, default=0)
    repeat = db.Column(db.Integer, default=0)
    time = db.Column(db.DateTime, default=datetime.now)

    def __init__(self, name=None, count=1, rate='1', sort=1):
        self.name = name
        self.count = count
        self.rate = rate
        self.sort = sort

    def __repr__(self):
        return '<Lottery %r>' % self.name

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'count': self.count,
            'rate': self.rate,
            'sort': self.sort,
            'time': datetime.strftime(self.time, '%Y-%m-%d %H:%M:%S')
        }

    @hybrid_property
    def lottery_repeat(self):
        return get_repeat_type(self.repeat)

    @hybrid_property
    def staff_type_name(self):
        return get_staff_type(self.staff_type)


class LotteryView(ModelView):
    create_modal = True

    form_choices = {'repeat': repeat_type_choice, 'staff_type': staff_type_choice}

    column_labels = dict(
        id='ID',
        name='奖项',
        count='总计',
        rate='频次',
        sort='排序',
        staff_type='名单',
        staff_type_name='名单',
        repeat='重复',
        lottery_repeat='重复',
        time='创建时间'
    )
    column_sortable_list = ['id', 'sort']
    column_searchable_list = ['name']
    column_list = ('id', 'name', 'count', 'rate', 'sort', 'staff_type_name', 'lottery_repeat', 'time')
    form_excluded_columns = 'time'
    column_default_sort = [('sort', False), ('id', True)]
    column_formatters = dict(time=lambda v, c, m, n: datetime.strftime(m.time, '%Y-%m-%d %H:%M:%S'))


class Lucky(db.Model):
    __tablename__ = 'lucky'
    id = db.Column(db.Integer, primary_key=True)
    staff_name = db.Column(db.String(50))
    staff_no = db.Column(db.String(50))
    lottery_name = db.Column(db.String(50))
    lottery_id = db.Column(db.Integer)
    lottery_repeat = db.Column(db.Integer)
    time = db.Column(db.DateTime, default=datetime.now)

    def __init__(self, staff_name=None, staff_no=None, lottery_name=None, lottery_id=None, lottery_repeat=0):
        self.staff_name = staff_name
        self.staff_no = staff_no
        self.lottery_name = lottery_name
        self.lottery_id = lottery_id
        self.lottery_repeat = lottery_repeat

    def __repr__(self):
        return '<Lucky %s(%s):%s>' % (self.staff_name, self.staff_no, self.lottery_name)

    def to_json(self):
        return {
            'id': self.id,
            'staffName': self.staff_name,
            'staffNo': self.staff_no,
            'lotteryName': self.lottery_name,
            'lotteryId': self.lottery_id,
            'time': datetime.strftime(self.time, '%Y-%m-%d %H:%M:%S')
        }

    @hybrid_property
    def lottery_repeat_type(self):
        return get_repeat_type(self.lottery_repeat)


class LuckyView(ModelView):
    create_modal = True

    column_labels = dict(
        id='ID',
        staff_name='姓名',
        staff_no='工号',
        lottery_name='奖项',
        lottery_id='奖项ID',
        lottery_repeat='重复',
        lottery_repeat_type='重复',
        time='中奖时间'
    )
    column_sortable_list = ['id', 'lottery_name', 'lottery_id', 'time']
    column_searchable_list = ['staff_name', 'lottery_name']
    column_list = ('id', 'staff_name', 'staff_no', 'lottery_name', 'lottery_id', 'lottery_repeat_type', 'time')
    form_excluded_columns = 'time'
    column_default_sort = [('id', True)]
    column_formatters = dict(time=lambda v, c, m, n: datetime.strftime(m.time, '%Y-%m-%d %H:%M:%S'))
    page_size = 100

    can_export = True
    column_export_list = ('staff_name', 'staff_no', 'lottery_name', 'lottery_id', 'lottery_repeat_type', 'time')
    export_types = ['xls']


class ImportView(BaseView):
    @expose('/', methods=['GET', 'POST'])
    def index(self):
        if request.method == "POST":
            f = request.files["file"]
            staffs = read_excel(f.read())
            staff_len = len(staffs)
            # 员工名单类型
            staff_type = request.form.get('type', 0)
            if staff_len > 0:
                for i in range(0, staff_len):
                    staff_no = staffs[i][0]
                    try:
                        staff_no = int(staff_no)
                    except ValueError as e:
                        pass
                    s = Staff(staffs[i][1], staff_no, staff_type)
                    db.session.add(s)
                db.session.commit()
                flash('成功导入%d条数据！' % staff_len, 'success')
            else:
                flash('导入失败！', 'error')
        return self.render('admin/import.html', type_choice=staff_type_choice)


class DataView(BaseView):
    @expose('/', methods=['GET', 'POST'])
    def index(self):
        if request.method == "POST":
            has_operation = False
            post_staff = request.form.get('staff')
            post_lottery = request.form.get('lottery')
            post_lucky = request.form.get('lucky')
            if post_staff == 'on':
                db.engine.execute("delete from staff")
                has_operation = True
            if post_lottery == 'on':
                db.engine.execute("delete from lottery")
                has_operation = True
            if post_lucky == 'on':
                db.engine.execute("delete from lucky")
                has_operation = True
            if has_operation:
                flash('执行完毕，请检查数据。', 'success')
            else:
                flash('数据清空后无法找回，请谨慎操作！', 'warning')
        else:
            flash('数据清空后无法找回，请谨慎操作！', 'warning')
        return self.render('admin/data.html')


class CommonView(BaseView):
    @expose('/')
    def index(self):
        return redirect('/static/index.html')


class ResponseMsg(object):
    msg_code = 200
    data = None

    def __init__(self, data=None, is_success=True):
        if is_success:
            self.id = 2
            if data is not None:
                self.data = data
        else:
            self.msg_code = 999

    def json_body(self):
        res_data = {
            'code': self.msg_code,
            'data': self.data
        }
        return jsonify(res_data)
