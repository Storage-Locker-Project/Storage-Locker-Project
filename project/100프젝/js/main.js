let currentLockerId = null; // 현재 선택된 보관함 ID를 저장하는 전역 변수
let lockerTimers = {};

document.addEventListener("DOMContentLoaded", function () {
  const lockers = document.querySelectorAll(".locker");
  lockers.forEach((locker) => {
    locker.addEventListener("click", function () {
      if (!this.classList.contains("disabled") && currentLockerId === null) {
        currentLockerId = this.id;
        openModal(this.id);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var expandButton = document.getElementById("expand");
  expandButton.addEventListener("click", function () {
    // 'clicked' 클래스 추가
    this.classList.add("clicked");

    // 300ms 후에 'clicked' 클래스 제거
    setTimeout(() => {
      this.classList.remove("clicked");
    }, 300); // CSS transition 시간과 동일하게 설정

    if (currentLockerId) {
      openModal(currentLockerId, "extend"); // 현재 선택된 보관함에 대한 모달 열기
    }
  });
});

function openModal(lockerId, mode) {
  const modal = document.getElementById("timeModal");
  const span = document.getElementsByClassName("close")[0];
  const confirmBtn = document.getElementById("confirmTime");

  const nameInput = modal.querySelector("input[placeholder='이름']");
  const passwordInput = modal.querySelector("input[placeholder='비밀번호']");

  if (mode === "extend") {
    let expandname = document.getElementById("expandName");
    expandname.textContent = "연장할 시간을 입력해주세요";
    nameInput.style.display = "none";
    passwordInput.style.display = "none";
  } else {
    nameInput.style.display = "block";
    passwordInput.style.display = "block";
  }

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
    currentLockerId = null; // 모달이 닫힐 때 currentLockerId 초기화
  };

  confirmBtn.onclick = function () {
    const hours = parseInt(document.getElementById("hours").value);
    if (!isNaN(hours) && hours > 0) { // 유효한 시간 값인지 확인
      reserveLocker(lockerId, hours);
      modal.style.display = "none";
      currentLockerId = null; // 모달이 닫힐 때 currentLockerId 초기화
    } else {
      alert("올바른 시간을 입력하세요.");
    }
};


  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      currentLockerId = null; // 모달이 닫힐 때 currentLockerId 초기화
    }
  };
}

function reserveLocker(lockerId, hours) {
  const locker = document.getElementById(lockerId);
  
  let endTime = new Date().getTime();
  if (locker.dataset.endTime) {
    endTime = Math.max(endTime, parseInt(locker.dataset.endTime));
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

      const allLockers = document.querySelectorAll(".locker");
      let allLockersDisabled = true;
      allLockers.forEach((locker) => {
        if (!locker.classList.contains("disabled")) {
          allLockersDisabled = false;
        }
      });
      if (allLockersDisabled) {
        showNoCurrentLockersMessage();
      }

      // 시간이 다 되면 초기화
      showNoCurrentLockersMessage();
    }
  }, 1000);
}






