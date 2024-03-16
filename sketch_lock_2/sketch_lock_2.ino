#include <WiFiEsp.h>
#include <Keypad.h>
#include <Servo.h>
#ifndef HAVE_HWSERIAL1
#include "SoftwareSerial.h"
SoftwareSerial Serial1(18, 19);  // RX, TX
#endif
//#include <Adafruit_GFX.h>    // Core graphics library
//#include <Adafruit_ST7735.h> // Hardware-specific library
//#include <SPI.h>
#include "I2C.h"
#include "FifoCamera.h"
#include <Arduino.h>

int SPEAKER_PIN = 9;
int LED_PIN = 13;

WiFiEspClient client; // WiFiEspClient 객체 선언

const char *host = "your.server.com";  // HTTP 서버 주소
const char ssid[21] = "Dyace";    // your network SSID (name)
const char pass[21] = "22701670";  // your network password
const char path = ""; //서버 주소의 path
int status = WL_IDLE_STATUS;        // the Wifi radio's status

int red_pin = 7;
int green_pin = 6;
int blue_pin = 5;

const int VSYNC = 38; //vertical sync
const int SIOD = 20; //SDA
const int SIOC = 21; //SCL

const int RRST = 40;  //read reset
const int WRST = 41;  //write reset
const int RCK = 42;    //read clock
const int WR = 43;     //write flag
//OE -> GND     (output enable always on since we control the read clock)
//PWDN not nonnected  
//HREF not connected
//STR not connected
//RST -> 3.3V 

const int D0 = 30;
const int D1 = 31;
const int D2 = 32;
const int D3 = 33;
const int D4 = 34;
const int D5 = 35;
const int D6 = 36;
const int D7 = 37;
//DIN <- MOSI 23
//CLK <- SCK 18
unsigned int bufferSize = 3840; //버퍼 크기(바이트 수)
unsigned char* frameBuffer; //동적으로 할당될 버퍼 

I2C<SIOD, SIOC> i2c; //I2C 통신 제어
FifoCamera<I2C<SIOD, SIOC>, RRST, WRST, RCK, WR, D0, D1, D2, D3, D4, D5, D6, D7> camera(i2c); //camera 객체 선언

const int lock= 10; // 서보 모터가 연결된 핀
const byte ROWS PROGMEM = 4; // 키패드의 행 수
const byte COLS PROGMEM = 3; // 키패드의 열 수
char keys[ROWS][COLS] = { // 키패드의 키 배열
  { '1', '2', '3' },
  { '4', '5', '6' },
  { '7', '8', '9' },
  { '*', '0', '#' }
};
byte rowPins[ROWS] = { 45, 47, 49, 51 }; // 키패드의 행 핀 배열
byte colPins[COLS] = { 44, 46, 48 }; // 키패드의 열 핀 배열

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

#define QQVGA
//#define QQQVGA

#ifdef QQVGA
const int XRES = 160;
const int YRES = 120;
#endif
#ifdef QQQVGA
const int XRES = 80;
const int YRES = 60;
#endif

const int BYTES_PER_PIXEL = 2;
const int frameSize = XRES * YRES * BYTES_PER_PIXEL;

void setup() {
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
  pinMode(red_pin, OUTPUT);
  pinMode(blue_pin, OUTPUT);
  pinMode(green_pin, OUTPUT);

  analogWrite(red_pin,255);
  analogWrite(green_pin,255);
  analogWrite(blue_pin,255);
  
  Serial.begin(9600);
  Serial.println("Initialization...");
  i2c.init();
  camera.init();
  
  #ifdef QQVGA
    camera.QQVGARGB565();
    Serial.println("QQVGA");
  #endif
  #ifdef QQQVGA
    camera.QQQVGARGB565();
  #endif
  
  //camera.QQVGAYUV();
  //camera.RGBRaw();
  //camera.testImage();
  
  pinMode(VSYNC, INPUT);
  Serial.println("start");

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

void loop() {
  // 키패드 입력 대기
  char key = keypad.waitForKey();

  if (key != NO_KEY) {
    // 서보 모터가 열린 상태일 때
    if (servoNow == open) {
      // '#' 키가 눌렸을 때
      if (key == '#') {
        // 비밀번호 입력
        analogWrite(blue_pin, 0);
        tone(9, 523, 200);
        for (int i = 0; i < pwdLength; i++) {
          key = keypad.waitForKey();
          // 숫자가 아닌 키가 입력될 때까지 대기
          pwd[i] = NoneNumberPressed(key);
        }
        tone(9, 523, 200);
        analogWrite(blue_pin,255);
        //sendChange(pwd);
        // 서보 모터를 닫힌 상태로 변경하고 함수 종료
        /*
        analogWrite(green_pin, 0);
        servoNow = close;
        servo.write(servoNow);
        lockDoor();
        analogWrite(green_pin, 255);
        */
        return;
      } 
      // '*' 키가 눌렸을 때
      else if (key == '*') {
        // 서보 모터를 닫힌 상태로 변경하고 함수 종료
        analogWrite(green_pin, 0);
        servoNow = close;
        servo.write(servoNow);
        lockDoor();
        analogWrite(green_pin, 255);
        return;
      }
    }  
    // 서보 모터가 닫힌 상태일 때
    else if (servoNow == close) {
      // '*' 키가 눌렸을 때
      if (key == '*') {
        tone(9, 262, 200);
        // 입력된 비밀번호와 저장된 비밀번호 비교
        char pwdInput[4];
        for(int i=0;i<pwdLength;i++){
          key = keypad.waitForKey();
          pwdInput[i] = NoneNumberPressed(key);
        }
        // 비밀번호가 일치하면 서보 모터를 열린 상태로 변경
        for (int j = 0; j < pwdLength; j++) 
          if (pwd[j] != pwdInput[j]) {
            //비밀번호가 틀리면 사진 촬영 및 전송, 틀린 비밀번호도 전송
            analogWrite(red_pin, 0);
            takePhoto();
            fail();
            analogWrite(red_pin, 255);
            //sendWrong(pwd);
            //sendPhoto();
            return;
            }
          analogWrite(green_pin, 0);
          servoNow = open;
          servo.write(servoNow);
          success();
          analogWrite(green_pin, 255);
          } else return;
    }
  }
}

void success() {
  tone(9, 262, 200);
  delay(200);
  tone(9, 330, 200);
  delay(200);
  tone(9, 392, 200);
  delay(200);
}

void lockDoor() {
  tone(9, 523, 200);
  delay(200);
  tone(9, 392, 200);
  delay(200);
  tone(9, 330, 200);
  delay(200);
  tone(9, 262, 200);
  delay(200);
}

void fail() {
  tone(9, 523, 100);
  delay(100);
  tone(9, 523, 100);
  delay(100);
  tone(9, 523, 100);
  delay(100);
  tone(9, 523, 100);
  delay(100);
}
void sendChange(char pwdInput[4]) {
  Serial.println(F("Starting connection to server..."));
  if (client.connect(host,80)) {
    client.print(F("POST "));
    client.print((const __FlashStringHelper *)path);
    client.print(F(" HTTP/1.1\r\nHost: "));
    client.print(host);
    client.print(F("\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 13\r\n\r\npassword changed to"));
    client.print(pwdInput);
  } else Serial.println(F("Failed to send password to server"));
}
void sendWrong(char pwdInput[4]) {
  Serial.println(F("Starting connection to server..."));
  if (client.connect(host,80)) {
    client.print(F("POST "));
    client.print((const __FlashStringHelper *)path);
    client.print(F(" HTTP/1.1\r\nHost: "));
    client.print(host);
    client.print(F("\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 13\r\n\r\nwrong password="));
    client.print(pwdInput);
  } else Serial.println(F("Failed to send password to server"));
}

void takePhoto() {
  while(!digitalRead(VSYNC));
  while(digitalRead(VSYNC));
  camera.prepareCapture();
  camera.startCapture();
  while(!digitalRead(VSYNC));
  camera.stopCapture();
  Serial.println("capture complete");
}

void sendPhoto() {
  frameBuffer = (unsigned char*) malloc(bufferSize); //버퍼 크기만큼 동적 메모리 할당

  if (frameBuffer == NULL) {
    Serial.println(F("Failed to allocate memory for frame buffer."));
    return;
  }

  int count = frameSize / bufferSize;

  //반복문
  for(int i=0; i<count; i++) {
  
    //버퍼크기 만큼 받아올 부분
    camera.readBytes(&frameBuffer[i*bufferSize], bufferSize);
    
    //서버로 전송할 부분
    Serial.println(F("Starting connection to server..."));
    if (client.connect(host,80)) {
      client.print(F("POST "));
      client.print((const __FlashStringHelper *)path);
      client.print(F(" HTTP/1.1\r\nHost: "));
      client.print(host);
      client.print(F("\r\nContent-Type: multipart/form-data\; boundary=----boundary\r\nContent-Length: "));
      client.print(bufferSize);
      client.print(F("\r\n\r\n------boundary\r\nContent-Disposition: form-data\; name=\"file\"\; filename=\"data.bin\"\r\n"
                      "Content-Type: application/octet-stream\r\n\r\n"));
      client.print(*frameBuffer);
      client.print(F("\r\n------boundary--"));
    }
    Serial.print(i);
    Serial.print(" / ");
    Serial.println(count);
  }

  free(frameBuffer); //동적 메모리 해제
}
