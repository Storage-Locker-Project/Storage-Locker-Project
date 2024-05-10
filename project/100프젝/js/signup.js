function checkForm(event) {
  // 입력 필드의 값 가져오기
  var name = document.getElementById("name").value;
  var email = document.getElementById("emailInput").value;
  var password = document.getElementById("passwordInput").value;
  var confirmPassword = document.getElementById("passwordConfirmInput").value;

  // 입력 필드가 비어 있는 경우
  if (
    name === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    // 폼 제출 막기
    event.preventDefault();
    // 경고 메시지 출력
    alert("모든 필드에 입력해주세요.");
  }
  // 비밀번호가 일치하지 않는 경우
  else if (password !== confirmPassword) {
    // 폼 제출 막기
    event.preventDefault();
    // 경고 메시지 출력
    alert("비밀번호가 일치하지 않습니다.");
  } else {
    // 모든 입력 필드가 채워져 있고 비밀번호가 일치하는 경우
    // 여기에는 폼을 제출하는 추가 코드를 작성할 수 있습니다.
    // 예: 로그인 페이지로 이동
    window.location.href = "/project/100프젝/html/index.html";
  }
}
