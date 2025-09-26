

fetch('http://localhost:8080/fastcgi-bin/server/jar', {
    method: 'POST',
    headers: {
        'ContentType': 'application/x-www-form-urlencoding'
    },
    body: 'mama'
}).then(async response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Fetch error:', error))



// document.addEventListener('DOMContentLoaded', () => {
//   const y = document.getElementById("Y");

//   function validateY(value) {
//     const num = parseFloat(value);
//     if (isNaN(num)) return {velid: false, error: 'Это не число.'};

//     const min = -5, max = 5;
//     if (max <= num || num <= min) return {valid: false, warning: `Число должно находится в диапазоне [${min}; ${max}]!`};

//     return {valid: true, value: num};
//   }

//   inputY.addEventListener('input', (e) => {
//     const value = e.target.value;
//     const result = validateY(value);
//   })

// }
// )





// document.addEventListener('DOMContentLoaded', () => {
//   const canvas = document.getElementById('graph');
//   const ctx = canvas.getContext('2d');
//   const width = canvas.width;
//   const height = canvas.height;

//   const xMin = -5;
//   const xMax = 5;
//   const yMin = -5;
//   const yMax = 5;

//   function drawFunction() {
//     ctx.clearRect(0, 0, width, height);

//     // Оси
//     ctx.strokeStyle = '#ccc';
//     ctx.lineWidth = 1;
//     const centerX = width / 2;
//     const centerY = height / 2;

//     ctx.beginPath();
//     ctx.moveTo(0, centerY);
//     ctx.lineTo(width, centerY);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(centerX, 0);
//     ctx.lineTo(centerX, height);
//     ctx.stroke();

//     // График y = sin(x)
//     ctx.strokeStyle = '#007bff';
//     ctx.lineWidth = 2;
//     ctx.beginPath();

//     const steps = 1000;
//     for (let i = 0; i <= steps; i++) {
//       const x = xMin + (i / steps) * (xMax - xMin);
//       const y = Math.sin(x);

//       const px = ((x - xMin) / (xMax - xMin)) * width;
//       const py = height - ((y - yMin) / (yMax - yMin)) * height;

//       if (i === 0) {
//         ctx.moveTo(px, py);
//       } else {
//         ctx.lineTo(px, py);
//       }
//     }
//     ctx.stroke();
//   }

//   drawFunction();
// });