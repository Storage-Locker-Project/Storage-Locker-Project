document.addEventListener("DOMContentLoaded", function () {
  const lockers = document.querySelectorAll(".locker");
  lockers.forEach((locker) => {
    locker.addEventListener("click", function () {
      if (!this.classList.contains("disabled")) {
        openModal(this.id);
      }
    });
  });
});

function openModal(lockerId) {
  const modal = document.getElementById("timeModal");
  const span = document.getElementsByClassName("close")[0];
  const confirmBtn = document.getElementById("confirmTime");

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
  const endTime = new Date().getTime() + hours * 3600 * 1000;
  const locker = document.getElementById(lockerId);
  locker.classList.add("disabled");

  updateCountdown(lockerId, endTime);
}

function updateCountdown(lockerId, endTime) {
  const locker = document.getElementById(lockerId);
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = endTime - now;

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    locker.textContent = `Locker ${lockerId.replace(
      "locker",
      ""
    )} - ${hours}h ${minutes}m ${seconds}s`;

    if (distance < 0) {
      clearInterval(interval);
      locker.classList.remove("disabled");
      locker.textContent = `Locker ${lockerId.replace("locker", "")}`;
    }
  }, 1000);
}
