from flask import Flask, request, jsonify, render_template
import pymysql
from validation import *
app = Flask(__name__)

@app.route('/')
def main():
    return "Hello New Project!"

# 회원가입 API
@app.route('/sineup', methods=['POST'])
def sineup():
    data = request.get_json()
    user_name = data['USER_NAME']
    user_id = data['EMAIL']
    user_pw = data['PASSWORD']

    # 회원가입 유효성 검사
    if email_validation(user_id) and email_overlap(user_id) and pw_validation(user_pw) and name_validation(user_name):
        connection = pymysql.connect(host='', port='', db='', user='', password='', charset='')
        cursor = connection.cursor(pymysql.cursors.DictCursor)

        # sql -> 쿼리문 작성
        # sql_act -> 실행

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
        user_name = db_data['USER_NAME']
        user_pw = db_data['PASSWORD']

        return jsonify({'message':f"{user_name}님 반갑습니다."})
    else:
        return jsonify({'message':'아이디 또는 비밀번호를 다시 입력해주세요.'})

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=8888)