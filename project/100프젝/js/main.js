let currentLockerId = null; // 현재 선택된 보관함 ID를 저장하는 전역 변수
let lockerTimers = {}; // 보관함의 타이머를 관리하는 객체

let selectedLockerId = null; // 현재 선택된 사물함의 ID를 저장합니다.

// 사물함 선택 상태를 추적하는 변수
let isSelected = false; // 보관함이 선택되었는지 아닌지를 나타내는 변수

// 모달을 열 때 호출되는 함수
function openModal(lockerId, mode) {
  // 모달과 관련된 요소들을 가져옵니다.
  const modal = document.getElementById("timeModal");
  const span = document.getElementsByClassName("close")[0];
  const confirmBtn = document.getElementById("confirmTime");
  const timeInput = document.getElementById("hours");

  // 모달 내 입력 필드들을 가져옵니다.
  const nameInput = modal.querySelector("input[placeholder='이름']");
  const passwordInput = modal.querySelector("input[placeholder='비밀번호']");

  // 모달 모드에 따라 UI를 업데이트합니다.
  if (mode === "expand") {
    let expandName = document.getElementById("expandName");
    expandName.textContent = "연장할 시간을 입력해주세요";
    nameInput.style.display = "none";
    passwordInput.style.display = "none";
    timeInput.style.display = "block";
  } else {
    nameInput.style.display = "block";
    passwordInput.style.display = "block";
    timeInput.style.display = "block";
  }

  // 모달을 보이도록 설정합니다.
  modal.style.display = "block";

  // 닫기 버튼에 이벤트 리스너를 추가합니다.
  span.onclick = function () {
    modal.style.display = "none";
    isSelected = false; // 락커 선택 상태 초기화
    selectedLockerId = null; // 선택된 락커 ID 초기화
  };

  // 확인 버튼에 이벤트 리스너를 추가합니다.
  confirmBtn.onclick = function () {
    const hours = parseInt(timeInput.value);
    if (!isNaN(hours) && hours > 0) {
      // currentLockerId 업데이트
      currentLockerId = lockerId;
      reserveLocker(lockerId, hours);
      modal.style.display = "none";
    } else {
      alert("올바른 시간을 입력하세요.");
    }
  };

  // 모달 외부를 클릭할 때 닫히도록 설정합니다.
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      isSelected = false; // 락커 선택 상태 초기화
      selectedLockerId = null; // 선택된 락커 ID 초기화
    }
  };
}

// 모달을 닫는 함수
function closeModal() {
  document.getElementById("timeModal").style.display = "none"; // 모달을 닫습니다.
  isSelected = false; // 선택 해제
  selectedLockerId = null; // 선택된 사물함 ID 초기화
  currentLockerId = null; // 현재 선택된 보관함 ID 초기화
}

// 모달이 닫힐 때 실행되는 함수
function detectModalClose() {
  closeModal(); // 모달이 닫힐 때 초기화 함수 호출
}

// 닫기 버튼에 이벤트 리스너를 추가합니다.
document
  .getElementById("closeButton")
  .addEventListener("click", detectModalClose);

// 각 보관함에 클릭 이벤트 리스너를 추가합니다.

document.querySelectorAll(".locker").forEach(function (locker) {
  locker.addEventListener("click", function () {
    if (isSelected && selectedLockerId !== this.id) {
      // 이미 다른 보관함이 선택되었으면 아무것도 하지 않음
      alert("이미 선택된 보관함이 있습니다. 다른 보관함은 선택할 수 없습니다.");
    } else if (!this.classList.contains("disabled")) {
      // 다른 사람이 이미 선택한 보관함을 선택하지 못하게 함
      if (currentLockerId !== null && currentLockerId !== this.id) {
        alert("이미 다른 사람이 사용 중인 보관함입니다.");
      } else {
        // 보관함 선택
        this.classList.toggle("selected"); // 선택 토글
        isSelected = this.classList.contains("selected"); // 선택 여부 업데이트
        selectedLockerId = isSelected ? this.id : null; // 선택된 보관함 ID 업데이트
        currentLockerId = isSelected ? this.id : null; // 현재 선택된 보관함 ID 업데이트
        openModal(this.id, "reserve"); // 시간 입력을 위한 모달 열기
      }
    }
  });
});

// 보관함을 예약하는 함수
function reserveLocker(lockerId, hours) {
  console.log(lockerId);
  const locker = document.getElementById(lockerId);

  // locker가 null이면 함수 종료
  if (!locker) {
    console.error(`No element found with ID ${lockerId}`);
    return;
  }

  // locker가 존재하는 경우에만 dataset.endTime 사용
  let endTime = new Date().getTime();
  if (locker.dataset.endTime) {
    endTime = Math.max(endTime, parseFloat(locker.dataset.endTime));
  }

  endTime += hours * 3600 * 1000;

  locker.dataset.endTime = endTime.toString();

  locker.classList.add("disabled");

  updateCountdown(lockerId, endTime);
}

// 현재 사용 중인 보관함이 없는 메시지를 표시하는 함수
function showNoCurrentLockersMessage() {
  const US = document.getElementById("US");
  US.innerHTML = "현재 사용하시는 사물함이 없습니다.";
  const expandButton = document.getElementById("expand");
  expandButton.style.display = "none";
}
function updateCountdown(lockerId, endTime) {
  // 해당 ID를 가진 보관함 요소를 가져옵니다.
  const locker = document.getElementById(lockerId);

  // 해당 보관함에 대한 타이머가 이미 실행 중이라면 중지시킵니다.
  if (lockerTimers[lockerId]) {
    clearInterval(lockerTimers[lockerId]);
  }

  // 새로운 타이머를 설정합니다.
  lockerTimers[lockerId] = setInterval(() => {
    // 현재 시간을 가져옵니다.
    const now = new Date().getTime();

    // 종료 시간과 현재 시간의 차이를 계산합니다.
    const distance = endTime - now;

    // "연장" 버튼을 표시합니다.
    const expand = document.getElementById("expand");
    expand.style.display = "block";

    // 남은 시간이 있는 경우
    if (distance >= 0) {
      // 남은 시간을 시, 분, 초로 변환합니다.
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // UI에 보여줄 형식으로 시간을 업데이트합니다.
      US.innerHTML = `보관함 ${lockerId} <br>${hours}시간 ${minutes}분 ${seconds}초 남았습니다`;
    } else {
      // 남은 시간이 없는 경우
      // 타이머를 중지시킵니다.
      clearInterval(lockerTimers[lockerId]);

      // 해당 보관함의 상태를 변경하여 다시 사용 가능하게 합니다.
      locker.classList.remove("disabled");
      locker.textContent = `Locker ${lockerId.replace("locker", "")}`;

      // 해당 보관함에 대한 타이머를 삭제합니다.
      delete lockerTimers[lockerId];

      // 보관함 선택 상태를 초기화합니다.
      isSelected = false;
      selectedLockerId = null;

      // 보관함 선택 상태를 초기화합니다.
      showNoCurrentLockersMessage();
    }
  }, 1000); // 1초마다 업데이트합니다.
}
