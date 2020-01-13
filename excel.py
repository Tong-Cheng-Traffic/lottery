import xlrd


def read_excel(file_content, first_row=1):
    staffs = []
    workbook = xlrd.open_workbook(file_contents=file_content)
    # noinspection PyBroadException
    try:
        sheet = workbook.sheet_by_index(0)
        row_count = sheet.nrows
        for i in range(first_row, row_count):
            row_data = sheet.row_values(i)
            staffs.append([row_data[0], row_data[1]])
    except Exception:
        pass
    return staffs
