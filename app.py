from flask import Flask, request, render_template 
from flask import jsonify
from PIL import Image
import pymysql
import io

app = Flask(__name__)

host = 'localhost'
port = 5050
database = 'storagelocker'
user = 'root'
password = '1807992102'
charset = 'utf8'

@app.route("/")
def main():
    print(">>> 1. login")
    return render_template('login.html')

@app.route('/signin', methods = ["POST"])
def login(email, password):
    print(">>> 2. login")
    try:
        data = request.get_json()
        user_id = data['EMAIL']
        user_pw = data['PASSWORD']
        
        print("email: " + email)
        print("password: " + password)
        
        connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
        cursor = connection.cursor(pymysql.cursors.Dict)

        query = "SELECT * FROM USER_LOGIN WHERE EMAIL = %s PASSWORD = %s"
        cursor.execute(query, (user_id, password))
        db_data = cursor.fetchone()
        connection.close()

        # 데이터베이스에서 사용자 정보를 가져왔는지 확인
        if db_data:
            db_name = db_data[0]['USER_NAME']
            db_id = db_data[0]['EMAIL']
            db_pw = db_data[0]['PASSWORD']
            return render_template('main.html')
        else:
            return render_template('login.html')
        
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/signup', methods=['POST'])
def singup():
    print(">>> 3. singup")
    try:
        data = request.get_json()
        user_name = data['USER_NAME']
        print(data['USER_NAME'])
        user_id = data['EMAIL']
        print(data['EMAIL'])
        user_pw = data['PASSWORD']
        print(data['PASSWORD'])
    
        if validation_name(user_name) and validation_id(user_id) and email_overlap(user_id) and validation_pw(user_pw):
            connection = pymysql.connect(host=host, port=port, database=database, user=user, password=password, charset=charset)
            cursor = connection.cursor(pymysql.cursors.DictCursor)

            sql = "SELECT * FROM user_login WHERE EMAIL = %s"
            cursor.execute(sql, (user_id,))
            db_data = cursor.fetchone()
            
            connection.commit()
            connection.close()

            if db_data:
                return render_template('main.html', db_data)
            else:
                sql_insert = "INSERT INTO user_login (EMAIL, PASSWORD, USER_NAME) VALUES (%s, %s, %s)"
                cursor.execute(sql_insert, (user_id, user_pw, user_name))
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
        
@app.route('/info')
def info():
    try:
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