#include <Keypad.h>
#include <Servo.h>
#include "WiFiEsp.h"
#include "SoftwareSerial.h"
#ifndef HAVE_HWSERIAL1
#include "SoftwareSerial.h"
SoftwareSerial Serial1(18, 19);  // RX, TX
#endif
#define SPEAKER_PIN 9
#define LED_PIN 13

WiFiEspClient client; // WiFiEspClient 객체 선언

char ssid[21] = "Dyace";    // your network SSID (name)
char pass[21] = "22701670";  // your network password
int status = WL_IDLE_STATUS;        // the Wifi radio's status

int lock = 10; // 서보 모터가 연결된 핀
const byte ROWS = 4; // 키패드의 행 수
const byte COLS = 3; // 키패드의 열 수
char keys[ROWS][COLS] = { // 키패드의 키 배열
  { '1', '2', '3' },
  { '4', '5', '6' },
  { '7', '8', '9' },
  { '*', '0', '#' }
};
byte rowPins[ROWS] = { 5, 4, 3, 2 }; // 키패드의 행 핀 배열
byte colPins[COLS] = { 8, 7, 6 }; // 키패드의 열 핀 배열

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS); // 키패드 객체 생성

Servo servo; // 서보 모터 객체 생성
int open = 90;     // 문이 열린 각도
int close = 10;    // 문이 닫힌 각도
int servoNow = 0;  // 현재 서보 모터 상태(열림 또는 닫힘)

int pwdLength = 4; // 비밀번호 길이
char pwd[4]; // 비밀번호 저장 배열

// 숫자가 아닌 키가 입력될 때까지 대기하는 함수
char NoneNumberPressed(char m_key) {
  while ((m_key == '*') || (m_key == '#')) m_key = keypad.waitForKey();
  return m_key;
}

void setup() {

  // put your setup code here, to run once:
  Serial.begin(9600);  //시리얼모니터
  Serial1.begin(115200);   //와이파이 시리얼
  WiFi.init(&Serial1);   // initialize ESP module
  while ( status != WL_CONNECTED) {   // attempt to connect to WiFi network
    Serial.print(F("Attempting to connect to WPA SSID: "));
    Serial.println(ssid);
    status = WiFi.begin(ssid, pass);    // Connect to WPA/WPA2 network
  }
  if (status == WL_CONNECTED) Serial.println(F("You're connected to the network"));
    Serial.println();
  }


  // 비밀번호 배열 초기화
  for (int i = 0; i < pwdLength; i++) pwd[i] = '0';
  // 서보 모터 핀 설정
  servo.attach(lock);
  // 서보 모터를 닫힌 상태로 초기화 
  servo.write(close);
  // 현재 상태를 닫힌 상태로 설정
  servoNow = close;

  pinMode(SPEAKER_PIN, OUTPUT);

  pinMode(LED_PIN, OUTPUT);

}

void loop() {
  // 키패드 입력 대기
  char key = keypad.waitForKey();

  if (key != NO_KEY) {
    // 서보 모터가 열린 상태일 때
    if (servoNow == open) {
      // '#' 키가 눌렸을 때
      if (key == '#') {
        // 비밀번호 입력
        for (int i = 0; i < pwdLength; i++) {
          key = keypad.waitForKey();
          // 숫자가 아닌 키가 입력될 때까지 대기
          pwd[i] = NoneNumberPressed(key);
        }
        // 서보 모터를 닫힌 상태로 변경하고 함수 종료
        servoNow = close;
        servo.write(servoNow);
        fale();
        return;
      } 
      // '*' 키가 눌렸을 때
      else if (key == '*') {
        // 서보 모터를 닫힌 상태로 변경하고 함수 종료
        servoNow = close;
        servo.write(servoNow);
        fale();
        return;
      }
    }  
    // 서보 모터가 닫힌 상태일 때
    else if (servoNow == close) {
      // '*' 키가 눌렸을 때
      if (key == '*') {
        // 입력된 비밀번호와 저장된 비밀번호 비교
        char pwdInput[4];
        for(int i=0;i<pwdLength;i++){
          key = keypad.waitForKey();
          pwdInput[i] = NoneNumberPressed(key);
        }
        // 비밀번호가 일치하면 서보 모터를 열린 상태로 변경
        for (int j = 0; j < pwdLength; j++) if (pwd[j] != pwdInput[j]) return;
        servoNow = open;
        servo.write(servoNow);
        success();
      } else return;
    }
  }
}

void success() {
  tone(9, 262, 500);
  delay(500);
  tone(9, 330, 500);
  delay(500);
  tone(9, 392, 500);
  delay(500);
}

void fale() {
  tone(9, 262, 500);
  delay(500);
}


