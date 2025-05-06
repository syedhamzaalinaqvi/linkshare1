// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBH_lgpYQtF0KHodqs0sL7dGjhJWjNs2SM",
    authDomain: "linkshare-a5b4b.firebaseapp.com",
    databaseURL: "https://linkshare-a5b4b-default-rtdb.firebaseio.com",
    projectId: "linkshare-a5b4b",
    storageBucket: "linkshare-a5b4b.appspot.com",
    messagingSenderId: "1042493714343",
    appId: "1:1042493714343:web:b4f7a6d5a5d8a5b1c5d5a5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const problemTypeSelect = document.getElementById('problem-type');
const problemInput = document.getElementById('problem-input');
const solveBtn = document.getElementById('solve-btn');
const solutionOutput = document.getElementById('solution-output');
const solutionSteps = document.getElementById('solution-steps');
const historyList = document.getElementById('history-list');

// History array to store recent problems
let problemHistory = [];

// Load history from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    renderMathExpressions();
    
    // Add example problem click handlers
    document.querySelectorAll('.example-problem').forEach(example => {
        example.addEventListener('click', () => {
            problemInput.value = example.dataset.problem;
        });
    });
});

// Solve button click handler
function solveProblem() {
    const problemType = problemTypeSelect.value;
    const problem = problemInput.value.trim();
    
    if (!problem) {
        showError('Please enter a math problem');
        return;
    }
    
    // Show loading state
    solutionOutput.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Solving your problem...</p>';
    solutionSteps.innerHTML = '';
    
    try {
        // Solve the problem based on type
        let solution, steps;
        
        switch (problemType) {
            case 'algebra':
                [solution, steps] = solveAlgebra(problem);
                break;
            case 'simplify':
                [solution, steps] = simplifyExpression(problem);
                break;
            case 'calculus':
                [solution, steps] = solveCalculus(problem);
                break;
            case 'matrix':
                [solution, steps] = solveMatrix(problem);
                break;
            default:
                [solution, steps] = solveAlgebra(problem);
        }
        
        // Display solution
        displaySolution(problem, solution, steps);
        
        // Add to history
        addToHistory(problemType, problem, solution);
        
        // Render math expressions
        renderMathExpressions();
        
    } catch (error) {
        showError('Could not solve this problem. Please check your input and try again.');
        console.error(error);
    }
}

// Solve algebra problems
function solveAlgebra(problem) {
    let solution = '';
    let steps = [];
    
    try {
        // Check if it's an equation (contains =)
        if (problem.includes('=')) {
            // Split into left and right sides
            const [leftSide, rightSide] = problem.split('=').map(side => side.trim());
            
            steps.push({
                description: 'First, let\'s identify our equation',
                expression: `${leftSide} = ${rightSide}`
            });
            
            // Parse expressions
            const leftExpr = math.parse(leftSide);
            const rightExpr = math.parse(rightSide);
            
            // Move everything to left side
            steps.push({
                description: 'To solve this equation, we\'ll move all terms to the left side by subtracting the right side from both sides',
                expression: `${leftSide} - (${rightSide}) = 0`
            });
            
            const equation = math.parse(`${leftSide}-(${rightSide})`);
            const simplified = math.simplify(equation);
            const simplifiedStr = simplified.toString();
            
            steps.push({
                description: 'Now we simplify the left side of the equation',
                expression: `${simplifiedStr} = 0`
            });
            
            // Determine the degree of the polynomial
            const degree = getDegree(simplifiedStr, 'x');
            
            // Check if it's a linear equation (degree 1)
            if (degree === 1) {
                // Extract coefficients for linear equation
                let a = 0;
                let b = 0;
                
                // This is a simplified approach - in a real app, we'd use more robust parsing
                const terms = simplifiedStr.split(/(?=\+)|(?=-)/g).filter(term => term);
                
                terms.forEach(term => {
                    const trimmedTerm = term.trim();
                    if (trimmedTerm.includes('x')) {
                        // Handle coefficient of x
                        if (trimmedTerm === 'x') {
                            a = 1;
                        } else if (trimmedTerm === '-x') {
                            a = -1;
                        } else {
                            a = parseFloat(trimmedTerm.replace('x', ''));
                        }
                    } else {
                        // Handle constant term
                        b = parseFloat(trimmedTerm);
                    }
                });
                
                steps.push({
                    description: `I can see this is a linear equation in the form ax + b = 0`,
                    expression: `${a}x + ${b} = 0`
                });
                
                // Solve for x: ax + b = 0 => x = -b/a
                steps.push({
                    description: `To isolate x, I'll subtract ${b} from both sides`,
                    expression: `${a}x = ${-b}`
                });
                
                if (a !== 1) {
                    steps.push({
                        description: `Now I'll divide both sides by ${a} to solve for x`,
                        expression: `x = ${-b} ÷ ${a}`
                    });
                    
                    const x = -b / a;
                    steps.push({
                        description: `Simplifying the division`,
                        expression: `x = ${x}`
                    });
                    
                    solution = `x = ${x}`;
                } else {
                    solution = `x = ${-b}`;
                }
            } 
            // Check if it's a quadratic equation (degree 2)
            else if (degree === 2) {
                steps.push({
                    description: `I notice this is a quadratic equation in the form ax² + bx + c = 0`,
                    expression: simplifiedStr + ' = 0'
                });
                
                // Extract coefficients for quadratic equation
                // This is a simplified approach - in a real app, we'd use more robust parsing
                let a = 0, b = 0, c = 0;
                
                // Try to extract coefficients using regex
                const x2Match = simplifiedStr.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*x\^2/);
                const xMatch = simplifiedStr.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*x(?!\^)/);
                const constMatch = simplifiedStr.match(/([+-]?\s*\d*\.?\d*)(?![a-zA-Z\^])/);
                
                if (x2Match) {
                    const coef = x2Match[1].trim();
                    if (coef === '' || coef === '+') a = 1;
                    else if (coef === '-') a = -1;
                    else a = parseFloat(coef);
                }
                
                if (xMatch) {
                    const coef = xMatch[1].trim();
                    if (coef === '' || coef === '+') b = 1;
                    else if (coef === '-') b = -1;
                    else b = parseFloat(coef);
                }
                
                if (constMatch) {
                    c = parseFloat(constMatch[1]);
                }
                
                steps.push({
                    description: `Let's identify the coefficients in our quadratic equation`,
                    expression: `a = ${a}, b = ${b}, c = ${c}`
                });
                
                // Use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
                steps.push({
                    description: `To solve a quadratic equation, I'll use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a`,
                    expression: `x = (${-b} ± √(${b}² - 4 × ${a} × ${c})) / (2 × ${a})`
                });
                
                // Calculate the discriminant
                const discriminant = b*b - 4*a*c;
                steps.push({
                    description: `First, I'll calculate the discriminant: b² - 4ac`,
                    expression: `Discriminant = ${b}² - 4 × ${a} × ${c} = ${discriminant}`
                });
                
                if (discriminant < 0) {
                    steps.push({
                        description: `Since the discriminant is negative (${discriminant}), this equation has no real solutions, only complex solutions.`,
                        expression: `No real solutions`
                    });
                    solution = "No real solutions";
                } else if (discriminant === 0) {
                    const x = -b / (2*a);
                    steps.push({
                        description: `Since the discriminant is zero, this equation has exactly one solution (a repeated root).`,
                        expression: `x = ${-b} / (2 × ${a}) = ${x}`
                    });
                    solution = `x = ${x}`;
                } else {
                    const sqrtDiscriminant = Math.sqrt(discriminant);
                    steps.push({
                        description: `The discriminant is positive, so we have two real solutions.`,
                        expression: `√${discriminant} = ${sqrtDiscriminant.toFixed(4)}`
                    });
                    
                    const x1 = (-b + sqrtDiscriminant) / (2*a);
                    const x2 = (-b - sqrtDiscriminant) / (2*a);
                    
                    steps.push({
                        description: `Let's calculate the first solution using the + sign in the formula`,
                        expression: `x₁ = (${-b} + ${sqrtDiscriminant.toFixed(4)}) / ${2*a} = ${x1.toFixed(4)}`
                    });
                    
                    steps.push({
                        description: `Now let's calculate the second solution using the - sign in the formula`,
                        expression: `x₂ = (${-b} - ${sqrtDiscriminant.toFixed(4)}) / ${2*a} = ${x2.toFixed(4)}`
                    });
                    
                    solution = `x = ${x1.toFixed(4)} or x = ${x2.toFixed(4)}`;
                }
            }
            // Handle cubic and higher degree equations
            else if (degree >= 3) {
                steps.push({
                    description: `This is a polynomial equation of degree ${degree}`,
                    expression: `${simplifiedStr} = 0`
                });
                
                // For cubic equations, we can try numerical methods
                steps.push({
                    description: `For higher degree polynomials, we'll use numerical methods to find the roots`,
                    expression: `Finding roots of: ${simplifiedStr}`
                });
                
                try {
                    // Try to find roots numerically
                    // This is a simplified approach for educational purposes
                    // In a real solver, we'd use more robust numerical methods
                    const roots = findRoots(simplifiedStr, 'x');
                    
                    if (roots.length > 0) {
                        steps.push({
                            description: `I found ${roots.length} solution(s) for this equation:`,
                            expression: roots.map(root => `x = ${root.toFixed(4)}`).join(', ')
                        });
                        
                        solution = roots.map(root => `x = ${root.toFixed(4)}`).join(' or ');
                    } else {
                        steps.push({
                            description: `I couldn't find any real solutions for this equation using numerical methods.`,
                            expression: `Try using specialized tools for higher-degree polynomials.`
                        });
                        
                        solution = "No real solutions found";
                    }
                } catch (e) {
                    steps.push({
                        description: `This equation is too complex for direct solving with our current methods.`,
                        expression: `For cubic equations, you might need to use the cubic formula or numerical methods.`
                    });
                    
                    solution = "Cannot solve directly";
                }
            } else {
                // For more complex equations, provide a general approach
                steps.push({
                    description: `This equation is more complex. I'll try to solve it using algebraic techniques.`,
                    expression: `${simplifiedStr} = 0`
                });
                
                try {
                    const solveResult = math.solve(simplified, 'x');
                    if (Array.isArray(solveResult)) {
                        steps.push({
                            description: `After applying algebraic techniques, I found multiple solutions:`,
                            expression: solveResult.map(sol => `x = ${sol}`).join(', ')
                        });
                        solution = solveResult.map(sol => `x = ${sol}`).join(' or ');
                    } else {
                        steps.push({
                            description: `After applying algebraic techniques, I found the solution:`,
                            expression: `x = ${solveResult}`
                        });
                        solution = `x = ${solveResult}`;
                    }
                } catch (e) {
                    steps.push({
                        description: `This equation is too complex for direct solving. You might need to use numerical methods or more advanced techniques.`,
                        expression: `Cannot solve directly`
                    });
                    solution = "Cannot solve directly";
                }
            }
        } else {
            // If it's not an equation, treat it as an expression to simplify
            return simplifyExpression(problem);
        }
    } catch (error) {
        console.error("Error in solveAlgebra:", error);
        return [`Error: ${error.message}`, [{
            description: `I encountered an error while solving this problem: ${error.message}`,
            expression: `Please check your input and try again.`
        }]];
    }
    
    return [solution, steps];
}

// Helper function to determine the degree of a polynomial
function getDegree(expression, variable) {
    let degree = 0;
    
    console.log("Checking degree for expression:", expression);
    
    // Check for variable with exponent using regex
    const exponentPattern = new RegExp(`${variable}\\s*\\^\\s*(\\d+)`, 'g');
    let match;
    
    while ((match = exponentPattern.exec(expression)) !== null) {
        const exponent = parseInt(match[1]);
        console.log("Found exponent:", exponent);
        degree = Math.max(degree, exponent);
    }
    
    // Also check for x*x*x pattern (which is x^3)
    if (expression.includes(`${variable}*${variable}*${variable}`)) {
        degree = Math.max(degree, 3);
    }
    
    // Check for x*x pattern (which is x^2)
    if (expression.includes(`${variable}*${variable}`)) {
        degree = Math.max(degree, 2);
    }
    
    // Check for variable without exponent (degree 1)
    if (expression.includes(variable) && degree === 0) {
        degree = 1;
    }
    
    console.log("Determined degree:", degree);
    return degree;
}

// Helper function to find roots of a polynomial numerically
function findRoots(expression, variable) {
    // This is a simplified approach for educational purposes
    // In a real solver, we'd use more robust numerical methods
    
    // Convert the expression to a function
    const expr = math.parse(expression);
    const func = expr.compile();
    
    // Try to find roots in a reasonable range
    const roots = [];
    const range = 10;
    const step = 0.1;
    
    for (let x = -range; x <= range; x += step) {
        const y1 = func.evaluate({ x: x });
        const y2 = func.evaluate({ x: x + step });
        
        // Check for sign change (indicates a root between x and x+step)
        if (y1 * y2 <= 0) {
            // Use bisection method to refine the root
            const root = bisectionMethod(func, x, x + step);
            
            // Add the root if it's not already in the list (within a tolerance)
            if (!roots.some(r => Math.abs(r - root) < 0.0001)) {
                roots.push(root);
            }
        }
    }
    
    return roots;
}

// Bisection method to find a root in an interval
function bisectionMethod(func, a, b, tolerance = 0.0001, maxIterations = 100) {
    let fa = func.evaluate({ x: a });
    let fb = func.evaluate({ x: b });
    
    // Check if the interval contains a root
    if (fa * fb > 0) {
        return (a + b) / 2; // Return midpoint as an approximation
    }
    
    let c, fc;
    let iteration = 0;
    
    while ((b - a) > tolerance && iteration < maxIterations) {
        // Calculate midpoint
        c = (a + b) / 2;
        fc = func.evaluate({ x: c });
        
        if (Math.abs(fc) < tolerance) {
            break; // Found a root
        }
        
        // Update interval
        if (fa * fc < 0) {
            b = c;
            fb = fc;
        } else {
            a = c;
            fa = fc;
        }
        
        iteration++;
    }
    
    return c; // Return the approximated root
}

// Function to simplify mathematical expressions
function simplifyExpression(expression) {
    let solution = '';
    let steps = [];
    
    try {
        steps.push({
            description: `Let's simplify the expression: ${expression}`,
            expression: expression
        });
        
        // Parse the expression
        const expr = math.parse(expression);
        
        // Check if it's a polynomial expression
        if (expression.includes('^') || expression.includes('*')) {
            // Try to expand first
            try {
                const expanded = math.expand(expr);
                if (expanded.toString() !== expression) {
                    steps.push({
                        description: `First, I'll expand the expression using the distributive property`,
                        expression: expanded.toString()
                    });
                    
                    // Then try to factor if possible
                    try {
                        const factored = math.simplify(expanded);
                        if (factored.toString() !== expanded.toString()) {
                            steps.push({
                                description: `Now I'll look for common factors and simplify`,
                                expression: factored.toString()
                            });
                            solution = factored.toString();
                        } else {
                            solution = expanded.toString();
                        }
                    } catch (e) {
                        solution = expanded.toString();
                    }
                } else {
                    // If expansion didn't change anything, just simplify
                    const simplified = math.simplify(expr);
                    steps.push({
                        description: `I'll simplify by combining like terms`,
                        expression: simplified.toString()
                    });
                    solution = simplified.toString();
                }
            } catch (e) {
                // If expand fails, just use the simplified form
                const simplified = math.simplify(expr);
                steps.push({
                    description: `I'll simplify this expression by combining like terms`,
                    expression: simplified.toString()
                });
                solution = simplified.toString();
            }
        } else {
            // For simpler expressions
            const simplified = math.simplify(expr);
            steps.push({
                description: `I'll simplify this expression by combining like terms`,
                expression: simplified.toString()
            });
            solution = simplified.toString();
        }
        
        // Add a final step if the solution is different from the original expression
        if (solution !== expression) {
            steps.push({
                description: `The simplified expression is:`,
                expression: solution
            });
        } else {
            steps.push({
                description: `This expression is already in its simplest form.`,
                expression: solution
            });
        }
    } catch (error) {
        console.error("Error in simplifyExpression:", error);
        return [`Error: ${error.message}`, [{
            description: `I encountered an error while simplifying this expression: ${error.message}`,
            expression: `Please check your input and try again.`
        }]];
    }
    
    return [solution, steps];
}

// Function to solve calculus problems (basic derivatives)
function solveCalculus(problem) {
    let solution = '';
    let steps = [];
    
    try {
        // Check if it's a derivative problem
        if (problem.toLowerCase().includes('derivative')) {
            // Extract the expression to differentiate
            let expression = problem.toLowerCase();
            
            if (expression.includes('derivative of ')) {
                expression = expression.replace('derivative of ', '').trim();
                steps.push({
                    description: `I need to find the derivative of the expression: ${expression}`,
                    expression: expression
                });
            } else if (expression.includes('derivative')) {
                expression = expression.replace('derivative', '').trim();
                steps.push({
                    description: `I need to find the derivative of the expression: ${expression}`,
                    expression: expression
                });
            }
            
            // Parse the expression
            const node = math.parse(expression);
            
            // Identify the type of expression to apply appropriate rules
            if (expression.includes('^')) {
                steps.push({
                    description: `I notice this expression involves powers. I'll use the Power Rule: d/dx(x^n) = n·x^(n-1)`,
                    expression: `Power Rule: d/dx(x^n) = n·x^(n-1)`
                });
            }
            
            if (expression.includes('+') || expression.includes('-')) {
                steps.push({
                    description: `This expression contains addition/subtraction. I'll use the Sum Rule: d/dx(f(x) ± g(x)) = d/dx(f(x)) ± d/dx(g(x))`,
                    expression: `Sum Rule: d/dx(f(x) ± g(x)) = d/dx(f(x)) ± d/dx(g(x))`
                });
            }
            
            if (expression.includes('*')) {
                steps.push({
                    description: `This expression contains multiplication. I'll use the Product Rule: d/dx(f(x)·g(x)) = f(x)·d/dx(g(x)) + g(x)·d/dx(f(x))`,
                    expression: `Product Rule: d/dx(f(x)·g(x)) = f(x)·d/dx(g(x)) + g(x)·d/dx(f(x))`
                });
            }
            
            // Calculate the derivative
            const derivative = math.derivative(node, 'x');
            
            steps.push({
                description: `Applying the derivative rules to our expression`,
                expression: `d/dx(${expression}) = ${derivative.toString()}`
            });
            
            // Try to simplify the derivative
            try {
                const simplified = math.simplify(derivative);
                if (simplified.toString() !== derivative.toString()) {
                    steps.push({
                        description: `Now I'll simplify the result`,
                        expression: simplified.toString()
                    });
                    solution = simplified.toString();
                } else {
                    solution = derivative.toString();
                }
            } catch (e) {
                solution = derivative.toString();
            }
            
            steps.push({
                description: `The final derivative is:`,
                expression: solution
            });
            
            // Add verification step
            steps.push({
                description: `To verify this is correct, you can check by differentiating each term individually and combining the results.`,
                expression: `d/dx(${expression}) = ${solution}`
            });
        } else {
            // If it's not a derivative problem, try to simplify it
            return simplifyExpression(problem);
        }
    } catch (error) {
        console.error("Error in solveCalculus:", error);
        return [`Error: ${error.message}`, [{
            description: `I encountered an error while solving this calculus problem: ${error.message}`,
            expression: `Please check your input and try again.`
        }]];
    }
    
    return [solution, steps];
}

// Solve matrix problems
function solveMatrix(problem) {
    let solution = '';
    let steps = [];
    
    try {
        // This is a placeholder for matrix operations
        // In a real implementation, we would parse matrix notation and perform operations
        
        solution = 'Matrix operations are not fully implemented yet';
        steps.push({
            description: 'Matrix operations',
            expression: 'Coming soon'
        });
    } catch (error) {
        console.error('Error solving matrix problem:', error);
        solution = 'Error: Could not solve this matrix problem';
        steps = [];
    }
    
    return [solution, steps];
}

// Display solution and steps
function displaySolution(problem, solution, steps) {
    // Display the final solution
    solutionOutput.innerHTML = `
        <div class="problem">
            <strong>Problem:</strong> ${problem}
        </div>
        <div class="answer">
            <strong>Answer:</strong> ${solution}
        </div>
    `;
    
    // Display steps
    solutionSteps.innerHTML = '<h3 style="color: var(--secondary-color); margin-bottom: 1rem;">Step-by-Step Solution:</h3>';
    
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        stepElement.innerHTML = `
            <div class="step-number">Step ${index + 1}</div>
            <div class="step-description">${step.description}</div>
            <div class="step-expression">${step.expression}</div>
        `;
        solutionSteps.appendChild(stepElement);
    });
    
    // Add a container for additional explanations
    const explanationElement = document.createElement('div');
    explanationElement.className = 'explanation';
    explanationElement.innerHTML = `
        <h3 style="color: var(--secondary-color); margin: 1.5rem 0 1rem;">Understanding the Solution:</h3>
        <p>The solution above shows how to solve the problem step-by-step using mathematical principles.</p>
        <p>Each step builds on the previous one, applying the appropriate rules and techniques.</p>
        <p>If you need more help understanding any specific step, try clicking on it for a more detailed explanation.</p>
    `;
    solutionSteps.appendChild(explanationElement);
    
    // Make the solution container visible
    document.getElementById('solution-output').parentElement.classList.add('show');
}

// Add problem to history
function addToHistory(type, problem, solution) {
    const historyItem = {
        id: Date.now(),
        type,
        problem,
        solution,
        timestamp: new Date().toISOString()
    };
    
    // Add to beginning of array
    problemHistory.unshift(historyItem);
    
    // Keep only the most recent 10 items
    if (problemHistory.length > 10) {
        problemHistory = problemHistory.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('mathProblemHistory', JSON.stringify(problemHistory));
    
    // Update UI
    renderHistory();
    
    // Save to Firebase if user is logged in
    saveToFirebase(historyItem);
}

// Load history from localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('mathProblemHistory');
    if (savedHistory) {
        problemHistory = JSON.parse(savedHistory);
        renderHistory();
    }
}

// Render history items in UI
function renderHistory() {
    historyList.innerHTML = '';
    
    if (problemHistory.length === 0) {
        historyList.innerHTML = '<p>No recent problems</p>';
        return;
    }
    
    // Add Clear All button at the top
    const clearAllBtn = document.createElement('div');
    clearAllBtn.className = 'clear-all-btn';
    clearAllBtn.innerHTML = '<i class="fas fa-trash"></i> Clear All History';
    clearAllBtn.addEventListener('click', clearAllHistory);
    historyList.appendChild(clearAllBtn);
    
    problemHistory.forEach(item => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.dataset.problem = item.problem;
        historyElement.dataset.type = item.type;
        historyElement.dataset.id = item.id;
        
        // Format the timestamp
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        historyElement.innerHTML = `
            <div class="history-content">
                <div class="history-problem">${item.problem}</div>
                <div class="history-solution">${item.solution}</div>
                <div class="history-timestamp">${formattedDate}</div>
            </div>
            <div class="history-actions">
                <button class="delete-history-btn" title="Remove from history"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Add click handler to reload this problem
        historyElement.querySelector('.history-content').addEventListener('click', () => {
            problemTypeSelect.value = item.type;
            problemInput.value = item.problem;
            solveProblem();
        });
        
        // Add delete button handler
        historyElement.querySelector('.delete-history-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent click
            deleteHistoryItem(item.id);
        });
        
        historyList.appendChild(historyElement);
    });
}

// Function to delete a single history item
function deleteHistoryItem(id) {
    // Filter out the item with the given id
    problemHistory = problemHistory.filter(item => item.id !== id);
    
    // Save to localStorage
    localStorage.setItem('mathProblemHistory', JSON.stringify(problemHistory));
    
    // Update UI
    renderHistory();
}

// Function to clear all history
function clearAllHistory() {
    // Confirm with the user
    if (confirm('Are you sure you want to clear all history?')) {
        // Clear the history array
        problemHistory = [];
        
        // Clear from localStorage
        localStorage.removeItem('mathProblemHistory');
        
        // Update UI
        renderHistory();
    }
}

// Save problem to Firebase
function saveToFirebase(historyItem) {
    // Generate a unique key for this problem
    const problemKey = database.ref().child('mathProblems').push().key;
    
    // Create the data to save
    const problemData = {
        ...historyItem,
        userId: 'anonymous', // In a real app, we'd use the user's ID if logged in
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Write the data to Firebase
    database.ref('mathProblems/' + problemKey).set(problemData)
        .catch(error => {
            console.error('Error saving to Firebase:', error);
        });
}

// Show error message
function showError(message) {
    solutionOutput.innerHTML = `<p class="error-message"><i class="fas fa-exclamation-circle"></i> ${message}</p>`;
    solutionSteps.innerHTML = '';
}

// Render math expressions using KaTeX
function renderMathExpressions() {
    renderMathInElement(document.body, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

// Scroll to top button functionality
const scrollToTopBtn = document.querySelector('.scroll-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});
