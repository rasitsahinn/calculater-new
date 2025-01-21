document.addEventListener('DOMContentLoaded', function() {
    let display = document.querySelector('.display');
    let calculation = document.querySelector('.calculation');
    let buttons = document.querySelectorAll('.calculator .buttons button');
    let historyList = document.querySelector('.history-list');
    let clearHistoryBtn = document.getElementById('clear-history');
    let firstNumber = '';
    let operator = '';
    let secondNumber = '';
    let result = '';
    let history = [];
    let isNewCalculation = false;
    let isRadianMode = true; // true: radyan, false: derece
    let parenthesesCount = 0;

    // Matematiksel sabitler
    const PI = Math.PI;
    const E = Math.E;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            let value = button.textContent;

            // Sonuç gösteriliyorken yeni işlem için
            if (isNewCalculation) {
                // Eğer operatör tuşuna basıldıysa
                if (['+', '-', '×', '÷', '%', '^'].includes(value)) {
                    firstNumber = display.value; // Son sonucu ilk sayı olarak kullan
                    operator = value;
                    secondNumber = '';
                    calculation.textContent = `${firstNumber} ${operator}`;
                    isNewCalculation = false;
                    return;
                }
                // Eğer sayı tuşuna basıldıysa
                else if (/[0-9.]/.test(value)) {
                    clearAll(); // Yeni sayı için temizle
                    firstNumber = value;
                    display.value = value;
                    calculation.textContent = value;
                    isNewCalculation = false;
                    return;
                }
            }

            // Bilimsel fonksiyonlar
            if (button.classList.contains('function')) {
                handleFunction(value);
                return;
            }

            // Normal hesap makinesi fonksiyonları
            switch (value) {
                case 'C':
                    clearAll();
                    break;
                case '=':
                    calculate();
                    break;
                case '±':
                    toggleSign();
                    break;
                case '+':
                case '-':
                case '×':
                case '÷':
                case '%':
                case '^':
                    handleOperator(value);
                    break;
                default:
                    handleNumber(value);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        // Ctrl veya Command tuşuyla kombinasyonları engelle
        if (event.ctrlKey || event.metaKey) return;

        let key = event.key;
        let keyCode = event.code;

        // Delete tuşu kontrolü
        if (key === 'Delete') {
            event.preventDefault();
            clearAll();
            return;
        }

        // Numpad sayıları için kontrol
        if (keyCode.startsWith('Numpad') && /^Numpad\d$/.test(keyCode)) {
            simulateButtonClick(keyCode.slice(-1));
            return;
        }

        // Normal sayılar için kontrol
        if (/^[0-9]$/.test(key)) {
            if (isNewCalculation) {
                calculation.textContent = display.value;
                display.value = key;
                firstNumber = key;
                isNewCalculation = false;
            } else {
                simulateButtonClick(key);
            }
            return;
        }

        // Operatörler ve özel tuşlar için kontrol
        if (keyboardMap[key] || keyboardMap[keyCode]) {
            event.preventDefault();
            simulateButtonClick(keyboardMap[key] || keyboardMap[keyCode]);
            return;
        }

        // Backspace kontrolü
        if (key === 'Backspace') {
            event.preventDefault();
            handleBackspace();
        }
    });

    // Klavye kısayolları için eşleştirme tablosu
    const keyboardMap = {
        // Temel operatörler
        '+': '+',
        '-': '-',
        '*': '×',
        '/': '÷',
        '%': '%',
        'Enter': '=',
        '=': '=',
        'Escape': 'C',
        '.': '.',
        
        // Bilimsel fonksiyonlar
        's': 'sin',
        'c': 'cos',
        't': 'tan',
        'd': 'DEG',
        'q': 'x²',
        'w': 'x³',
        'r': '√',
        'k': '∛',
        'l': 'log',
        'n': 'ln',
        'p': 'π',
        'e': 'e',
        '^': 'x^y',
        '(': '(',
        ')': ')',
        '|': '|x|'
    };

    function simulateButtonClick(value) {
        const button = Array.from(buttons).find(btn => btn.textContent === value);
        if (button) {
            button.classList.add('active');
            setTimeout(() => button.classList.remove('active'), 100);
            button.click();
        }
    }

    // Tuş eşleştirmelerini gösteren yardım fonksiyonu
    function showKeyboardShortcuts() {
        console.log(`
Klavye Kısayolları:
------------------
Sayılar: 0-9 (normal ve numpad)
Operatörler:
  + : Toplama (normal ve numpad)
  - : Çıkarma (normal ve numpad)
  * : Çarpma (normal ve numpad)
  / : Bölme (normal ve numpad)
  % : Mod
  = veya Enter : Hesapla
  Delete : Tümünü Temizle
  Backspace : Son karakteri sil
  Esc : Temizle

Bilimsel Fonksiyonlar:
  s : sin
  c : cos
  t : tan
  d : DEG/RAD
  q : x²
  w : x³
  r : √
  k : ∛
  l : log
  n : ln
  p : π
  e : e
  ^ : x^y
  ( : Parantez aç
  ) : Parantez kapa
  | : Mutlak değer
`);
    }

    function handleNumber(value) {
        if (operator === '') {
            firstNumber += value;
            display.value = firstNumber;
            calculation.textContent = firstNumber;
        } else {
            secondNumber += value;
            display.value = secondNumber;
            calculation.textContent = `${firstNumber} ${operator} ${secondNumber}`;
        }
    }

    function handleOperator(op) {
        if (firstNumber === '') {
            firstNumber = '0';
        }
        if (secondNumber !== '') {
            calculate();
            // Hesaplama sonrasında yeni operatörü ayarla
            firstNumber = display.value;
        }
        operator = op;
        calculation.textContent = `${firstNumber} ${operator}`;
        isNewCalculation = false;
    }

    function handleFunction(func) {
        let num = parseFloat(display.value || '0');
        let result;

        switch (func) {
            case 'sin':
                result = calculateTrig('sin', num);
                break;
            case 'cos':
                result = calculateTrig('cos', num);
                break;
            case 'tan':
                result = calculateTrig('tan', num);
                break;
            case 'DEG':
                toggleDegreeMode();
                return;
            case 'x²':
                result = Math.pow(num, 2);
                break;
            case 'x³':
                result = Math.pow(num, 3);
                break;
            case '√':
                result = Math.sqrt(num);
                break;
            case '∛':
                result = Math.cbrt(num);
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'π':
                result = PI;
                break;
            case 'e':
                result = E;
                break;
            case 'x^y':
                handleOperator('^');
                return;
            case '|x|':
                result = Math.abs(num);
                break;
        }

        if (result !== undefined) {
            let expression = `${func}(${num})`;
            if (func === 'π' || func === 'e') {
                expression = func;
            }
            addToHistory(expression, result);
            display.value = result;
            calculation.textContent = `${expression} = ${result}`;
            firstNumber = result.toString();
            operator = '';
            secondNumber = '';
            isNewCalculation = true;
        }
    }

    function calculateTrig(func, num) {
        if (!isRadianMode) {
            num = (num * Math.PI) / 180;
        }
        
        let result;
        switch (func) {
            case 'sin':
                result = Math.sin(num);
                break;
            case 'cos':
                result = Math.cos(num);
                break;
            case 'tan':
                result = Math.tan(num);
                break;
        }
        
        // Çok küçük sayıları sıfır olarak göster
        return Math.abs(result) < 1e-10 ? 0 : result;
    }

    function toggleDegreeMode() {
        isRadianMode = !isRadianMode;
        const degButton = Array.from(buttons).find(btn => btn.textContent === 'DEG' || btn.textContent === 'RAD');
        if (degButton) {
            degButton.textContent = isRadianMode ? 'DEG' : 'RAD';
        }
    }

    function calculate() {
        if (firstNumber === '') return;
        
        if (operator && secondNumber === '') {
            secondNumber = firstNumber;
        }

        let num1 = parseFloat(firstNumber);
        let num2 = operator ? parseFloat(secondNumber) : null;
        let expression = operator ? `${num1} ${operator} ${num2}` : firstNumber;
        let calcResult;

        try {
            switch (operator) {
                case '+':
                    calcResult = num1 + num2;
                    break;
                case '-':
                    calcResult = num1 - num2;
                    break;
                case '×':
                    calcResult = num1 * num2;
                    break;
                case '÷':
                    if (num2 === 0) throw new Error('Sıfıra bölünemez');
                    calcResult = num1 / num2;
                    break;
                case '%':
                    calcResult = num1 % num2;
                    break;
                case '^':
                    calcResult = Math.pow(num1, num2);
                    break;
                default:
                    calcResult = num1;
            }

            if (isFinite(calcResult)) {
                result = Number(calcResult.toPrecision(12));
                addToHistory(expression, result);
                display.value = result;
                calculation.textContent = `${expression} = ${result}`;
                firstNumber = result.toString();
                operator = '';
                secondNumber = '';
                isNewCalculation = true;
                animateResult();
            } else {
                throw new Error('Geçersiz işlem');
            }
        } catch (error) {
            display.value = 'Hata';
            calculation.textContent = error.message;
            clearAll();
        }
    }

    function handleParentheses(value) {
        if (value === '(') {
            parenthesesCount++;
            if (operator === '') {
                operator = '×';
            }
            secondNumber = '(';
        } else if (value === ')' && parenthesesCount > 0) {
            parenthesesCount--;
            secondNumber += ')';
        }
        updateDisplay();
    }

    function addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result
        };
        
        if (history.length > 0) {
            const lastItem = history[history.length - 1];
            if (lastItem.expression === expression && lastItem.result === result) {
                return;
            }
        }
        
        history.push(historyItem);
        if (history.length > 2) {
            history.shift();
        }
        updateHistoryDisplay();
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        history.slice().reverse().forEach((item, index) => {
            const historyEntry = document.createElement('div');
            historyEntry.className = 'history-entry';
            
            // Sayıları kısaltma ve formatla
            const formatNumber = (num) => {
                if (typeof num === 'number') {
                    if (Math.abs(num) < 1e-10) return '0';
                    if (Math.abs(num) >= 1e10 || Math.abs(num) < 1e-6) {
                        return num.toExponential(4);
                    }
                    return num.toPrecision(6).replace(/\.?0+$/, '');
                }
                return num;
            };

            const formattedResult = formatNumber(Number(item.result));
            const formattedExpression = item.expression.length > 20 ? 
                item.expression.substring(0, 20) + '...' : 
                item.expression;

            historyEntry.innerHTML = index === 0 ? 
                `→ ${formattedExpression} = ${formattedResult}` :
                `${formattedExpression} = ${formattedResult}`;
            
            historyEntry.title = `${item.expression} = ${item.result}`; // Tam ifadeyi tooltip olarak göster
            
            historyEntry.addEventListener('click', () => {
                display.value = item.result;
                firstNumber = item.result.toString();
                operator = '';
                secondNumber = '';
                isNewCalculation = true;
            });
            
            historyList.appendChild(historyEntry);
        });
    }

    function clearAll() {
        display.value = '0';
        calculation.textContent = '0';
        firstNumber = '';
        operator = '';
        secondNumber = '';
        result = '';
        parenthesesCount = 0;
        isNewCalculation = false;
    }

    function toggleSign() {
        if (operator === '') {
            firstNumber = (-parseFloat(firstNumber || display.value)).toString();
            display.value = firstNumber;
            calculation.textContent = firstNumber;
        } else {
            secondNumber = (-parseFloat(secondNumber)).toString();
            display.value = secondNumber;
            calculation.textContent = `${firstNumber} ${operator} ${secondNumber}`;
        }
    }

    function updateDisplay() {
        let displayExpression = '';
        if (firstNumber !== '') {
            displayExpression = firstNumber;
            if (operator !== '') {
                displayExpression += ` ${operator} `;
                if (secondNumber !== '') {
                    displayExpression += secondNumber;
                }
            }
        }
        calculation.textContent = displayExpression || '0';
    }

    function handleBackspace() {
        if (isNewCalculation) return;

        if (operator === '') {
            firstNumber = firstNumber.slice(0, -1);
            display.value = firstNumber || '0';
        } else if (secondNumber !== '') {
            secondNumber = secondNumber.slice(0, -1);
            display.value = secondNumber || '0';
        }
        updateDisplay();
    }

    // CSS için active class stilini ekleyelim
    const style = document.createElement('style');
    style.textContent = `
        .calculator button.active {
            background-color: #e0e0e0 !important;
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    // Sayfa yüklendiğinde kısayolları konsola yazdır
    window.addEventListener('load', () => {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            history = JSON.parse(savedHistory);
            updateHistoryDisplay();
        }
        showKeyboardShortcuts();
        createGraffiti();
    });

    function createGraffiti() {
        // Grafiti stillerini çeşitlendirelim
        const styles = [
            {
                text: '41',
                style: 'normal'
            },
            {
                text: '4₁',
                style: 'subscript'
            },
            {
                text: '४१',
                style: 'devanagari'
            },
            {
                text: '㊃①',
                style: 'circle'
            }
        ];

        const sizes = ['70px', '90px', '120px', '150px', '180px'];
        const rotations = [-45, -30, -15, 0, 15, 30, 45];
        const positions = generateUniquePositions(20); // Çakışmaları önlemek için

        for (let i = 0; i < 20; i++) {
            const graffiti = document.createElement('div');
            graffiti.className = 'graffiti';
            
            // Rastgele stil seç
            const styleChoice = styles[Math.floor(Math.random() * styles.length)];
            graffiti.textContent = styleChoice.text;
            
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            const rotation = rotations[Math.floor(Math.random() * rotations.length)];
            const position = positions[i];
            
            // Rastgele opaklık ve renk varyasyonu
            const opacity = 0.03 + Math.random() * 0.07;
            const hue = Math.random() * 20 - 10; // Yeşil tonlarında küçük varyasyon
            
            graffiti.style.cssText = `
                position: fixed;
                left: ${position.x}vw;
                top: ${position.y}vh;
                font-size: ${size};
                --rotation: ${rotation}deg;
                opacity: 0;
                color: rgba(46, ${204 + hue}, 113, ${opacity});
                animation: 
                    fadeInGraffiti 1s ease-out forwards,
                    pulseGraffiti ${3 + Math.random() * 2}s ease-in-out infinite;
                animation-delay: ${i * 0.15}s, ${1 + i * 0.15}s;
                transform-origin: center center;
            `;
            
            document.body.appendChild(graffiti);
        }
    }

    // Çakışmaları önlemek için pozisyon üreteci
    function generateUniquePositions(count) {
        const positions = [];
        const gridSize = 20; // Sayfayı grid'lere böl
        const usedCells = new Set();

        for (let i = 0; i < count; i++) {
            let cell;
            do {
                const x = Math.floor(Math.random() * gridSize);
                const y = Math.floor(Math.random() * gridSize);
                cell = `${x},${y}`;
            } while (usedCells.has(cell));

            usedCells.add(cell);
            positions.push({
                x: (100 / gridSize) * (Math.floor(Math.random() * gridSize)),
                y: (100 / gridSize) * (Math.floor(Math.random() * gridSize))
            });
        }

        return positions;
    }

    // Hesap makinesi sonuç animasyonu
    function animateResult() {
        display.style.transform = 'scale(1.05)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 200);
    }
}); 