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

  var expandButton = document.getElementById("expand");
  expandButton.addEventListener("click", function () {
    this.classList.add("clicked");
    setTimeout(() => {
      this.classList.remove("clicked");
    }, 300);

    if (currentLockerId) {
      openModal(currentLockerId, "extend");
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
    const hours = document.getElementById("hours").value;
    reserveLocker(lockerId, hours);
    modal.style.display = "none";
    currentLockerId = null; // 모달이 닫힐 때 currentLockerId 초기화
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

function updateCountdown(lockerId, endTime) {
  const locker = document.getElementById(lockerId);
  const US = document.getElementById("US"); // 이 줄을 함수 내부에서 함수 외부로 이동

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

      // 모든 보관함이 비활성화되었는지 확인
      const allLockers = document.querySelectorAll(".locker");
      let allLockersDisabled = true;
      allLockers.forEach((locker) => {
        if (!locker.classList.contains("disabled")) {
          allLockersDisabled = false;
        }
      });

      if (allLockersDisabled) {
        US.innerHTML = "현재 사용하시는 사물함이 없습니다.";
      }
    }
  }, 1000);
}
