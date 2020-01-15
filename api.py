# -*- coding: UTF-8 -*-

import json
from lib.util import Util
import lib.dbHelper as dbHelper

from flask import Blueprint, request, make_response, send_file


allowMethods = ['POST']

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.route('/pushNames', methods=allowMethods)
def pushNames():
    paras = request.form['paras']
    if (not paras):
        return Util.getRes(-1)
    records = json.loads(paras)
    # print(records)
    ip = request.remote_addr
    dbHelper.batchAddRecord(records, ip)
    return Util.getRes(data=True)


@bp.route('/export', methods=['GET'])
def export():
    data = dbHelper.getRecord("JobNo, Name, BigDept, Dept, City, Tag, Prize, CreateAt")
    fPath = "./luckList.xls"
    Util.saveToExcel(data, fPath, ("工号", "姓名", "事业群", "事业部级", "城市", "Tag", "奖项名称", "中奖时间"), "中奖名单")
    response = make_response(send_file(fPath))
    response.headers["Cache-Control"] = "max-age=0"
    response.headers["Content-Disposition"] = "attachment; filename=luckList.xls;"
    return response


@bp.route('/modifyPrize', methods=allowMethods)
def modifyPrize():
    paras = request.form['paras']
    if (not paras):
        return Util.getRes(-1)
    ip = request.remote_addr
    dbHelper.modifyPrizeCache(paras, ip)
    return Util.getRes(data=True)


@bp.route('/getPrize', methods=['GET'])
def getPrize():
    res = dbHelper.getPrizeCache()
    return Util.getRes(data=res)
