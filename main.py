from flask import Flask, request, jsonify, render_template
import pymysql
from validation import *
import requests

app = Flask(__name__)

# 아두이노 함수 정의

def send_change(pw_input):
    url = "http://localhost:5050/templates/signup.html"
    payload = {'password': pw_input}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post(url, data=payload, headers=headers)
    if response.status_code == 200:
        print("Password changed successfully")
    else:
        print("Failed to send password to server")

def send_wrong(pw_input):
    url = "http://localhost/templates/signup.html"
    payload = {'wrong_password': pw_input}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post(url, data=payload, headers=headers)
    if response.status_code == 200:
        print("Wrong password sent successfully")
    else:
        print("Failed to send wrong password to server")

# 회원가입 API
@app.route('/sineup', methods=['POST'])
def sineup():
    data = request.get_json()
    print(data)
    user_name = data['USER_NAME']
    user_id = data['EMAIL']
    user_pw = data['PASSWORD']

    # 회원가입 유효성 검사
    if email_validation(user_id) and email_overlap(user_id) and pw_validation(user_pw) and name_validation(user_name):
        connection = pymysql.connect(host='', port='', db='', user='', password='', charset='')
        cursor = connection.cursor(pymysql.cursors.DictCursor)

        # 회원가입 관련 쿼리 실행

        connection.commit()
        connection.close()

        return jsonify({'message':'회원가입이 완료되었습니다.'})

    # 아이디 입력란과 재확인란의 정보 두가지를 받아서 비교하는 부분 추가하기**
    elif email_validation(user_id) or pw_validation(user_pw) == False:
        return jsonify({'message':'아이디와 비밀번호를 양식에 맞게 작성해 주세요'})
    elif email_overlap(user_id) == False:
        return jsonify({'message':'이미 사용 중인 이메일 주소입니다.'})
    elif name_validation(user_name) == False:
        return jsonify({'message':'이름을 입력해주세요'})
    else:
        return jsonify({'message':'잘못된 입력입니다.'})
    
# 로그인 API
@app.route('/login', methods=['POST'])
def login():
    connection = pymysql.connect(host='', port='', db='', user='', password='', charset='')
    cursor = connection.cursor(pymysql.cursors.DictCursor)
    data = request.get_json()
    user_id = data['EAMIL']
    user_pw = data['PASSWORD']
    
    sql = "SELECT * USER_LOGIN WHERE EMAIL = %s" 

    cursor.execute(sql, (user_id,))
    db_data = cursor.fetchall()

    connection.close()

    if len(db_data) > 0:
        
        # DB 저장 정보와 입력 값을 비교하는 부분 추가하기**
        user_name = db_data[0]['USER_NAME']
        user_pw = db_data[0]['PASSWORD']

        return jsonify({'message':f"{user_name}님 반갑습니다."})
    else:
        return jsonify({'message':'아이디 또는 비밀번호를 다시 입력해주세요.'})

# 홈화면 API - 잔여 대여 시간, 시간 연장, 사물함 정보
@app.route('/home', methods=['GET','POST'])
def home():
    connection = pymysql.connect(host='', uset='', password='', database='')
    conn = connection.cursor(pymysql.cursors.DictCursor)
    query=f'select storage from userinfo where userid="{"미정"}"'
    conn.execute(query)
    result=conn.fetchall()

    # 홈화면에 표시해줄 내용 정해지는대로 추가하기**

# 내정보 API - 대여 사물함 정보, 대여 이력 + 오류 사진 정보
@app.route('/myapge', methods=['GET','POST'])
def mypage():
    send_change("New password")
    return jsonify({'message':'마이페이지 정보 전송'})

if __name__ == '__main__':
    app.run(debug=True, host='192.168.0.9', port=5050)