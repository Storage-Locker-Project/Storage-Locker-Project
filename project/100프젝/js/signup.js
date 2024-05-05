function checkPasswordsMatch(event) {
  // 비밀번호 입력 필드의 값 가져오기
  var password = document.getElementById('passwordInput').value;
  var confirmPassword = document.getElementById('passwordConfirmInput').value;
  
  // 비밀번호가 일치하지 않는 경우
  if (password !== confirmPassword) {
    // 폼 제출 막기
    event.preventDefault();
    // 경고 메시지 출력
    alert('비밀번호가 일치하지 않습니다.');
  } else if(password == confirmPassword) {
    // 여기에는 비밀번호가 일치하는 경우의 코드를 작성합니다.
    // 예: 로그인 페이지로 이동
    window.location.href = 'index.html'; 
  }
}