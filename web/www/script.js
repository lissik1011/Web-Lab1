    const button = document.querySelector('.query');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext("2d");

    const buttons = document.querySelectorAll('button[name="X"]');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            const selectedValue = this.getAttribute('value')/10;
            document.getElementById('hiddenX').value = selectedValue;
        });
    });

    button.addEventListener('click', () => {
        const body = makeForm();
        if (body == null) {
            return;
        }

        fetch('/fcgi-bin/Server.jar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        }).then(response => {
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
        // .then(data => console.log('Html row from server:\n', data))
        .catch(error => {
            console.error('Fetch failed: ', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        console.log('Ошибка при отправке запроса:\n' + error.message);
        })
    });

    const R = document.getElementById("R");
    const Y = document.getElementById("Y");
    const X = document.getElementById("hiddenX");

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

    function makeForm() {
        if (!checkForm()) {
            return null;
        }

        let R = document.getElementById("R");
        let Y = document.getElementById("Y");
        let X = document.getElementById("hiddenX");
        
        const formData = new URLSearchParams();
        formData.append('X', X.value);
        formData.append('Y', Y.value);
        formData.append('R', R.value);

        return formData;
    }

    function checkForm() {

        let R = document.getElementById("R").value;
        let Y = document.getElementById("Y").value;
        let X = document.getElementById("hiddenX").value;
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

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        draw_I();
        draw_II();
        draw_III();
        makeXOY();
        drawPoint();
        
    }

    function drawPoint() {
        const scale = 30;
        let x = Number(X.value)*scale + 190;
        let y = -Number(Y.value)*scale + 190;

        ctx.beginPath();
        ctx.strokeStyle = "#4c835a";
        ctx.fillStyle = "#4c835a";

        moveTo(x, y);
        ctx.arc(x, y, 3, 0, Math.PI*2, false);
        ctx.fill();

        ctx.closePath();
        ctx.stroke();
    }

    function draw_I() {
        let r = R.value;
        const scale = 30;

        ctx.beginPath();
        ctx.strokeStyle = "#b3dbbd";
        ctx.fillStyle = "#b3dbbde5";
        ctx.lineWidth = 0.8

        ctx.moveTo(190, 190);
        ctx.arc(190, 190, r*scale/2, -Math.PI/2, 0, false);
        ctx.fill();

        ctx.closePath();
        ctx.stroke();
    }

    function draw_II() {
        let r = R.value;
        const scale = 30;
        
        ctx.beginPath();
        ctx.strokeStyle = "#b3dbbd";
        ctx.fillStyle = "#b3dbbde5";
        ctx.lineWidth = 0.8

        ctx.fillRect(190, 190, -r*scale, -r*scale/2);

        ctx.closePath();
        ctx.stroke();
    }

    function draw_III() {
        let r = R.value;
        const scale = 30;
        
        ctx.beginPath();
        ctx.strokeStyle = "#b3dbbd";
        ctx.fillStyle = "#b3dbbde5";
        ctx.lineWidth = 0.8

        ctx.moveTo(190, 190);
        ctx.lineTo(190 - r*scale/2, 190);
        ctx.lineTo(190, 190 + r*scale);
        ctx.lineTo(190, 190);
        ctx.fill();

        ctx.closePath();
        ctx.stroke();    
    }

    function makeXOY() {
        let r = R.value;
        const x = document.getElementById('hiddenX').value;

        ctx.beginPath();
        ctx.strokeStyle = "#000000ff";
        ctx.fillStyle = "#000000ff";
        ctx.lineWidth = 0.8

        ctx.moveTo(190, 190);
        ctx.lineTo(190, 380);
        ctx.moveTo(190, 190);
        ctx.lineTo(190, 0);
        ctx.lineTo(198, 7);
        ctx.moveTo(190, 0);
        ctx.lineTo(182, 7);
        ctx.fillText("Y", 210, 9);

        ctx.moveTo(190, 190);
        ctx.lineTo(0, 190);
        ctx.moveTo(190, 190);
        ctx.lineTo(380, 190);
        ctx.lineTo(373, 198);
        ctx.moveTo(380, 190);
        ctx.lineTo(373, 182);
        ctx.fillText("X", 371, 170);

        ctx.closePath();
        ctx.stroke();

        for (let i = 30; i < 180; i += 30) {
            makeOX(i/30, 190 + i, 190);
            makeOX(-i/30, 190 - i, 190);
        }

        for (let i = 30; i < 180; i += 30) {
            makeOY(-i/30, 190, 190 + i);
            makeOY(i/30, 190, 190 - i);
        }
    }

    function makeOX(i, x, y) {
        ctx.beginPath();
        ctx.strokeStyle = "#000000ff";
        ctx.fillStyle = "#000000ff";
        ctx.lineWidth = 0.8

        ctx.moveTo(x, y);
        ctx.lineTo(x, y+5);
        ctx.moveTo(x, y);
        ctx.lineTo(x, y-5);
        ctx.moveTo(x, y);
        ctx.fillText(i, x-3, y+17);

        ctx.closePath();
        ctx.stroke();
    }

    function makeOY(i, x, y) {
        ctx.beginPath();
        ctx.strokeStyle = "#000000ff";
        ctx.fillStyle = "#000000ff";
        ctx.lineWidth = 0.8

        ctx.moveTo(x, y);
        ctx.lineTo(x+5, y);
        ctx.moveTo(x, y);
        ctx.lineTo(x-5, y);
        ctx.moveTo(x, y);
        ctx.fillText(i, x+12, y+4);

        ctx.closePath();
        ctx.stroke();
    }


    draw();
    document.getElementById("R").addEventListener("input", draw);
    document.getElementById("Y").addEventListener("input", draw);

    buttons.forEach(button => {
    button.addEventListener('click', draw);
    });

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();

        const xRaw = ((e.clientX - rect.left - 190)/30);
        const xRoundedToHalf = Math.round(xRaw * 2) / 2;
        const x = xRoundedToHalf.toFixed(1);
        const y = (-(e.clientY - rect.top - 190)/30).toFixed(5);

        if (x > 2 || x < -2 || y > 5 || y < -2) return;

        document.getElementById("hiddenX").value = x;
        document.getElementById("Y").value = y;
        
        buttons.forEach(button => {
            button.classList.remove('selected');
        });

        const xNum = parseFloat(x)*10;
        const targetButton = Array.from(buttons).find(btn => {
            const bAtt = parseFloat(btn.getAttribute('value'))
            return Math.abs(bAtt - xNum) < 5;
            }
        );

        if (targetButton) {
            targetButton.classList.add('selected');
        }

        draw();
    });



