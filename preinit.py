import os
import sys
import time
import _thread
import webbrowser
import platform


osName = platform.system()
isWindows = osName == 'Windows'


isRunInPack = False


def readFile(fPath, encoding="utf-8"):
    if (not os.path.exists(fPath)):
        return None
    f = open(file=fPath, mode="r", encoding=encoding)
    res = f.read()
    f.close()
    return res


def writeFile(fPath, content, encoding="utf-8"):
    f = open(file=fPath, mode="w", encoding=encoding)
    f.write(content)
    f.close()


def openUrl():
    
    def call():
        time.sleep(8 if(isWindows) else 3)
        url = "http://127.0.0.1:5000/"
        webbrowser.open(url)

    fPath = "./flag.txt"
    tFormat = "%Y-%m-%d %H:%M:%S"
    oTime = readFile(fPath) or ''
    mTime = time.strftime(tFormat, time.localtime(time.time() - (15 if(isWindows) else 5)))
    if (oTime >= mTime):
        return
    nTime = time.strftime(tFormat, time.localtime(time.time()))
    writeFile(fPath, nTime)
    _thread.start_new_thread(call, ())


def init():
    global isRunInPack
    currDir = sys.path[0]
    if (currDir != os.getcwd()):  # 代表运行的是打包后的可执行文件 ?
        isRunInPack = True
        currDir = os.path.dirname(sys.executable)
        os.chdir(currDir)
        print("currDir:" + currDir)
        openUrl()
