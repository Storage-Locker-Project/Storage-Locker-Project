let currentLockerId = null; // 현재 선택된 보관함 ID를 저장하는 전역 변수
let lockerTimers = {};

document.addEventListener("DOMContentLoaded", function () {
  const lockers = document.querySelectorAll(".locker");
  lockers.forEach((locker) => {
    locker.addEventListener("click", function () {
      if (!this.classList.contains("disabled")) {
        currentLockerId = this.id;
        openModal(this.id);
      }
    });
  });
});

function openModal(lockerId, mode) {
  const modal = document.getElementById("timeModal");
  const span = document.getElementsByClassName("close")[0];
  const confirmBtn = document.getElementById("confirmTime");

  const nameInput = modal.querySelector("input[placeholder='이름']");
  const emailInput = modal.querySelector("input[placeholder='이메일']");

  if (mode === "extend") {
    let expandname = document.getElementById("expandName");
    expandname.textContent = "연장할 시간을 입렵해주세요";
    nameInput.style.display = "none";
    emailInput.style.display = "none";
  } else {
    nameInput.style.display = "block";
    emailInput.style.display = "block";
  }

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  };

  confirmBtn.onclick = function () {
    const hours = document.getElementById("hours").value;
    reserveLocker(lockerId, hours);
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function reserveLocker(lockerId, hours) {
  // const endTime = new Date().getTime() + hours * 3600 * 1000;
  const locker = document.getElementById(lockerId);
  // locker.classList.add("disabled");

  // 기존 종료 시간 가져오기 또는 현재 시간 사용
  let endTime = new Date().getTime();
  if (locker.dataset.endTime) {
    endTime = Math.max(endTime, parseInt(locker.dataset.endTime));
  }

  // 추가 시간을 반영하여 새로운 종료 시간 설정
  endTime += hours * 3600 * 1000;

  // 새로운 종료 시간을 locker 요소에 저장
  locker.dataset.endTime = endTime.toString();

  locker.classList.add("disabled");

  updateCountdown(lockerId, endTime);
}

function updateCountdown(lockerId, endTime) {
  const locker = document.getElementById(lockerId);
  // 이전 타이머가 있다면 취소
  if (lockerTimers[lockerId]) {
    clearInterval(lockerTimers[lockerId]);
  }

  lockerTimers[lockerId] = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;
    const expand = document.getElementById("expand");
    expand.style.display = "block";
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    US.innerHTML = `보관함 ${lockerId} <br>${hours}시간 ${minutes}분 ${seconds}초 남았습니다`;

    if (distance < 0) {
      clearInterval(lockerTimers[lockerId]);
      locker.classList.remove("disabled");
      locker.textContent = `Locker ${lockerId.replace("locker", "")}`;
      delete lockerTimers[lockerId]; // 타이머 사용 후 삭제
    }
  }, 1000);
}

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
