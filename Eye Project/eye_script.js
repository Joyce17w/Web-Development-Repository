function getRandomPosition() {
    const x = Math.floor(Math.random() * (window.innerWidth - 100)); // Subtract image width to keep it within bounds
    const y = Math.floor(Math.random() * (window.innerHeight - 100)); // Subtract image height to keep it within bounds
    return { x, y };
}

function moveImage(image) {
    const { x, y } = getRandomPosition();
    image.style.transform = `translate(${x}px, ${y}px)`;
}

function moveImageRandomly(image, times, interval) {
    let count = 0;
    const intervalId = setInterval(() => {
        if (count >= times) {
            clearInterval(intervalId);
        } else {
            moveImage(image);
            count++;
        }
    }, interval);
}

// Move the main floating image
moveImageRandomly(document.querySelector('.floating-image'), 10, 10000);

// Move each floating-eye image individually
document.querySelectorAll('.floating-eye').forEach((eye, index) => {
    moveImageRandomly(eye, 10, 10000 + index * 1000);
});

moveImageRandomly('.floating-image', 10, 10000);
moveImageRandomly('.floating-eye', 10, 12000);

const form = document.querySelector('#upload-form');
form.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}