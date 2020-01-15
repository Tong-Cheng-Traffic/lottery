# -*- coding: UTF-8 -*-

import sys
sys.path.append("./lib/")


import lib.util
arr = lib.util.Util.excelJtToList("./jtNames.xls")
# arr = lib.util.Util.excelWlToList("./wlNames.xls")
print(str(len(arr)))
print(arr)