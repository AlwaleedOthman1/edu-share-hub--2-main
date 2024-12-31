document.getElementById('messageForm').onsubmit = async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;

  const response = await fetch('/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ name: name, message: message })
  });

  const result = await response.json();

  if (result.status === 'success') {
    alert('Message added successfully!');
    location.reload();
  } else {
    alert('Error adding message');
  }
};
