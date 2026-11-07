const screen = document.querySelector('.screen');
const buttons = document.querySelector('.calculator-buttons');

let buffer = '0';          // what is shown on the screen
let runningTotal = 0;      // result so far
let previousOperator = null;
let startNewNumber = false; // true right after an operator or equals

buttons.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.digit !== undefined) {
        handleDigit(button.dataset.digit);
    } else if (button.dataset.operator) {
        handleOperator(button.dataset.operator);
    } else if (button.dataset.action === 'clear') {
        clearAll();
    } else if (button.dataset.action === 'back') {
        backspace();
    } else if (button.dataset.action === 'equals') {
        equals();
    }

    render();
});

function handleDigit(digit) {
    if (buffer === 'Error' || startNewNumber) {
        buffer = digit;
        startNewNumber = false;
    } else if (buffer === '0') {
        buffer = digit;
    } else {
        buffer += digit;
    }
}

function handleOperator(operator) {
    if (buffer === 'Error') return;

    const current = toNumber(buffer);

    if (previousOperator === null) {
        runningTotal = current;
    } else if (!startNewNumber) {
        // chain operations, e.g. 2 + 3 + -> shows 5
        runningTotal = calculate(runningTotal, current, previousOperator);
        buffer = runningTotal === null ? 'Error' : format(runningTotal);
    }

    previousOperator = operator;
    startNewNumber = true;
}

function equals() {
    if (previousOperator === null || buffer === 'Error') return;

    const result = calculate(runningTotal, toNumber(buffer), previousOperator);
    buffer = result === null ? 'Error' : format(result);
    runningTotal = 0;
    previousOperator = null;
    startNewNumber = true;
}

function calculate(a, b, operator) {
    let result;
    if (operator === '+') {
        result = a + b;
    } else if (operator === '-') {
        result = a - b;
    } else if (operator === '*') {
        result = a * b;
    } else if (operator === '/') {
        if (b === 0) return null; // divide by zero
        result = a / b;
    }
    return result;
}

// trim floating point noise like 0.1 + 0.2 = 0.30000000000000004
function format(number) {
    return String(Math.round(number * 1e10) / 1e10);
}

function clearAll() {
    buffer = '0';
    runningTotal = 0;
    previousOperator = null;
    startNewNumber = false;
}

function backspace() {
    if (startNewNumber || buffer === 'Error') return;

    if (buffer.length === 1 || (buffer.length === 2 && buffer[0] === '-')) {
        buffer = '0';
    } else {
        buffer = buffer.substring(0, buffer.length - 1);
    }
}

// converts the screen text to a number by hand instead of using parseInt / eval
function toNumber(text) {
    let negative = false;
    let value = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '-' && i === 0) {
            negative = true;
        } else if (char === '.') {
            // results can contain decimals, read the fractional part
            let place = 0.1;
            for (let j = i + 1; j < text.length; j++) {
                value += (text.charCodeAt(j) - 48) * place;
                place /= 10;
            }
            break;
        } else {
            value = value * 10 + (text.charCodeAt(i) - 48);
        }
    }

    return negative ? -value : value;
}

function render() {
    screen.textContent = buffer;
}
