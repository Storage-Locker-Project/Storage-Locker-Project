import pymysql

# 올바른 이메일 형식인지 확인하기
def email_validation(email):
    if '@' in email and 7 < len(email) < 35:
        return True
    else:
        return False
    
# 중복 이메일 주소 가입 방지하기
def email_overlap(email):
    connection = pymysql.connect(host='localhost', port=8888, db='', user='', password='', charser='utf8')
    cursor = connection.cursor(pymysql.cusors.DictCursor)

    sql = "SELECT * USER_LOGIN WHERE EMAIL = %s"
    cursor.execute(sql, (email,))
    result = cursor.fetchone()

    connection.close()

    if result:
        return False
    else:
        return True

# 안전한 비밀번호 생성하기
def pw_validation(password):
    if 5 < len(password) < 30:
        return True
    else:
        return False
    
# 유저 이름 입력 정보 확인
def name_validation(name):
    if 1 <= len(name) <= 20:
        return True
    else:
        return False