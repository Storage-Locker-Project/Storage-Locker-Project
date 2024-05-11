// 이름 변경을 위한 모달 열기 함수
function openNameModal() {
  const modal = document.getElementById("nameModal");
  const span = modal.querySelector(".close");
  const confirmBtn = document.getElementById("confirmName");
  const nameInput = document.getElementById("newName");

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  };

  confirmBtn.onclick = function () {
    const newName = nameInput.value;
    if (newName.trim() !== "") {
      // 여기에 이름 변경 처리를 수행하는 함수 호출
      changeName(newName);
      modal.style.display = "none";
    } else {
      alert("새로운 이름을 입력하세요.");
    }
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// 이름 변경 처리 함수
function changeName(newName) {
  // 여기에 이름을 변경하는 로직을 구현합니다.
  // 예를 들어, 변경된 이름을 서버로 전송하는 등의 작업을 수행할 수 있습니다.
  console.log("새로운 이름:", newName);
}

// 이름 변경 버튼에 이벤트 리스너 추가
document
  .getElementById("changeNameButton")
  .addEventListener("click", openNameModal);

// 비밀번호 변경을 위한 모달 열기 함수
function openPasswordModal() {
  const modal = document.getElementById("passwordModal");
  const span = modal.querySelector(".close");
  const confirmBtn = document.getElementById("confirmPasswordChange");
  const oldPasswordInput = document.getElementById("oldPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  };

  confirmBtn.onclick = function () {
    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (
      oldPassword.trim() === "" ||
      newPassword.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    // 여기에 비밀번호 변경 처리를 수행하는 함수 호출
    changePassword(oldPassword, newPassword);
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

// 비밀번호 변경 처리 함수
function changePassword(oldPassword, newPassword) {
  // 여기에 비밀번호를 변경하는 로직을 구현합니다.
  // 예를 들어, 변경된 비밀번호를 서버로 전송하는 등의 작업을 수행할 수 있습니다.
  console.log("이전 비밀번호:", oldPassword);
  console.log("새로운 비밀번호:", newPassword);
}

// 비밀번호 변경 버튼에 이벤트 리스너 추가
document
  .getElementById("changePasswordButton")
  .addEventListener("click", openPasswordModal);
