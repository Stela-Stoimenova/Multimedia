window.onload = function() {
    const canvas = document.getElementById('chartCanvas');
    const context = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    const xIncrement = 150;
    const yIncrement = 100;
    const valueIncrement = 20;
    const textOffset = 5;

    const maxPoints = Math.floor(width / valueIncrement) + 1;

    // three series with distinct colors
    const series = [
        { name: 'A', color: '#2ecc71', data: [] },
        { name: 'B', color: '#3498db', data: [] },
        { name: 'C', color: '#e74c3c', data: [] }
    ];

    let gridOn = true;
    let smoothing = false;
    let chartType = 'line';
    let interval = 1000;
    let timer = null;
    let minGen = 0;
    let maxGen = height;

    const tooltip = document.getElementById('tooltip');

    function drawVerticalLines()
    {
        if (!gridOn) return;
        context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid') || 'rgba(128,128,128,0.6)';
        context.lineWidth = 1;

        for(let i = 0; i <= width; i += xIncrement)
        {
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo(i, height);
            context.stroke();
        }
    }

    function drawHorizontalLines()
    {
        if (!gridOn) return;
        context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid') || 'rgba(128,128,128,0.6)';
        context.lineWidth = 1;

        for (let i = 0; i <= height; i += yIncrement)
        {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(width, i);
            context.stroke();
        }
    }

    function drawVerticalLabels()
    {
        context.fillStyle = getComputedStyle(document.body).getPropertyValue('--fg') || 'black';
        context.font = '12px Arial';
        context.textBaseline = 'middle';

        for (let i = 0; i <= height; i += yIncrement)
        {
            context.fillText((height - i).toString(), textOffset, i);
        }
    }

    function drawHorizontalLabels()
    {
        context.fillStyle = getComputedStyle(document.body).getPropertyValue('--fg') || 'black';
        context.font = '12px Arial';
        context.textBaseline = 'bottom';

        for (let i = 0; i <= width; i+=xIncrement)
        {
            context.fillText(i.toString(), i + textOffset, height - textOffset);
        }
    }

    function drawChart()
    {
        series.forEach(s => {
            if (!s.data || s.data.length === 0) return;

            context.strokeStyle = s.color;
            context.fillStyle = s.color;
            context.lineWidth = 3;

            if (chartType === 'bar') {
                const w = valueIncrement * 0.7;
                s.data.forEach((v,i) => {
                    const x = i * valueIncrement - w/2;
                    const h = v;
                    context.fillRect(x, height - h, w, h);
                });
                return;
            }

            if (chartType === 'scatter') {
                s.data.forEach((v,i) => {
                    const x = i * valueIncrement;
                    const y = height - v;
                    context.beginPath();
                    context.arc(x, y, 4, 0, Math.PI*2);
                    context.fill();
                });
                return;
            }

            // line / area
            context.beginPath();
            const d = s.data;
            const n = d.length;
            context.moveTo(0, height - d[0]);

            for (let i = 1; i < n; i++) {
                const x = i * valueIncrement;
                const y = height - d[i];
                if (smoothing && i > 0) {
                    const prevX = (i-1) * valueIncrement;
                    const prevY = height - d[i-1];
                    const cx = (prevX + x) / 2;
                    context.quadraticCurveTo(prevX, prevY, cx, (prevY + y) / 2);
                    context.quadraticCurveTo(cx, (prevY + y) / 2, x, y);
                } else {
                    context.lineTo(x, y);
                }
            }

            if (chartType === 'area') {
                context.lineTo((n-1)*valueIncrement, height);
                context.lineTo(0, height);
                context.closePath();
                context.globalAlpha = 0.18;
                context.fill();
                context.globalAlpha = 1;
            } else {
                context.stroke();
            }
        });
    }

    function generateRandomNumber()
    {
        return Math.floor(minGen + Math.random() * (maxGen - minGen));
    }

    function generateData()
    {
        series.forEach(s => {
            s.data = [];
            for (let i = 0; i < maxPoints; i++) {
                let v = generateRandomNumber();
                if (s.name === 'B') v = Math.floor((Math.sin(i/10) + 1)/2 * maxGen * 0.7 + Math.random()*50);
                if (s.name === 'C') v = Math.floor((i % 20) * (maxGen/20) * Math.random());
                s.data.push(Math.max(minGen, Math.min(maxGen, v)));
            }
        });
    }

    function draw()
    {
        context.clearRect(0, 0, width, height);
        drawVerticalLines();
        drawHorizontalLines();
        drawVerticalLabels();
        drawHorizontalLabels();
        drawChart();
    }

    function generateNewValue()
    {
        series.forEach(s => {
            let v = generateRandomNumber();
            if (s.name === 'B') v = Math.floor((Math.sin(Date.now()/1000) + 1)/2 * maxGen * 0.7 + Math.random()*50);
            if (s.name === 'C') v = Math.floor(Math.random() * (maxGen/2) + Math.random() * 50);
            s.data.push(Math.max(minGen, Math.min(maxGen, v)));
            while (s.data.length > maxPoints) s.data.shift();
        });
    }

    // UI elements
    const toggleBtn = document.getElementById('toggleBtn');
    const speedRange = document.getElementById('speedRange');
    const minInput = document.getElementById('minVal');
    const maxInput = document.getElementById('maxVal');
    const gridToggle = document.getElementById('gridToggle');
    const smoothToggle = document.getElementById('smoothToggle');
    const chartTypeSel = document.getElementById('chartType');
    const resetBtn = document.getElementById('resetBtn');
    const exportBtn = document.getElementById('exportBtn');
    const themeSel = document.getElementById('themeSelect');
    const statsContent = document.getElementById('statsContent');

    function startTimer() {
        stopTimer();
        timer = setInterval(() => { generateNewValue(); draw(); updateStats(); }, interval);
        toggleBtn.textContent = 'Pause';
    }
    function stopTimer() { if (timer) clearInterval(timer); timer = null; toggleBtn.textContent = 'Start'; }

    toggleBtn.addEventListener('click', () => { if (timer) stopTimer(); else startTimer(); });
    speedRange.addEventListener('input', (e) => { interval = Number(e.target.value); if (timer) startTimer(); });
    minInput.addEventListener('change', (e) => { minGen = Number(e.target.value); generateData(); draw(); updateStats(); });
    maxInput.addEventListener('change', (e) => { maxGen = Number(e.target.value); generateData(); draw(); updateStats(); });
    gridToggle.addEventListener('change', (e) => { gridOn = e.target.checked; draw(); });
    smoothToggle.addEventListener('change', (e) => { smoothing = e.target.checked; draw(); });
    chartTypeSel.addEventListener('change', (e) => { chartType = e.target.value; draw(); });
    resetBtn.addEventListener('click', () => { generateData(); draw(); updateStats(); });
    exportBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'chart.png';
        a.click();
    });
    themeSel.addEventListener('change', (e) => { document.body.className = e.target.value; draw(); });

    // tooltip
    canvas.addEventListener('mousemove', (ev) => {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const idx = Math.round(x / valueIncrement);
        if (idx < 0 || idx >= maxPoints) { tooltip.style.display='none'; return; }
        let html = '';
        series.forEach(s => { const v = s.data[idx]!==undefined? s.data[idx] : '-'; html += `<div><span style="color:${s.color}">●</span> ${s.name}: ${v}</div>`; });
        tooltip.innerHTML = html;
        tooltip.style.left = (x + 12) + 'px';
        tooltip.style.top = (y + 12) + 'px';
        tooltip.style.display = 'block';
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.display='none'; });

    function updateStats() {
        let html = '';
        series.forEach(s => {
            const last = s.data[s.data.length-1] || 0;
            const min = Math.min(...s.data);
            const max = Math.max(...s.data);
            const avg = Math.round(s.data.reduce((a,b)=>a+b,0)/s.data.length);
            const trend = s.data.length > 1 && s.data[s.data.length-1] >= s.data[s.data.length-2] ? '↑' : '↓';
            html += `<div><strong style="color:${s.color}">${s.name}</strong> cur:${last} min:${min} max:${max} avg:${avg} ${trend}</div>`;
        });
        statsContent.innerHTML = html;
    }

    // init
    generateData();
    draw();
    updateStats();
    startTimer();
}