class Calculator {
    constructor() {
        // State
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.shouldResetDisplay = false;
        this.history = this.loadHistory();

        // DOM elements
        this.expressionDisplay = document.getElementById('expression');
        this.currentInputDisplay = document.getElementById('currentInput');
        this.historyList = document.getElementById('historyList');
        this.themeToggle = document.getElementById('themeToggle');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // Initialize theme
        this.initTheme();

        // Event listeners
        this.setupEventListeners();

        // Update display
        this.updateDisplay();
    }

    initTheme() {
        const isDarkTheme = localStorage.getItem('theme') === 'dark';
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            this.themeToggle.textContent = '☀️';
        } else {
            this.themeToggle.textContent = '🌙';
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.themeToggle.textContent = isDark ? '☀️' : '🌙';
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNumber(e.target.dataset.number));
        });

        // Operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOperator(e.target.dataset.operator));
        });

        // Function buttons
        document.querySelectorAll('.function-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFunction(e.target.dataset.action));
        });

        // Equals button
        document.querySelector('.equals-btn').addEventListener('click', () => this.handleEquals());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Clear history
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // History items
        this.updateHistoryDisplay();
    }

    handleNumber(number) {
        // Reset display if we just pressed an operator
        if (this.shouldResetDisplay) {
            this.currentInput = number;
            this.shouldResetDisplay = false;
        } else {
            // Replace 0 with new number unless it's a decimal
            if (this.currentInput === '0' && number !== '.') {
                this.currentInput = number;
            } else {
                this.currentInput += number;
            }
        }

        this.updateDisplay();
    }

    handleOperator(op) {
        // Convert display operators to calculation operators
        const operatorMap = {
            '÷': '/',
            '×': '*',
            '−': '-',
            '+': '+'
        };

        const calcOperator = operatorMap[op] || op;

        // If we have a pending operation, calculate it first
        if (this.operator !== null && !this.shouldResetDisplay) {
            this.calculate();
        }

        this.previousInput = this.currentInput;
        this.operator = calcOperator;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    handleFunction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'decimal':
                this.addDecimal();
                break;
            case 'toggleSign':
                this.toggleSign();
                break;
            case 'percent':
                this.handlePercent();
                break;
        }
        this.updateDisplay();
    }

    handleEquals() {
        if (this.operator !== null && this.previousInput !== '') {
            this.calculate();
        }
        this.operator = null;
        this.previousInput = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    calculate() {
        if (this.operator === null || this.previousInput === '') {
            return;
        }

        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);

        let result;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentInput = 'Error';
                    this.shouldResetDisplay = true;
                    this.updateDisplay();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Round to avoid floating point errors
        result = Math.round(result * 100000000) / 100000000;

        // Add to history
        const expression = `${this.previousInput} ${this.getDisplayOperator(this.operator)} ${current} = ${result}`;
        this.addToHistory(expression);

        this.currentInput = result.toString();
        this.previousInput = '';
        this.shouldResetDisplay = true;
    }

    getDisplayOperator(operator) {
        const operatorMap = {
            '/': '÷',
            '*': '×',
            '-': '−',
            '+': '+'
        };
        return operatorMap[operator] || operator;
    }

    handlePercent() {
        const value = parseFloat(this.currentInput);
        if (this.operator !== null && this.previousInput !== '') {
            // Percentage of the first number
            const prev = parseFloat(this.previousInput);
            this.currentInput = ((value / 100) * prev).toString();
        } else {
            // Just divide by 100
            this.currentInput = (value / 100).toString();
        }
    }

    toggleSign() {
        const value = parseFloat(this.currentInput);
        this.currentInput = (value * -1).toString();
    }

    addDecimal() {
        // If we should reset, start with 0.
        if (this.shouldResetDisplay) {
            this.currentInput = '0.';
            this.shouldResetDisplay = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.shouldResetDisplay = false;
    }

    updateDisplay() {
        // Update current input display
        this.currentInputDisplay.textContent = this.currentInput;

        // Update expression display
        if (this.operator !== null) {
            this.expressionDisplay.textContent = `${this.previousInput} ${this.getDisplayOperator(this.operator)}`;
        } else {
            this.expressionDisplay.textContent = this.previousInput || '0';
        }
    }

    handleKeyboard(e) {
        const key = e.key;

        // Numbers
        if (key >= '0' && key <= '9') {
            e.preventDefault();
            this.handleNumber(key);
        }

        // Operators
        switch (key) {
            case '+':
                e.preventDefault();
                this.handleOperator('+');
                break;
            case '-':
                e.preventDefault();
                this.handleOperator('−');
                break;
            case '*':
                e.preventDefault();
                this.handleOperator('×');
                break;
            case '/':
                e.preventDefault();
                this.handleOperator('÷');
                break;
            case '.':
            case ',':
                e.preventDefault();
                this.addDecimal();
                this.updateDisplay();
                break;
            case 'Enter':
            case '=':
                e.preventDefault();
                this.handleEquals();
                break;
            case 'Backspace':
                e.preventDefault();
                this.handleBackspace();
                break;
            case 'Escape':
                e.preventDefault();
                this.clear();
                this.updateDisplay();
                break;
        }
    }

    handleBackspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    // History management
    addToHistory(expression) {
        this.history.unshift({
            expression: expression,
            timestamp: new Date().toLocaleTimeString()
        });

        // Keep only last 10 items
        if (this.history.length > 10) {
            this.history.pop();
        }

        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="empty-history">No history yet</p>';
            return;
        }

        this.historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" onclick="calculator.useHistoryItem('${item.expression}')">
                <div>${item.expression}</div>
                <small style="opacity: 0.6; font-size: 12px;">${item.timestamp}</small>
            </div>
        `).join('');
    }

    useHistoryItem(expression) {
        const result = expression.split('=')[1].trim();
        this.currentInput = result;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    clearHistory() {
        if (this.history.length === 0) return;
        if (confirm('Are you sure you want to clear the history?')) {
            this.history = [];
            this.saveHistory();
            this.updateHistoryDisplay();
        }
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize calculator when DOM is ready
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new Calculator();
});
