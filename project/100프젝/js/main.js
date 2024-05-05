let currentLockerId = null; // 현재 선택된 보관함 ID를 저장하는 전역 변수
let lockerTimers = {};

let selectedLockerId = null; // 현재 선택된 사물함의 ID를 저장합니다.

// 사물함 선택 상태를 추적하는 변수
let isSelected = false; // 보관함이 선택되었는지 아닌지를 나타내는 변수


function openModal(lockerId, mode) {
  const modal = document.getElementById("timeModal");
  const span = document.getElementsByClassName("close")[0];
  const confirmBtn = document.getElementById("confirmTime");
  const timeInput = document.getElementById("hours");

  const nameInput = modal.querySelector("input[placeholder='이름']");
  const passwordInput = modal.querySelector("input[placeholder='비밀번호']");

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

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
    isSelected = false; // 락커 선택 상태 초기화
    selectedLockerId = null; // 선택된 락커 ID 초기화
};

  confirmBtn.onclick = function () {
    const hours = parseFloat(timeInput.value);
    if (!isNaN(hours) && hours > 0) {
      // currentLockerId 업데이트
      currentLockerId = lockerId;
      reserveLocker(lockerId, hours);
      modal.style.display = "none";
    } else {
      alert("올바른 시간을 입력하세요.");
    }
  };

  window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        isSelected = false; // 락커 선택 상태 초기화
        selectedLockerId = null; // 선택된 락커 ID 초기화
    }
};
}
function closeModal() {
  // 모달을 닫는 코드 작성
  // 예를 들어:
  document.getElementById('timeModal').style.display = 'none';

  // 초기화 코드 실행
  isSelected = false; // 선택 해제
  selectedLockerId = null; // 선택된 사물함 ID 초기화
  currentLockerId = null; // 현재 선택된 보관함 ID 초기화
}
function detectModalClose() {
  // 여기에 모달이 닫힐 때 실행할 코드 작성
  // 예를 들어:
  closeModal(); // 모달이 닫힐 때 초기화 함수 호출
}
document.getElementById('closeButton').addEventListener('click', detectModalClose);
document.querySelectorAll('.locker').forEach(function(locker) {
  locker.addEventListener('click', function() {
    if (isSelected && selectedLockerId !== this.id) {
      // 이미 다른 보관함이 선택되었으면 아무것도 하지 않음
      alert("이미 선택된 보관함이 있습니다. 다른 보관함은 선택할 수 없습니다.");
    } else if (!this.classList.contains('disabled')) {
      // 다른 사람이 이미 선택한 보관함을 선택하지 못하게 함
      if (currentLockerId !== null && currentLockerId !== this.id) {
        alert("이미 다른 사람이 사용 중인 보관함입니다.");
      } else {
        // 보관함 선택
        this.classList.toggle('selected'); // 선택 토글
        this.classList.contains('selected')
          isSelected = true; // 보관함이 선택되었음을 표시
          selectedLockerId = this.id; // 현재 선택된 사물함 ID 업데이트
          currentLockerId = this.id; // 현재 선택된 보관함 ID 업데이트
          openModal(this.id, "reserve"); // 시간 입력을 위한 모달 열기
        
      }
    }
  });
});


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


function showNoCurrentLockersMessage() {
  const US = document.getElementById("US");
  US.innerHTML = "현재 사용하시는 사물함이 없습니다.";
  const expandButton = document.getElementById("expand");
  expandButton.style.display = "none";
}
function updateCountdown(lockerId, endTime) {
  const locker = document.getElementById(lockerId);
  if (lockerTimers[lockerId]) {
    clearInterval(lockerTimers[lockerId]);
  }

  lockerTimers[lockerId] = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;
    const expand = document.getElementById("expand");
    expand.style.display = "block";
    
    if (distance >= 0) {
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      US.innerHTML = `보관함 ${lockerId} <br>${hours}시간 ${minutes}분 ${seconds}초 남았습니다`;
    } else {
      clearInterval(lockerTimers[lockerId]);
      locker.classList.remove("disabled");
      locker.textContent = `Locker ${lockerId.replace("locker", "")}`;
      delete lockerTimers[lockerId];

      isSelected = false; // 보관함 선택 상태를 false로 변경
      selectedLockerId = null; // 현재 선택된 사물함의 ID를 null로 초기화

      const allLockers = document.querySelectorAll(".locker");
      let allLockersDisabled = true;
      allLockers.forEach((locker) => {
        if (!locker.classList.contains("disabled")) {
          allLockersDisabled = false;
        }
      });
      if (allLockersDisabled) {
        showNoCurrentLockersMessage();
      } else {
        US.innerHTML = "다른 사물함을 선택하세요."; // 사용자에게 다른 사물함을 선택하라는 메시지 표시
      }

      // 시간이 다 되면 초기화
      showNoCurrentLockersMessage();
    }
  }, 1000);
}


