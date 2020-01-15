#!/usr/bin/python3
# -*- coding: UTF-8 -*-
import sys
sys.path.append("./lib/")

from lib.config import Config
from lib.file import File
import lib.dbHelper as dbHelper
import api

import socket
from flask import Flask, Blueprint, redirect, render_template
from flask_cors import CORS

app = Flask(__name__, instance_relative_config=True, static_url_path='', static_folder='static')
CORS(app, supports_credentials=True)


@app.route('/', methods=['GET', 'POST'])
def home():
    return redirect('/front/index.html'), 301


@app.errorhandler(404)
def notFound(error):
    return render_template('404.html'), 404


def registerBp():
    '''注册蓝图'''
    app.register_blueprint(api.bp)


def run():
    isCreate = dbHelper.initData()
    if (isCreate):
        print('init databse success!')
    else:
        print('databse exists!')

    cfg = Config.get()
    host = cfg["host"] if("host" in cfg) else socket.gethostbyname(socket.gethostname())
    port = int(cfg["port"]) if("port" in cfg) else 8080

    app.debug = 'isDebug' in cfg and cfg["isDebug"] == '1'

    registerBp()

    app.run(
        host=host,
        port=port
    )


run()
