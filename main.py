from flask import Flask, render_template 
from flask import request
from flask import jsonify
import pymysql

# Flask 앱 인스턴스 생성
app = Flask(__name__)

# 홈 페이지 기능
@app.route('/home', methods=['GET','POST'])
def home():
    # MySQL 데이터베이스 연결
    connection = pymysql.connect(host='localhost', port='8080', db='storagelocker', user='root', pw='1807992102', charset='utf8')
    # 데이터에 접근
    conn = connection.cursor(pymysql.cursors.DictCursor)
    
    # SQL query 작성
    sql = "select * from user_storage"
    
    # SQL query 실행
    conn.execute(sql)
    # DB 데이터 가져오기
    result = conn.fetchall()

    # DB 닫기
    connection.close()

    return jsonify(result)

# 마이페이지 기능
@app.route('/mypage')
def mypage():
    try:
        # MySQL 데이터베이스 연결
        connection = pymysql.connect(host='localhost', port='8080', db='storagelocker', user='root', pw='1807992102', charset='utf8')
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # user_login 테이블에서 데이터 가져오기
        sql_login = "SELECT * FROM user_login"
        cursor.execute(sql_login)
        login_data = cursor.fetchall()
        
        # user_storage 테이블에서 데이터 가져오기
        sql_storage = "SELECT * FROM user_storage"
        cursor.execute(sql_storage)
        storage_data = cursor.fetchall()

        # DB 연결 닫기
        connection.close()

        # 가져온 데이터를 JSON 형태로 반환
        return jsonify({'user_login': login_data, 'user_storage': storage_data})

    except Exception as e:
        return jsonify({'error': str(e)})
        
# 보관함 정보에 대한 기능
@app.route('/info')
def info():
    try:
        # MySQL 데이터베이스 연결
        connection = pymysql.connect(host='localhost', port='8080', db='storagelocker', user='root', pw='1807992102', charset='utf8')
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        # SQL query 작성 (JOIN 연산으로 user_storage와 locker_log 테이블을 조인하여 정보 가져오기)
        sql = """
            SELECT user_storage.*, locker_log.*
            FROM user_storage
            LEFT JOIN locker_log ON user_storage.storage_id = locker_log.storage_id
        """
        cursor.execute(sql)
        info_data = cursor.fetchall()

        # DB 연결 닫기
        connection.close()

        # 가져온 데이터를 JSON 형태로 반환
        return jsonify(info_data)

    except Exception as e:
        return jsonify({'error': str(e)})

# 회원가입 기능, POST 메소드로 설정
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_name = data['USER_NAME']
    user_id = data['EMAIL']
    user_pw = data['PASSWORD']
    
    if validation_name(user_name) and validation_id(user_id) and email_overlap(user_id) and validation_pw(user_pw):
        connection = pymysql.connect(host='localhost', port='8080', db='storagelocker', user='root', pw='1807992102', charset='utf8')
        cursor = connection.cursor(pymysql.cursors.DictCursor)

        sql = "SELECT * FROM user_login WHERE EMAIL = %s"
        cursor.execute(sql, (user_id,))
        db_data = cursor.fetchone()
        
        connection.commit()
        connection.close()

        if db_data:
            return jsonify({'message': '이미 등록된 이메일 주소입니다.'})
        else:
            # 회원가입 정보를 user_login 테이블에 삽입
            sql_insert = "INSERT INTO user_login (USER_NAME, EMAIL, PASSWORD) VALUES (%s, %s, %s)"
            cursor.execute(sql_insert, (user_name, user_id, user_pw))
            connection.commit()
            connection.close()
            return jsonify({'message': '회원가입이 완료되었습니다.'})

# 유저 이름 형식 확인
def validation_name(name):
    if len(name) > 0 and len(name) < 20:
        return True
    else:
        return False

# 유저 아이디 형식 확인
def validation_id(id):
    if '@' in id and id > 0 and id < 30:
        return True
    else:
        return False

# 유저 아이디 중복 확인
def email_overlap(email):
    connection = pymysql.connect(host='localhost', port=8080, db='storagelocker', user='root', password='1807992102', charser='utf8')
    cursor = connection.cursor(pymysql.cusors.DictCursor)

    sql = "SELECT * USER_LOGIN WHERE EMAIL = %s"
    cursor.execute(sql, (email,))
    result = cursor.fetchone()

    connection.close()

    if result:
        return False
    else:
        return True

# 유저 비밀번호 형식 확인
def validation_pw(pw):
    if pw > 8 and pw < 30:
        return True
    else:
        return False

# 로그인 엔드포인트 정의, POST 메소드로 설정
@app.route('/login', method = ['POST'])
def login():
    # MySQL 데이터베이스 연결
    connection = pymysql.connect(host='localhost', port='8080', db='storagelocker', user='root', pw='1807992102', charset='utf8')
    # 데이터에 접근
    cursor = connection.cursor(pymysql.cursors.Dict)

    data = request.get_json()
    user_id = data['EMAIL']
    user_pw = data['PASSWORD']

    # SQL query 작성
    sql = "SELECT * FROM USER_LOGIN WHERE EMAIL = %s"

    # SQL query 실행
    cursor.execute(sql, (user_id, ))
    # DB 데이터 가져오기
    db_data = cursor.fetchall()

    # Database 닫기
    connection.close()
    
    # 데이터베이스에서 사용자 정보를 가져왔는지 확인
    if len(db_data) > 0:
        db_name = db_data[0]['USER_NAME']
        db_id = db_data[0]['EMAIL']
        db_pw = db_data[0]['PASSWORD']

        return jsonify({'message':f'{db_name}님 로그인이 완료 되었습니다.'})
    else:
        return jsonify({'message':'로그인 정보를 다시 입력해주세요.'})
    
if __name__ == '__main__':
    app.run(debug=True, host = 'localhost', port = 8080)