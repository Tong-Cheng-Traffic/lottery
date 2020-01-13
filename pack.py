#!/usr/bin/python3
import os


def readFile(fPath, encoding="utf-8"):
    f = open(file=fPath, mode="r", encoding=encoding)
    res = f.read()
    f.close()
    return res


def getCfg():
    pass


def generatePackCmd(cfg=None):
    return 'pyinstaller -F -i logo.ico app.py'


if __name__ == "__main__":
    cmd = generatePackCmd()
    os.system(cmd)
