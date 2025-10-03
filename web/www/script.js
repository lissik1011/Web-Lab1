const button = document.querySelector('.query');

button.addEventListener('click', () => {
    const body = makeForm();
    if (body == null) {
        return;
    }

    fetch('http://localhost:8080/fcgi-bin/Server.jar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    }).then(async response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status ${response.status}`);
        }
        return response.text();
    })
    .then(htmlRow => {
        const tbody = document.querySelector('#table tbody');
        tbody.insertAdjacentHTML('beforeend', htmlRow);
        return htmlRow;
    })
    .then(data => console.log('Html row from server:\n', data))
    .catch(error => console.error('Fetch error:', error))
});

const R = document.getElementById("R");
const Y = document.getElementById("Y");
R.addEventListener('paste', (e) => {
    e.preventDefault(); 
});
Y.addEventListener('paste', (e) => {
    e.preventDefault(); 
});
R.addEventListener("input", validateR);
Y.addEventListener("input", validateY);


function validateR(e) {
    console.log("Start of validating R");

    e.target.value = e.target.value.replace(/[^0-9.-]/g, "");
    const input = e.target;
    const selectionStart = input.selectionStart;
    let value = input.value;

    if (value === "" || value === "-" || value === ".") {
        return;
    }

    if (isNaN(Number(value))) {
        input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
    if (Number(value) > 5) {
        input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
    if (Number(value) < 2) {
        input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
}
function validateY(e) {
    console.log("Start of validating Y");

    e.target.value = e.target.value.replace(/[^0-9.-]/g, "");
    const input = e.target;
    const selectionStart = input.selectionStart;
    let value = input.value;

    if (value === "" || value === "-" || value === ".") {
        return;
    }

    if (isNaN(Number(value))) {
        input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
    if (Number(value) > 5) {
        input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
    if (Number(value) < -2) {
        input.value = value.slice(0, selectionStart - 1) + value.slice(selectionStart);
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
    }
}
function takeX() {
    const xRadios = document.querySelectorAll('input[name="X"]');

    let X = null;
    for (const radio of xRadios) {
        if (radio.checked) {
            X = radio.value;
            break;
        }
    }
    if (X === null) {
        alert('Выбери координату X!');
        return;
    }
    return X;
}

function makeForm() {
    if (!checkForm()) {
        return null;
    }

    let R = document.getElementById("R");
    let Y = document.getElementById("Y");
    let X = takeX();
    
    const formData = new URLSearchParams();
    formData.append('X', X);
    formData.append('Y', Y.value);
    formData.append('R', R.value);

    return formData;
}
function checkForm() {

    let R = document.getElementById("R").value;
    let Y = document.getElementById("Y").value;
    let X = takeX();
    console.log("R:", R, "X:", X, "Y:", Y);

    if (!X) {
        alert("X не выбран!");
        return false;
    }
    if (!Y) {
        alert("Поле Y не заполнено!");
        return false;
    }
    if (Y < -2 || Y > 5) {
        alert("Значение Y должно быть от -2 до 5");
        return false;
    }
    if (!R) {
        alert("Поле R не заполнено!");
        return false;
    }
    if (R < 2 || R > 5) {
        alert("Значение R должно быть от 2 до 5");
        return false;
    }
    console.log("Form is complited.");
    return true;
}

