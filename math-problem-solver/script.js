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
            case 'system':
                [solution, steps] = solveSystem(problem);
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
                
                if (degree === 3) {
                    steps.push({
                        description: `For a cubic equation, I'll try to factor it first, then use numerical methods if needed`,
                        expression: `${simplifiedStr} = 0`
                    });
                    
                    // Try to factor the cubic expression
                    try {
                        const factored = math.simplify(simplifiedStr);
                        if (factored.toString() !== simplifiedStr) {
                            steps.push({
                                description: `I can factor this cubic expression as:`,
                                expression: `${factored.toString()} = 0`
                            });
                            
                            // Check if it's in a form like (x-a)(x-b)(x-c) = 0
                            if (factored.toString().includes('*') && 
                                (factored.toString().includes('(') || factored.toString().includes(')'))) {
                                steps.push({
                                    description: `When a product equals zero, at least one of the factors must be zero`,
                                    expression: `Let's solve each factor = 0`
                                });
                                
                                // Try to extract roots from the factored form
                                const factorRoots = [];
                                
                                // Simple pattern matching for factors like (x-a)
                                const factorPattern = /\(x\s*([+-])\s*(\d*\.?\d*)\)/g;
                                let factorMatch;
                                
                                while ((factorMatch = factorPattern.exec(factored.toString())) !== null) {
                                    const sign = factorMatch[1];
                                    const value = parseFloat(factorMatch[2] || 1);
                                    const root = sign === '+' ? value : -value;
                                    factorRoots.push(root);
                                    
                                    steps.push({
                                        description: `From the factor (x ${sign} ${value}), we get:`,
                                        expression: `x = ${root}`
                                    });
                                }
                                
                                if (factorRoots.length > 0) {
                                    solution = factorRoots.map(root => `x = ${root}`).join(' or ');
                                    return [solution, steps];
                                }
                            }
                        }
                    } catch (e) {
                        console.log("Error factoring cubic:", e);
                    }
                }
                
                // If factoring didn't work or it's higher than cubic, use numerical methods
                steps.push({
                    description: `For higher degree polynomials, I'll use numerical methods to find the roots`,
                    expression: `Finding roots of: ${simplifiedStr}`
                });
                
                try {
                    // Try to find roots numerically with our enhanced method
                    const roots = findRoots(simplifiedStr, 'x');
                    
                    if (roots.length > 0) {
                        // Add explanation of the numerical method
                        steps.push({
                            description: `I'm using a numerical method called the bisection method to find where the function crosses the x-axis`,
                            expression: `This method works by repeatedly dividing intervals where the function changes sign`
                        });
                        
                        // Verify the roots by substituting back
                        steps.push({
                            description: `Let's verify these solutions by substituting them back into the original equation`,
                            expression: `${simplifiedStr} = 0`
                        });
                        
                        const expr = math.parse(simplifiedStr).compile();
                        const verifiedRoots = [];
                        
                        roots.forEach((root, index) => {
                            const roundedRoot = parseFloat(root.toFixed(4));
                            const result = expr.evaluate({ x: roundedRoot });
                            const isRoot = Math.abs(result) < 0.001;
                            
                            if (isRoot) {
                                verifiedRoots.push(roundedRoot);
                                steps.push({
                                    description: `Solution ${index + 1}: x = ${roundedRoot}`,
                                    expression: `When x = ${roundedRoot}, the expression ≈ ${result.toFixed(8)} ≈ 0 ✓`
                                });
                            }
                        });
                        
                        if (verifiedRoots.length > 0) {
                            solution = verifiedRoots.map(root => `x = ${root}`).join(' or ');
                        } else {
                            steps.push({
                                description: `The numerical solutions weren't accurate enough. Let's try a different approach.`,
                                expression: `For complex polynomials, specialized tools may be needed.`
                            });
                            solution = "No accurate solutions found";
                        }
                    } else {
                        steps.push({
                            description: `I couldn't find any real solutions for this equation using numerical methods.`,
                            expression: `The equation might have only complex solutions or require more advanced techniques.`
                        });
                        
                        solution = "No real solutions found";
                    }
                } catch (e) {
                    console.error("Error in numerical solving:", e);
                    steps.push({
                        description: `This equation is too complex for our current numerical methods.`,
                        expression: `For higher-degree polynomials, specialized mathematical software may be needed.`
                    });
                    
                    solution = "Cannot solve directly";
                }
            }
            // For more complex equations, provide a general approach
            else {
                // For simpler expressions
                const simplified = math.simplify(expr);
                steps.push({
                    description: `I'll simplify this expression by combining like terms`,
                    expression: simplified.toString()
                });
                solution = simplified.toString();
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
    
    // First try to parse the expression with math.js
    try {
        const node = math.parse(expression);
        
        // Recursive function to traverse the expression tree
        function findHighestDegree(node) {
            if (node.isSymbolNode && node.name === variable) {
                return 1; // Found the variable with degree 1
            } 
            else if (node.isOperatorNode) {
                if (node.op === '^' && node.args[0].isSymbolNode && node.args[0].name === variable) {
                    // Found variable raised to a power
                    if (node.args[1].isConstantNode) {
                        return node.args[1].value;
                    }
                }
                // For other operators, check their arguments
                return Math.max(...node.args.map(findHighestDegree));
            }
            else if (node.isParenthesisNode) {
                return findHighestDegree(node.content);
            }
            else if (node.isFunctionNode) {
                return Math.max(...node.args.map(findHighestDegree));
            }
            else if (node.isArrayNode) {
                return Math.max(...node.items.map(findHighestDegree));
            }
            return 0; // Default for constant nodes, etc.
        }
        
        degree = findHighestDegree(node);
    } catch (e) {
        console.log("Error in tree-based degree detection:", e);
        
        // Fallback to regex-based detection if tree traversal fails
        // Check for variable with exponent using regex
        const exponentPattern = new RegExp(`${variable}\\s*\\^\\s*(\\d+)`, 'g');
        let match;
        
        while ((match = exponentPattern.exec(expression)) !== null) {
            const exponent = parseInt(match[1]);
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
    }
    
    console.log("Determined degree:", degree);
    return degree;
}

// Helper function to find roots of a polynomial numerically
function findRoots(expression, variable) {
    // This is a more robust approach for educational purposes
    
    // Convert the expression to a function
    const expr = math.parse(expression);
    const func = expr.compile();
    
    // Try to find roots in a reasonable range
    const roots = [];
    const range = 20; // Increased range
    const step = 0.05; // Smaller step for better precision
    
    // First pass: scan for sign changes to locate potential roots
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
    
    // Second pass: try to find roots near critical points (where derivative is zero)
    try {
        // Get derivative of the expression
        const derivative = math.derivative(expr, variable).compile();
        
        // Look for critical points
        for (let x = -range; x <= range; x += step) {
            const dy1 = derivative.evaluate({ x: x });
            const dy2 = derivative.evaluate({ x: x + step });
            
            // Check for sign change in derivative (indicates a critical point)
            if (dy1 * dy2 <= 0) {
                // Use bisection to find the critical point
                const criticalPoint = bisectionMethod(derivative, x, x + step);
                
                // Check if there's a root near the critical point
                const y1 = func.evaluate({ x: criticalPoint - step });
                const y2 = func.evaluate({ x: criticalPoint + step });
                
                if (y1 * y2 <= 0) {
                    const root = bisectionMethod(func, criticalPoint - step, criticalPoint + step);
                    if (!roots.some(r => Math.abs(r - root) < 0.0001)) {
                        roots.push(root);
                    }
                }
            }
        }
    } catch (e) {
        console.log("Error finding critical points:", e);
    }
    
    // Sort roots for cleaner output
    return roots.sort((a, b) => a - b);
}

// Bisection method to find a root in an interval
function bisectionMethod(func, a, b, tolerance = 0.0001, maxIterations = 100) {
    // Handle the case where one endpoint is very close to zero
    const fa = typeof func.evaluate === 'function' ? func.evaluate({ x: a }) : func({ x: a });
    const fb = typeof func.evaluate === 'function' ? func.evaluate({ x: b }) : func({ x: b });
    
    if (Math.abs(fa) < tolerance) return a;
    if (Math.abs(fb) < tolerance) return b;
    
    // Check if the interval contains a root
    if (fa * fb > 0) {
        return (a + b) / 2; // Return midpoint as an approximation
    }
    
    let c, fc;
    let iteration = 0;
    
    while ((b - a) > tolerance && iteration < maxIterations) {
        // Calculate midpoint
        c = (a + b) / 2;
        fc = typeof func.evaluate === 'function' ? func.evaluate({ x: c }) : func({ x: c });
        
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

// Function to solve systems of linear equations
function solveSystem(problem) {
    let solution = '';
    let steps = [];
    
    try {
        steps.push({
            description: `Let's solve this system of equations:`,
            expression: problem
        });
        
        // Split the system into individual equations
        const equations = problem.split(/\n|;/).map(eq => eq.trim()).filter(eq => eq);
        
        if (equations.length < 2) {
            return [`Error: Not enough equations for a system`, [{
                description: `A system of equations needs at least two equations.`,
                expression: `Please provide multiple equations separated by line breaks or semicolons.`
            }]];
        }
        
        steps.push({
            description: `I've identified ${equations.length} equations in this system:`,
            expression: equations.join('\n')
        });
        
        // Parse the equations and extract variables
        const parsedEquations = [];
        const allVariables = new Set();
        
        for (let i = 0; i < equations.length; i++) {
            const eq = equations[i];
            
            // Check if it's an equation (contains =)
            if (!eq.includes('=')) {
                return [`Error: Invalid equation format`, [{
                    description: `Each equation must contain an equals sign (=).`,
                    expression: `Please check equation: ${eq}`
                }]];
            }
            
            // Split into left and right sides
            const [leftSide, rightSide] = eq.split('=').map(side => side.trim());
            
            // Move everything to left side
            const fullEquation = `(${leftSide})-(${rightSide})`;
            const simplified = math.simplify(fullEquation).toString();
            
            // Extract variables using regex
            const variableRegex = /([a-zA-Z])\b/g;
            let match;
            while ((match = variableRegex.exec(simplified)) !== null) {
                allVariables.add(match[1]);
            }
            
            parsedEquations.push(simplified);
        }
        
        // Convert variables set to array and sort
        const variables = Array.from(allVariables).sort();
        
        steps.push({
            description: `I've identified the following variables in the system:`,
            expression: variables.join(', ')
        });
        
        // Check if we have the right number of equations
        if (equations.length < variables.length) {
            steps.push({
                description: `This system has ${variables.length} variables but only ${equations.length} equations.`,
                expression: `Such systems typically have infinitely many solutions.`
            });
        }
        
        // For 2x2 systems, solve using substitution method
        if (variables.length === 2 && equations.length >= 2) {
            const [x, y] = variables; // Assuming variables are sorted alphabetically
            
            steps.push({
                description: `Since this is a system with two variables (${x} and ${y}), I'll solve it using the substitution method.`,
                expression: `First, I'll solve for one variable in terms of the other.`
            });
            
            // Try to extract coefficients from the first equation
            let eq1 = parsedEquations[0];
            let eq2 = parsedEquations[1];
            
            // Extract coefficients using regex
            const extractCoefficients = (equation, variable) => {
                const regex = new RegExp(`([+-]?\\s*\\d*\\.?\\d*)\\s*\\*?\\s*${variable}\\b`, 'g');
                let match = regex.exec(equation);
                if (match) {
                    const coef = match[1].trim();
                    if (coef === '' || coef === '+') return 1;
                    if (coef === '-') return -1;
                    return parseFloat(coef);
                }
                return 0;
            };
            
            const extractConstant = (equation) => {
                // Look for constant term (not followed by a variable)
                const regex = /([+-]?\s*\d*\.?\d+)(?![a-zA-Z])/g;
                let constant = 0;
                let match;
                while ((match = regex.exec(equation)) !== null) {
                    constant += parseFloat(match[1]);
                }
                return constant;
            };
            
            // Extract coefficients from first equation
            const a1 = extractCoefficients(eq1, x);
            const b1 = extractCoefficients(eq1, y);
            const c1 = -extractConstant(eq1); // Negate because we moved everything to left side
            
            // Extract coefficients from second equation
            const a2 = extractCoefficients(eq2, x);
            const b2 = extractCoefficients(eq2, y);
            const c2 = -extractConstant(eq2); // Negate because we moved everything to left side
            
            steps.push({
                description: `I'll rewrite the equations in standard form:`,
                expression: `${a1}${x} + ${b1}${y} = ${c1}\n${a2}${x} + ${b2}${y} = ${c2}`
            });
            
            // Solve for x in terms of y from the first equation
            if (a1 !== 0) {
                const xCoef = 1 / a1;
                const yCoef = -b1 / a1;
                const constTerm = c1 / a1;
                
                steps.push({
                    description: `From the first equation, I'll solve for ${x} in terms of ${y}:`,
                    expression: `${x} = ${constTerm} + ${yCoef}${y}`
                });
                
                // Substitute into the second equation
                const newCoef = a2 * yCoef + b2;
                const newConst = a2 * constTerm - c2;
                
                steps.push({
                    description: `Now I'll substitute this expression for ${x} into the second equation:`,
                    expression: `${a2}(${constTerm} + ${yCoef}${y}) + ${b2}${y} = ${c2}`
                });
                
                steps.push({
                    description: `Simplifying:`,
                    expression: `${newCoef}${y} = ${-newConst}`
                });
                
                // Solve for y
                if (newCoef !== 0) {
                    const yValue = -newConst / newCoef;
                    
                    steps.push({
                        description: `Solving for ${y}:`,
                        expression: `${y} = ${yValue}`
                    });
                    
                    // Back-substitute to find x
                    const xValue = constTerm + yCoef * yValue;
                    
                    steps.push({
                        description: `Now I'll substitute ${y} = ${yValue} back to find ${x}:`,
                        expression: `${x} = ${constTerm} + ${yCoef} × ${yValue} = ${xValue}`
                    });
                    
                    solution = `${x} = ${xValue}, ${y} = ${yValue}`;
                    
                    // Verify the solution
                    steps.push({
                        description: `Let's verify this solution by substituting back into the original equations:`,
                        expression: `Checking ${x} = ${xValue}, ${y} = ${yValue}`
                    });
                    
                    // Create a function to evaluate an equation with the solution
                    const evaluateEquation = (equation, xVal, yVal) => {
                        const vars = {};
                        vars[x] = xVal;
                        vars[y] = yVal;
                        return math.evaluate(equation, vars);
                    };
                    
                    for (let i = 0; i < equations.length; i++) {
                        const [left, right] = equations[i].split('=').map(side => side.trim());
                        const leftVal = evaluateEquation(left, xValue, yValue);
                        const rightVal = evaluateEquation(right, xValue, yValue);
                        const isValid = Math.abs(leftVal - rightVal) < 0.0001;
                        
                        steps.push({
                            description: `Equation ${i+1}: ${equations[i]}`,
                            expression: `Left side = ${leftVal}, Right side = ${rightVal}, ${isValid ? '✓' : '✗'}`
                        });
                    }
                } else {
                    if (newConst === 0) {
                        steps.push({
                            description: `The system has infinitely many solutions.`,
                            expression: `${x} = ${constTerm} + ${yCoef}${y}, where ${y} can be any value`
                        });
                        solution = `Infinitely many solutions: ${x} = ${constTerm} + ${yCoef}${y}`;
                    } else {
                        steps.push({
                            description: `The system has no solutions (the equations are inconsistent).`,
                            expression: `We get the contradiction: 0 = ${-newConst}`
                        });
                        solution = "No solution";
                    }
                }
            } else if (b1 !== 0) {
                // If a1 = 0, solve for y in terms of x
                const yValue = c1 / b1;
                
                steps.push({
                    description: `From the first equation, ${y} = ${yValue}`,
                    expression: `${y} = ${yValue}`
                });
                
                // Substitute into the second equation
                const newCoef = a2;
                const newConst = c2 - b2 * yValue;
                
                steps.push({
                    description: `Substituting ${y} = ${yValue} into the second equation:`,
                    expression: `${a2}${x} + ${b2} × ${yValue} = ${c2}`
                });
                
                // Solve for x
                if (newCoef !== 0) {
                    const xValue = newConst / newCoef;
                    
                    steps.push({
                        description: `Solving for ${x}:`,
                        expression: `${x} = ${xValue}`
                    });
                    
                    solution = `${x} = ${xValue}, ${y} = ${yValue}`;
                } else {
                    if (newConst === 0) {
                        steps.push({
                            description: `The system has infinitely many solutions.`,
                            expression: `${y} = ${yValue}, ${x} can be any value`
                        });
                        solution = `Infinitely many solutions: ${y} = ${yValue}`;
                    } else {
                        steps.push({
                            description: `The system has no solutions (the equations are inconsistent).`,
                            expression: `We get the contradiction: 0 = ${newConst}`
                        });
                        solution = "No solution";
                    }
                }
            } else {
                // If both a1 and b1 are 0, the first equation is either a tautology or a contradiction
                if (c1 === 0) {
                    steps.push({
                        description: `The first equation is a tautology (always true).`,
                        expression: `Let's examine the second equation.`
                    });
                    
                    // Check if the second equation gives us a unique solution
                    if (a2 !== 0 || b2 !== 0) {
                        steps.push({
                            description: `The system has infinitely many solutions that satisfy the second equation.`,
                            expression: `${a2}${x} + ${b2}${y} = ${c2}`
                        });
                        solution = `Infinitely many solutions that satisfy: ${a2}${x} + ${b2}${y} = ${c2}`;
                    } else {
                        if (c2 === 0) {
                            steps.push({
                                description: `Both equations are tautologies.`,
                                expression: `The system has infinitely many solutions.`
                            });
                            solution = "Infinitely many solutions";
                        } else {
                            steps.push({
                                description: `The second equation is a contradiction.`,
                                expression: `The system has no solutions.`
                            });
                            solution = "No solution";
                        }
                    }
                } else {
                    steps.push({
                        description: `The first equation is a contradiction (never true).`,
                        expression: `The system has no solutions.`
                    });
                    solution = "No solution";
                }
            }
        } 
        // For 3x3 systems, we could implement Gaussian elimination
        else if (variables.length === 3 && equations.length >= 3) {
            steps.push({
                description: `This is a system with three variables. For systems with 3 or more variables, I'll use a numerical solver.`,
                expression: `Solving the system numerically...`
            });
            
            // For now, we'll just indicate that this is not fully implemented
            // In a real implementation, we would use a matrix-based approach
            steps.push({
                description: `For 3x3 systems, we would typically use Gaussian elimination or Cramer's rule.`,
                expression: `This feature is under development.`
            });
            
            solution = "Feature under development for 3x3 systems";
        }
        // For other systems, provide a general approach
        else {
            steps.push({
                description: `For systems with ${variables.length} variables and ${equations.length} equations, we would use matrix methods.`,
                expression: `This feature is under development.`
            });
            
            solution = "Feature under development for larger systems";
        }
    } catch (error) {
        console.error("Error in solveSystem:", error);
        return [`Error: ${error.message}`, [{
            description: `I encountered an error while solving this system: ${error.message}`,
            expression: `Please check your input and try again.`
        }]];
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
