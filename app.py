from flask import Flask, request, render_template 
from flask import jsonify
from datetime import timedelta
from PIL import Image
import pymysql
import io

app = Flask(__name__)

# DB 연결 정보
host = 'localhost'
port = 5050
database = 'storagelocker'
user = 'root'
password = '1807992102'
charset = 'utf8'

# 시작 페이지 - 로그인 화면
@app.route("/")
def main():
    print(">>> 1. login")
    return render_template('login.html')

# 로그인 기능
@app.route('/signin', methods = ["POST"])
def login():
    print(">>> 2. login")
    try:
        # 입력한 아이디와 비밀번호 정보 저장
        email = request.form['email']
        password = request.form['password']
        # data = request.get_json()
        # user_id = data['EMAIL']
        # user_pw = data['PASSWORD']
        print("email: " + email)
        print("password: " + password)
        
        # DB 연결하여 사용자 정보 확인
        connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
        cursor = connection.cursor(pymysql.cursors.Dict)

        query = "SELECT * FROM USER_LOGIN WHERE EMAIL = %s PASSWORD = %s"
        cursor.execute(query, (email, password))
        db_data = cursor.fetchone()
        connection.close()

        # 데이터베이스에서 사용자 정보를 가져왔는지 확인
        if db_data:
            # db_name = db_data[0]['USER_NAME']
            # db_id = db_data[0]['EMAIL']
            # db_pw = db_data[0]['PASSWORD']
            
            # 로그인 성공 시 메인 페이지로 이동
            return render_template('main.html')
        else:
            # 로그인 실패 시 다시 로그인 화면으로 이동
            return render_template('login.html')
        
    except Exception as e:
        return jsonify({'error': str(e)})

# 회원가입 기능
@app.route('/signup', methods=['POST'])
def singup():
    print(">>> 3. singup")
    try:
        # 사용자가 입력한 회원가입 정보 가져오기
        user_name = request.form['USER_NAME']
        email = request.form['EMAIL']
        password = request.form['PASSWORD']

        # data = request.get_json()
        # user_name = data['USER_NAME']
        # user_id = data['EMAIL']
        # user_pw = data['PASSWORD']

        # print(data['USER_NAME'])
        # print(data['EMAIL'])
        # print(data['PASSWORD'])

        # 입력한 정보 유효성 검사
        if validation_name(user_name) and validation_id(email) and email_overlap(email) and validation_pw(password):
            connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
            cursor = connection.cursor(pymysql.cursors.DictCursor)

            query = "SELECT * FROM user_login WHERE EMAIL = %s"

            cursor.execute(query, (email,))
            db_data = cursor.fetchone()
            
            connection.commit()
            connection.close()

            # DB에 존재하는 이메일 확인
            if db_data:
                return jsonify({'message':'이미 해당 이메일 계정이 존재합니다.'})
            else:
                # 존재하지 않는 이메일이면 회원가입 정보를 DB에 추가
                sql_insert = "INSERT INTO user_login (EMAIL, PASSWORD, USER_NAME) VALUES (%s, %s, %s)"
                cursor.execute(sql_insert, (email, password, user_name))
                connection.commit()
                connection.close()
                return render_template('main.html', db_data)
        else:
            return render_template('signup.html')
    except Exception as e:
        return jsonify({'error': str(e)})

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
    connection = pymysql.connect(host=host, port=port, databasedb=database, user=user, password=password, charset=charset)
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

# 홈 페이지 기능
@app.route('/home', methods=['GET','POST'])
def home():
    try:
        # DB에서 물품 보관함 정보 가져오기
        connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
        conn = connection.cursor(pymysql.cursors.DictCursor)

        query = "SELECT locker_num, locker_pw, log_num FROM user_storage"
        conn.execute(query)
        locker_data = conn.fetchall()
        connection.close()
        
        return jsonify(locker_data)
    except Exception as e:
        return jsonify({'error': str(e)})

# 마이페이지 기능
@app.route('/mypage')
def mypage():
    try:
        # 사용자 로그인 정보와 보관함 정보 가져오기
        connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
        cursor = connection.cursor(pymysql.cursors.DictCursor)
        
        sql_login = "SELECT * FROM user_login"
        cursor.execute(sql_login)
        login_data = cursor.fetchall()
        
        sql_storage = "SELECT * FROM user_storage"
        cursor.execute(sql_storage)
        storage_data = cursor.fetchall()

        connection.close()

        return jsonify({'user_login': login_data, 'user_storage': storage_data})

    except Exception as e:
        return jsonify({'error': str(e)})

# 정보 페이지        
@app.route('/info')
def info():
    try:
        # 보관함 사용 정보 가져오기
        connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
        cursor = connection.cursor(pymysql.cursors.DictCursor)

        query = """
            SELECT user_storage.*, locker_log.*
            FROM user_storage
            LEFT JOIN locker_log ON user_storage.storage_id = locker_log.storage_id
        """

        cursor.execute(query)
        info_data = cursor.fetchall()
        connection.close()

        return jsonify(info_data)

    except Exception as e:
        return jsonify({'error': str(e)})
    
if __name__ == '__main__':
    app.run(debug=True, host = host, port = port)