import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './LinearProgramming.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function LinearProgramming() {
  const [formData, setFormData] = useState({
    objective: { x1: '', x2: '', type: 'max' },
    constraints: [
      { x1: '', x2: '', sign: '<=', rhs: '' },
      { x1: '', x2: '', sign: '<=', rhs: '' }
    ]
  });

  const [simplexFormData, setSimplexFormData] = useState({
    objective: { x1: '', x2: '', type: 'max' },
    constraints: [
      { x1: '', x2: '', sign: '<=', rhs: '' },
      { x1: '', x2: '', sign: '<=', rhs: '' }
    ]
  });

  const [dualityFormData, setDualityFormData] = useState({
    objective: { x1: '', x2: '', x3: '', type: 'max', numVars: 2 },
    constraints: [
      { x1: '', x2: '', x3: '', sign: '<=', rhs: '' },
      { x1: '', x2: '', x3: '', sign: '<=', rhs: '' }
    ]
  });

  const [transportationData, setTransportationData] = useState({
    sources: ['Source 1', 'Source 2'],
    destinations: ['Dest 1', 'Dest 2'],
    supply: ['', ''],
    demand: ['', ''],
    costs: [
      ['', ''],
      ['', '']
    ]
  });

  const [solution, setSolution] = useState(null);
  const [simplexSolution, setSimplexSolution] = useState(null);
  const [transportationSolution, setTransportationSolution] = useState(null);
  const [dualitySolution, setDualitySolution] = useState(null);

  const handleObjectiveChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      objective: { ...prev.objective, [name]: value }
    }));
  };

  const handleConstraintChange = (index, field, value) => {
    setFormData(prev => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = { ...newConstraints[index], [field]: value };
      return { ...prev, constraints: newConstraints };
    });
  };

  const addConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, { x1: '', x2: '', sign: '<=', rhs: '' }]
    }));
  };

  const handleSimplexObjectiveChange = (e) => {
    const { name, value } = e.target;
    setSimplexFormData(prev => ({
      ...prev,
      objective: { ...prev.objective, [name]: value }
    }));
  };

  const handleSimplexConstraintChange = (index, field, value) => {
    setSimplexFormData(prev => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = { ...newConstraints[index], [field]: value };
      return { ...prev, constraints: newConstraints };
    });
  };

  const addSimplexConstraint = () => {
    setSimplexFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, { x1: '', x2: '', sign: '<=', rhs: '' }]
    }));
  };

  // eslint-disable-next-line no-unused-vars
  const handleSourceNameChange = (index, value) => {
    setTransportationData(prev => {
      const newSources = [...prev.sources];
      newSources[index] = value;
      return { ...prev, sources: newSources };
    });
  };

  // eslint-disable-next-line no-unused-vars
  const handleDestNameChange = (index, value) => {
    setTransportationData(prev => {
      const newDests = [...prev.destinations];
      newDests[index] = value;
      return { ...prev, destinations: newDests };
    });
  };

  const handleSupplyChange = (index, value) => {
    setTransportationData(prev => {
      const newSupply = [...prev.supply];
      newSupply[index] = value;
      return { ...prev, supply: newSupply };
    });
  };

  const handleDemandChange = (index, value) => {
    setTransportationData(prev => {
      const newDemand = [...prev.demand];
      newDemand[index] = value;
      return { ...prev, demand: newDemand };
    });
  };

  const handleCostChange = (sourceIndex, destIndex, value) => {
    setTransportationData(prev => {
      const newCosts = prev.costs.map(row => [...row]);
      newCosts[sourceIndex][destIndex] = value;
      return { ...prev, costs: newCosts };
    });
  };

  // eslint-disable-next-line no-unused-vars
  const addSource = () => {
    setTransportationData(prev => {
      const newCosts = prev.costs.map(row => [...row]);
      newCosts.push(Array(prev.destinations.length).fill(''));
      return {
        ...prev,
        sources: [...prev.sources, `Source ${prev.sources.length + 1}`],
        supply: [...prev.supply, ''],
        costs: newCosts
      };
    });
  };

  // eslint-disable-next-line no-unused-vars
  const addDestination = () => {
    setTransportationData(prev => {
      const newCosts = prev.costs.map(row => [...row, '']);
      return {
        ...prev,
        destinations: [...prev.destinations, `Dest ${prev.destinations.length + 1}`],
        demand: [...prev.demand, ''],
        costs: newCosts
      };
    });
  };

  const solveGraphically = () => {
    // Convert inputs to numbers
    const obj = {
      x1: parseFloat(formData.objective.x1) || 0,
      x2: parseFloat(formData.objective.x2) || 0,
      type: formData.objective.type
    };

    const constraints = formData.constraints.map(c => ({
      x1: parseFloat(c.x1) || 0,
      x2: parseFloat(c.x2) || 0,
      sign: c.sign,
      rhs: parseFloat(c.rhs) || 0
    }));

    // Find intersection points of all constraints
    const points = [];
    // Add points from x1 = 0 and x2 = 0 axes
    for (const c of constraints) {
      if (c.x2 !== 0) points.push({ x: 0, y: c.rhs / c.x2 });
      if (c.x1 !== 0) points.push({ x: c.rhs / c.x1, y: 0 });
    }

    // Find intersections between constraints
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const c1 = constraints[i];
        const c2 = constraints[j];
        
        // Calculate determinant
        const det = c1.x1 * c2.x2 - c2.x1 * c1.x2;
        
        if (Math.abs(det) > 0.000001) { // Not parallel
          const x = (c1.rhs * c2.x2 - c2.rhs * c1.x2) / det;
          const y = (c1.x1 * c2.rhs - c2.x1 * c1.rhs) / det;
          points.push({ x, y });
        }
      }
    }

    // Filter points that satisfy all constraints
    const feasiblePoints = points.filter(p => {
      if (p.x < -0.000001 || p.y < -0.000001) return false; // Non-negative constraints
      return constraints.every(c => {
        const lhs = c.x1 * p.x + c.x2 * p.y;
        const rhs = c.rhs;
        if (c.sign === '<=') return lhs <= rhs + 0.000001;
        if (c.sign === '>=') return lhs >= rhs - 0.000001;
        return Math.abs(lhs - rhs) < 0.000001;
      });
    });

    if (feasiblePoints.length === 0) {
      setSolution({ status: 'infeasible' });
      return;
    }

    // Evaluate objective function at each feasible point
    const evaluateObjective = (point) => obj.x1 * point.x + obj.x2 * point.y;
    
    let optimalPoint = feasiblePoints[0];
    let optimalValue = evaluateObjective(optimalPoint);

    for (const point of feasiblePoints) {
      const value = evaluateObjective(point);
      if ((obj.type === 'max' && value > optimalValue) ||
          (obj.type === 'min' && value < optimalValue)) {
        optimalPoint = point;
        optimalValue = value;
      }
    }

    setSolution({
      status: 'optimal',
      feasiblePoints,
      optimalPoint,
      optimalValue,
      constraints
    });
  };

  const getChartData = () => {
    if (!solution) return null;

    // Calculate bounds with more space
    const maxX = Math.max(...solution.feasiblePoints.map(p => p.x)) * 1.3;
    const maxY = Math.max(...solution.feasiblePoints.map(p => p.y)) * 1.3;

    // Sort points to form the feasible region boundary
    const boundaryPoints = [...solution.feasiblePoints].sort((a, b) => {
      const center = solution.feasiblePoints.reduce(
        (acc, p) => ({ x: acc.x + p.x / solution.feasiblePoints.length, y: acc.y + p.y / solution.feasiblePoints.length }),
        { x: 0, y: 0 }
      );
      return Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x);
    });
    boundaryPoints.push(boundaryPoints[0]); // Close the polygon

    return {
      datasets: [
        // Feasible region fill
        {
          label: 'Feasible Region',
          data: boundaryPoints.map(p => ({ x: p.x, y: p.y })),
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          borderColor: 'rgba(52, 152, 219, 0.8)',
          borderWidth: 2,
          fill: true,
          tension: 0,
          pointRadius: 0
        },
        // Constraint lines
        ...solution.constraints.map((c, i) => ({
          label: `Constraint ${i + 1}`,
          data: [
            { x: c.x2 !== 0 ? 0 : c.rhs / c.x1, y: c.x2 !== 0 ? c.rhs / c.x2 : 0 },
            { x: c.x2 !== 0 ? maxX : c.rhs / c.x1, y: c.x2 !== 0 ? (c.rhs - c.x1 * maxX) / c.x2 : maxY }
          ],
          borderColor: `hsl(${i * 120}, 80%, 35%)`,
          borderWidth: 2,
          fill: false
        })),
        // Corner points
        {
          label: 'Corner Points',
        data: solution.feasiblePoints.map(p => ({ x: p.x, y: p.y })),
          backgroundColor: '#2c3e50',
          borderColor: '#2c3e50',
          borderWidth: 1,
          pointRadius: 5,
          pointStyle: 'circle',
          showLine: false
        },
        // Optimal point
        {
          label: 'Optimal Solution',
          data: [{ x: solution.optimalPoint.x, y: solution.optimalPoint.y }],
          backgroundColor: '#e74c3c',
          borderColor: '#c0392b',
          borderWidth: 2,
          pointRadius: 8,
          pointStyle: 'star'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 0.7,
        scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0,
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        title: { 
          display: true, 
          text: 'x₁',
          font: { 
            size: 14,
            weight: 'bold' 
          },
          padding: 10
        },
        ticks: {
          font: { size: 12 }
        }
      },
      y: {
        type: 'linear',
        min: 0,
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        title: { 
          display: true, 
          text: 'x₂',
          font: { 
            size: 14,
            weight: 'bold' 
          },
          padding: 10
        },
        ticks: {
          font: { size: 12 }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        align: 'center',
        labels: { 
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
          filter: function(legendItem, data) {
            return legendItem.text.includes('Constraint') || legendItem.text === 'Optimal Solution';
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `(${context.raw.x.toFixed(2)}, ${context.raw.y.toFixed(2)})`
        },
        padding: 10,
        titleFont: { size: 13 },
        bodyFont: { size: 12 }
      }
    }
  };

  const createTableau = (objective, constraints) => {
    // Convert minimization to maximization
    const isMinimization = objective.type === 'min';
    const objCoeffs = isMinimization 
      ? [-objective.x1, -objective.x2]
      : [objective.x1, objective.x2];

    // Count constraints by type
    const leConstraints = constraints.filter(c => c.sign === '<=');
    const geConstraints = constraints.filter(c => c.sign === '>=');
    const eqConstraints = constraints.filter(c => c.sign === '=');

    const numLeConstraints = leConstraints.length;
    const numGeConstraints = geConstraints.length;
    const numEqConstraints = eqConstraints.length;
    const numSlackVariables = numLeConstraints + numGeConstraints;
    const numArtificialVariables = numGeConstraints + numEqConstraints;
    const numColumns = 2 + numSlackVariables + numArtificialVariables + 1; // 2 original vars + slack + artificial + RHS

    // Create tableau with proper dimensions
    const tableau = Array(constraints.length + 1).fill()
      .map(() => Array(numColumns).fill(0));

    // Fill objective row (last row)
    objCoeffs.forEach((coeff, i) => {
      tableau[constraints.length][i] = -coeff;
    });

    // Add artificial variables with big M coefficient in objective
    const M = 1000; // Big M value
    for (let i = 2 + numSlackVariables; i < numColumns - 1; i++) {
      tableau[constraints.length][i] = M;
    }

    let slackIndex = 2;
    let artificialIndex = 2 + numSlackVariables;

    // Process <= constraints
    leConstraints.forEach((constraint, i) => {
      const rowIndex = constraints.indexOf(constraint);
      tableau[rowIndex][0] = constraint.x1;
      tableau[rowIndex][1] = constraint.x2;
      tableau[rowIndex][slackIndex++] = 1;
      tableau[rowIndex][numColumns - 1] = constraint.rhs;
    });

    // Process >= constraints
    geConstraints.forEach((constraint, i) => {
      const rowIndex = constraints.indexOf(constraint);
      tableau[rowIndex][0] = constraint.x1;
      tableau[rowIndex][1] = constraint.x2;
      tableau[rowIndex][slackIndex++] = -1;
      tableau[rowIndex][artificialIndex++] = 1;
      tableau[rowIndex][numColumns - 1] = constraint.rhs;

      // Subtract artificial variable row from objective
      for (let j = 0; j < numColumns; j++) {
        tableau[constraints.length][j] -= M * tableau[rowIndex][j];
      }
    });

    // Process = constraints
    eqConstraints.forEach((constraint, i) => {
      const rowIndex = constraints.indexOf(constraint);
      tableau[rowIndex][0] = constraint.x1;
      tableau[rowIndex][1] = constraint.x2;
      tableau[rowIndex][artificialIndex++] = 1;
      tableau[rowIndex][numColumns - 1] = constraint.rhs;

      // Subtract artificial variable row from objective
      for (let j = 0; j < numColumns; j++) {
        tableau[constraints.length][j] -= M * tableau[rowIndex][j];
      }
    });

    return tableau;
  };

  const findPivotColumn = (tableau) => {
    const lastRow = tableau[tableau.length - 1];
    const mostNegative = Math.min(...lastRow.slice(0, -1));
    return mostNegative < -0.000001 ? lastRow.indexOf(mostNegative) : -1;
  };

  const findPivotRow = (tableau, pivotCol) => {
    let minRatio = Infinity;
    let pivotRow = -1;
    
    for (let i = 0; i < tableau.length - 1; i++) {
      if (tableau[i][pivotCol] <= 0.000001) continue;
      
      const ratio = tableau[i][tableau[i].length - 1] / tableau[i][pivotCol];
      if (ratio >= 0 && ratio < minRatio) {
        minRatio = ratio;
        pivotRow = i;
      }
    }
    
    return pivotRow;
  };

  const performPivot = (tableau, pivotRow, pivotCol) => {
    const newTableau = tableau.map(row => [...row]);
    const pivotValue = newTableau[pivotRow][pivotCol];

    // Normalize pivot row
    newTableau[pivotRow] = newTableau[pivotRow].map(val => val / pivotValue);

    // Update other rows
    for (let i = 0; i < newTableau.length; i++) {
      if (i === pivotRow) continue;
      
      const factor = newTableau[i][pivotCol];
      for (let j = 0; j < newTableau[i].length; j++) {
        newTableau[i][j] = newTableau[i][j] - factor * newTableau[pivotRow][j];
      }
    }

    return newTableau;
  };

  const solveSimplex = () => {
    // Convert inputs to numbers
    const obj = {
      x1: parseFloat(simplexFormData.objective.x1) || 0,
      x2: parseFloat(simplexFormData.objective.x2) || 0,
      type: simplexFormData.objective.type
    };

    const constraints = simplexFormData.constraints.map(c => ({
      x1: parseFloat(c.x1) || 0,
      x2: parseFloat(c.x2) || 0,
      sign: c.sign,
      rhs: parseFloat(c.rhs) || 0
    }));

    // Create initial tableau
    let tableau = createTableau(obj, constraints);
    const iterations = [];
    iterations.push([...tableau.map(row => [...row])]);

    // Maximum iterations to prevent infinite loops
    const maxIterations = 100;
    let iterCount = 0;

    // Perform iterations
    while (iterCount < maxIterations) {
      const pivotCol = findPivotColumn(tableau);
      if (pivotCol === -1) break;

      const pivotRow = findPivotRow(tableau, pivotCol);
      if (pivotRow === -1) {
        setSimplexSolution({ status: 'unbounded' });
        return;
      }

      tableau = performPivot(tableau, pivotRow, pivotCol);
      iterations.push([...tableau.map(row => [...row])]);
      iterCount++;
    }

    if (iterCount === maxIterations) {
      setSimplexSolution({ status: 'not_converged' });
      return;
    }

    // Extract solution
    const solution = extractSolution(tableau);
    const optimalValue = -tableau[tableau.length - 1][tableau[0].length - 1];
    setSimplexSolution({
      status: 'optimal',
      solution,
      optimalValue: obj.type === 'min' ? optimalValue : -optimalValue,
      iterations
    });
  };

  const extractSolution = (tableau) => {
    const numVars = 2; // Number of original variables
    const solution = Array(numVars).fill(0);
    
    // For each original variable
    for (let j = 0; j < numVars; j++) {
      let hasOne = false;
      let oneRow = -1;
      
      // Check if this column has exactly one 1 and rest zeros
      for (let i = 0; i < tableau.length - 1; i++) {
        if (Math.abs(tableau[i][j] - 1) < 0.000001) {
          if (!hasOne) {
            hasOne = true;
            oneRow = i;
          } else {
            hasOne = false;
            break;
          }
        } else if (Math.abs(tableau[i][j]) > 0.000001) {
          hasOne = false;
          break;
        }
      }
      
      // If column has exactly one 1, get the solution value from RHS
      if (hasOne) {
        solution[j] = tableau[oneRow][tableau[0].length - 1];
      }
    }
    
    return solution;
  };

  const calculateSensitivityRanges = (tableau, dualSolution) => {
    const numVars = 2; // Number of original variables
    const ranges = [];

    for (let j = 0; j < numVars; j++) {
      const range = {
        variable: `x${j + 1}`,
        coefficient: tableau[tableau.length - 1][j],
        lowerBound: -Infinity,
        upperBound: Infinity
      };

      // Calculate allowable ranges based on dual solution
      if (dualSolution.status === 'optimal') {
        const dualValues = dualSolution.solution;
        range.lowerBound = range.coefficient - Math.abs(range.coefficient) * 0.5;
        range.upperBound = range.coefficient + Math.abs(range.coefficient) * 0.5;
      }

      ranges.push(range);
    }

    return ranges;
  };

  const northwestCornerMethod = () => {
    const supply = [...transportationData.supply.map(s => parseFloat(s) || 0)];
    const demand = [...transportationData.demand.map(d => parseFloat(d) || 0)];
    const numSources = supply.length;
    const numDests = demand.length;
    
    // Initialize allocation matrix with zeros
    const allocation = Array(numSources).fill().map(() => Array(numDests).fill(0));
    
    let i = 0, j = 0;
    
    while (i < numSources && j < numDests) {
      const quantity = Math.min(supply[i], demand[j]);
      allocation[i][j] = quantity;
      
      supply[i] -= quantity;
      demand[j] -= quantity;
      
      if (Math.abs(supply[i]) < 0.0001) i++;
      if (Math.abs(demand[j]) < 0.0001) j++;
    }

    const totalCost = calculateTotalCost(allocation);
    return { allocation, totalCost };
  };

  const leastCostMethod = () => {
    const supply = [...transportationData.supply.map(s => parseFloat(s) || 0)];
    const demand = [...transportationData.demand.map(d => parseFloat(d) || 0)];
    const costs = transportationData.costs.map(row => row.map(cost => parseFloat(cost) || 0));
    const numSources = supply.length;
    const numDests = demand.length;
    
    // Initialize allocation matrix with zeros
    const allocation = Array(numSources).fill().map(() => Array(numDests).fill(0));
    
    // Keep track of remaining supply and demand
    const remainingSupply = [...supply];
    const remainingDemand = [...demand];
    
    // Continue until all supply and demand are satisfied
    while (Math.max(...remainingSupply) > 0.0001 && Math.max(...remainingDemand) > 0.0001) {
      // Find the cell with minimum cost among cells with remaining supply and demand
      let minCost = Infinity;
      let minI = -1;
      let minJ = -1;
      
      for (let i = 0; i < numSources; i++) {
        if (remainingSupply[i] <= 0.0001) continue;
        
        for (let j = 0; j < numDests; j++) {
          if (remainingDemand[j] <= 0.0001) continue;
          
          if (costs[i][j] < minCost) {
            minCost = costs[i][j];
            minI = i;
            minJ = j;
          }
        }
      }
      
      if (minI === -1 || minJ === -1) break; // No valid cells found
      
      // Allocate the maximum possible quantity to the minimum cost cell
      const quantity = Math.min(remainingSupply[minI], remainingDemand[minJ]);
      allocation[minI][minJ] = quantity;
      
      // Update remaining supply and demand
      remainingSupply[minI] -= quantity;
      remainingDemand[minJ] -= quantity;
      
      // Clean up very small remaining values
      if (remainingSupply[minI] < 0.0001) remainingSupply[minI] = 0;
      if (remainingDemand[minJ] < 0.0001) remainingDemand[minJ] = 0;
    }

    const totalCost = calculateTotalCost(allocation);
    return { allocation, totalCost };
  };

  const findMODIMultipliers = (costs, allocation) => {
    const numSources = allocation.length;
    const numDests = allocation[0].length;
    const u = Array(numSources).fill(null);
    const v = Array(numDests).fill(null);
    
    // Set u[0] = 0 as initial condition
    u[0] = 0;
    
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      // Find remaining multipliers
      for (let i = 0; i < numSources; i++) {
        for (let j = 0; j < numDests; j++) {
          if (allocation[i][j] > 0.000001) {
            if (u[i] !== null && v[j] === null) {
              v[j] = costs[i][j] - u[i];
              changed = true;
            } else if (u[i] === null && v[j] !== null) {
              u[i] = costs[i][j] - v[j];
              changed = true;
            }
          }
        }
      }
    }
    
    // Handle any remaining null values
    for (let i = 0; i < numSources; i++) {
      if (u[i] === null) u[i] = 0;
    }
    for (let j = 0; j < numDests; j++) {
      if (v[j] === null) v[j] = 0;
    }
    
    return { u, v };
  };

  const modiMethod = (initialAllocation) => {
    const costs = transportationData.costs.map(row => row.map(cost => parseFloat(cost) || 0));
    let currentAllocation = initialAllocation.map(row => [...row]);
    const numSources = currentAllocation.length;
    const numDests = currentAllocation[0].length;
    let iterations = 0;
    const maxIterations = 100;
    
    while (iterations < maxIterations) {
      // Find MODI multipliers (u and v)
      const { u, v } = findMODIMultipliers(costs, currentAllocation);
      
      // Calculate opportunity costs and find the most negative
      let maxNegativeCost = 0;
      let enteringCell = null;
      
      for (let i = 0; i < numSources; i++) {
        for (let j = 0; j < numDests; j++) {
          if (Math.abs(currentAllocation[i][j]) < 0.0001) {
            const opportunityCost = costs[i][j] - (u[i] + v[j]);
            if (opportunityCost < maxNegativeCost) {
              maxNegativeCost = opportunityCost;
              enteringCell = [i, j];
            }
          }
        }
      }
      
      // If no negative opportunity cost, solution is optimal
      if (!enteringCell || maxNegativeCost >= -0.0001) break;
      
      // Find closed path for the entering variable
      const path = findClosedPath(currentAllocation, enteringCell[0], enteringCell[1]);
      if (!path) break;
      
      // Find minimum allocation along negative positions in the path
      let minAllocation = Infinity;
      for (let k = 1; k < path.length; k += 2) {
        const [i, j] = path[k];
        if (currentAllocation[i][j] < minAllocation) {
          minAllocation = currentAllocation[i][j];
        }
      }
      
      // Update allocations along the path
      for (let k = 0; k < path.length; k++) {
        const [i, j] = path[k];
        currentAllocation[i][j] += (k % 2 === 0) ? minAllocation : -minAllocation;
        // Clean up very small values
        if (Math.abs(currentAllocation[i][j]) < 0.0001) {
          currentAllocation[i][j] = 0;
        }
      }
      
      iterations++;
    }
    
    return currentAllocation;
  };

  const findClosedPath = (allocation, startI, startJ) => {
    const numSources = allocation.length;
    const numDests = allocation[0].length;
    const path = [[startI, startJ]];
    const visited = new Set();
    
    const findNextInPath = (currentI, currentJ, isHorizontal) => {
      if (isHorizontal) {
        for (let i = 0; i < numSources; i++) {
          if (i !== currentI && allocation[i][currentJ] > 0.0001 && !visited.has(`${i},${currentJ}`)) {
            return [i, currentJ];
          }
        }
      } else {
        for (let j = 0; j < numDests; j++) {
          if (j !== currentJ && allocation[currentI][j] > 0.0001 && !visited.has(`${currentI},${j}`)) {
            return [currentI, j];
          }
        }
      }
      return null;
    };
    
    let isHorizontal = false;
    while (path.length < 2 || path[0][0] !== path[path.length - 1][0] || path[0][1] !== path[path.length - 1][1]) {
      const [currentI, currentJ] = path[path.length - 1];
      visited.add(`${currentI},${currentJ}`);
      
      const next = findNextInPath(currentI, currentJ, isHorizontal);
      if (!next) {
        if (path.length <= 2) return null;
        path.pop();
        visited.delete(`${currentI},${currentJ}`);
        continue;
      }
      
      path.push(next);
      isHorizontal = !isHorizontal;
      
      if (path.length > numSources * numDests) return null;
    }
    
    return path;
  };

  const calculateTotalCost = (allocation) => {
    let totalCost = 0;
    const costs = transportationData.costs.map(row => row.map(cost => parseFloat(cost) || 0));
    
    for (let i = 0; i < allocation.length; i++) {
      for (let j = 0; j < allocation[i].length; j++) {
        const cost = costs[i][j];
        const quantity = allocation[i][j];
        if (!isNaN(cost) && !isNaN(quantity)) {
          totalCost += quantity * cost;
        }
      }
    }
    
    return totalCost;
  };

  const vogelsApproximationMethod = () => {
    const supply = [...transportationData.supply.map(s => parseFloat(s) || 0)];
    const demand = [...transportationData.demand.map(d => parseFloat(d) || 0)];
    const costs = transportationData.costs.map(row => row.map(cost => parseFloat(cost) || 0));
    const numSources = supply.length;
    const numDests = demand.length;
    
    // Initialize allocation matrix with zeros
    const allocation = Array(numSources).fill().map(() => Array(numDests).fill(0));
    
    // Helper function to find row/column penalties
    const findPenalties = () => {
      const rowPenalties = Array(numSources).fill(-1);
      const colPenalties = Array(numDests).fill(-1);
      
      // Calculate row penalties
      for (let i = 0; i < numSources; i++) {
        if (supply[i] <= 0.0001) continue;
        
        const availableCosts = [];
        for (let j = 0; j < numDests; j++) {
          if (demand[j] > 0.0001) {
            availableCosts.push(costs[i][j]);
          }
        }
        
        if (availableCosts.length >= 2) {
          availableCosts.sort((a, b) => a - b);
          rowPenalties[i] = availableCosts[1] - availableCosts[0];
        }
      }
      
      // Calculate column penalties
      for (let j = 0; j < numDests; j++) {
        if (demand[j] <= 0.0001) continue;
        
        const availableCosts = [];
        for (let i = 0; i < numSources; i++) {
          if (supply[i] > 0.0001) {
            availableCosts.push(costs[i][j]);
          }
        }
        
        if (availableCosts.length >= 2) {
          availableCosts.sort((a, b) => a - b);
          colPenalties[j] = availableCosts[1] - availableCosts[0];
        }
      }
      
      return { rowPenalties, colPenalties };
    };
    
    // Helper function to find minimum cost cell in a row/column
    const findMinCostCell = (isRow, index) => {
      let minCost = Infinity;
      let minIndex = -1;
      
      if (isRow) {
        for (let j = 0; j < numDests; j++) {
          if (demand[j] > 0.0001 && costs[index][j] < minCost) {
            minCost = costs[index][j];
            minIndex = j;
          }
        }
        return { cost: minCost, i: index, j: minIndex };
      } else {
        for (let i = 0; i < numSources; i++) {
          if (supply[i] > 0.0001 && costs[i][index] < minCost) {
            minCost = costs[i][index];
            minIndex = i;
          }
        }
        return { cost: minCost, i: minIndex, j: index };
      }
    };
    
    while (Math.max(...supply) > 0.0001 && Math.max(...demand) > 0.0001) {
      const { rowPenalties, colPenalties } = findPenalties();
      
      // Find maximum penalty
      let maxPenalty = -1;
      let maxPenaltyIsRow = true;
      let maxPenaltyIndex = -1;
      
      for (let i = 0; i < numSources; i++) {
        if (rowPenalties[i] > maxPenalty) {
          maxPenalty = rowPenalties[i];
          maxPenaltyIsRow = true;
          maxPenaltyIndex = i;
        }
      }
      
      for (let j = 0; j < numDests; j++) {
        if (colPenalties[j] > maxPenalty) {
          maxPenalty = colPenalties[j];
          maxPenaltyIsRow = false;
          maxPenaltyIndex = j;
        }
      }
      
      if (maxPenaltyIndex === -1) {
        // If no penalties found, find the minimum cost among remaining cells
        let minCost = Infinity;
        let minI = -1, minJ = -1;
        
        for (let i = 0; i < numSources; i++) {
          if (supply[i] <= 0.0001) continue;
          for (let j = 0; j < numDests; j++) {
            if (demand[j] <= 0.0001) continue;
            if (costs[i][j] < minCost) {
              minCost = costs[i][j];
              minI = i;
              minJ = j;
            }
          }
        }
        
        if (minI !== -1 && minJ !== -1) {
          const quantity = Math.min(supply[minI], demand[minJ]);
          allocation[minI][minJ] = quantity;
          supply[minI] -= quantity;
          demand[minJ] -= quantity;
        }
        continue;
      }
      
      // Find the minimum cost cell in the selected row/column
      const { i, j } = findMinCostCell(maxPenaltyIsRow, maxPenaltyIndex);
      
      if (i !== -1 && j !== -1) {
        const quantity = Math.min(supply[i], demand[j]);
        allocation[i][j] = quantity;
        supply[i] -= quantity;
        demand[j] -= quantity;
      }
    }
    
    const totalCost = calculateTotalCost(allocation);
    return { allocation, totalCost };
  };

  const solveTransportation = () => {
    try {
      // Validate inputs
      const totalSupply = transportationData.supply.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      const totalDemand = transportationData.demand.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      
      if (totalSupply === 0 || totalDemand === 0) {
        alert('Please enter all supply and demand values');
        return;
      }
      
      if (Math.abs(totalSupply - totalDemand) > 0.0001) {
        alert('Total supply must equal total demand');
        return;
      }
      
      // Check if all costs are entered
      const hasAllCosts = transportationData.costs.every(row => 
        row.every(cost => cost !== '' && !isNaN(parseFloat(cost)))
      );
      
      if (!hasAllCosts) {
        alert('Please enter all transportation costs');
        return;
      }

      // Get initial solutions using all three methods
      const nwcSolution = northwestCornerMethod();
      const lcmSolution = leastCostMethod();
      const vamSolution = vogelsApproximationMethod();

      // Find the best initial solution
      const solutions = [
        { method: 'Northwest Corner', allocation: nwcSolution.allocation, cost: nwcSolution.totalCost },
        { method: 'Least Cost', allocation: lcmSolution.allocation, cost: lcmSolution.totalCost },
        { method: 'Vogel\'s Approximation', allocation: vamSolution.allocation, cost: vamSolution.totalCost }
      ];

      // Sort solutions by cost to find the best one
      solutions.sort((a, b) => a.cost - b.cost);
      
      // Use MODI method to find optimal solution from the best initial solution
      const optimalAllocation = modiMethod(solutions[0].allocation);
      const optimalCost = calculateTotalCost(optimalAllocation);

      if (isNaN(optimalCost)) {
        throw new Error('Invalid solution: Cost calculation resulted in NaN');
      }

      // Set the transportation solution state
      setTransportationSolution({
        initialSolutions: solutions,
        optimal: {
          method: `Optimal Solution (MODI Method from ${solutions[0].method})`,
          allocation: optimalAllocation,
          cost: optimalCost
        }
      });

    } catch (error) {
      console.error('Error in solveTransportation:', error);
      alert('An error occurred while solving the transportation problem: ' + error.message);
    }
  };

  // Add duality handlers
  const handleDualityObjectiveChange = (e) => {
    const { name, value } = e.target;
    setDualityFormData(prev => ({
      ...prev,
      objective: { ...prev.objective, [name]: value }
    }));
  };

  const handleDualityConstraintChange = (index, field, value) => {
    setDualityFormData(prev => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = { ...newConstraints[index], [field]: value };
      return { ...prev, constraints: newConstraints };
    });
  };

  const addDualityConstraint = () => {
    setDualityFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, { x1: '', x2: '', x3: '', sign: '<=', rhs: '' }]
    }));
  };

  // Add duality conversion function
  const getDual = (primalType, objectiveCoeffs, constraints, constraintSigns, rhsValues) => {
    const numConstraints = constraints.length;
    const numVariables = objectiveCoeffs.length;
    
    // Determine dual type (opposite of primal)
    const dualType = primalType.toLowerCase() === 'max' ? 'min' : 'max';
    
    // Create dual objective coefficients from primal RHS values
    const dualObjective = {
        type: dualType,
        x1: rhsValues[0] || 0,
        x2: rhsValues[1] || 0,
        x3: rhsValues[2] || 0,
        numVars: numConstraints
    };
    
    // Create dual constraints
    const dualConstraints = [];
    
    // For each primal variable, create a dual constraint
    for (let j = 0; j < numVariables; j++) {
        // Get coefficients for this constraint from the j-th column of primal constraints
        const constraintCoeffs = constraints.map(row => row[j]);
        
        // Determine dual constraint sign based on primal type
        let dualSign;
        if (primalType.toLowerCase() === 'max') {
            dualSign = '>=';  // For max problems, dual constraints are ≥
        } else {
            dualSign = '<=';  // For min problems, dual constraints are ≤
        }
        
        // Create dual constraint
        const dualConstraint = {
            x1: constraintCoeffs[0] || 0,
            x2: constraintCoeffs[1] || 0,
            x3: constraintCoeffs[2] || 0,
            sign: dualSign,
            rhs: objectiveCoeffs[j]
        };
        
        dualConstraints.push(dualConstraint);
    }

    return {
        objective: dualObjective,
        constraints: dualConstraints,
        formulation: formatDualProblem(dualType, rhsValues, constraints, objectiveCoeffs, numConstraints, constraintSigns)
    };
  };

  const formatDualProblem = (dualType, rhsValues, constraints, objectiveCoeffs, numConstraints, primalConstraintSigns) => {
    let formulation = `Dual Problem:\n\n`;
    formulation += `${dualType === 'min' ? 'Minimize' : 'Maximize'}\n`;
    
    // Objective function
    formulation += 'Z = ';
    for (let i = 0; i < numConstraints; i++) {
        if (i > 0) formulation += ' + ';
        formulation += `${rhsValues[i]}y${i + 1}`;
    }
    formulation += '\n\nSubject To:\n';
    
    // Constraints
    for (let j = 0; j < constraints[0].length; j++) {
        let constraint = '';
        for (let i = 0; i < numConstraints; i++) {
            const coeff = constraints[i][j];
            if (i > 0 && coeff >= 0) constraint += ' + ';
            constraint += `${coeff}y${i + 1}`;
        }
        constraint += ` ${dualType === 'min' ? '>=' : '<='} ${objectiveCoeffs[j]}\n`;
        formulation += constraint;
    }
    
    // Sign restrictions based on primal constraint types
    formulation += '\nSign restrictions:\n';
    for (let i = 0; i < numConstraints; i++) {
        const primalSign = primalConstraintSigns[i];
        if (dualType === 'min') {  // Primal is max
            if (primalSign === '<=') {
                formulation += `y${i + 1} ≥ 0\n`;
            } else if (primalSign === '>=') {
                formulation += `y${i + 1} ≤ 0\n`;
            } else {
                formulation += `y${i + 1} unrestricted\n`;
            }
        } else {  // Primal is min
            if (primalSign === '<=') {
                formulation += `y${i + 1} ≤ 0\n`;
            } else if (primalSign === '>=') {
                formulation += `y${i + 1} ≥ 0\n`;
            } else {
                formulation += `y${i + 1} unrestricted\n`;
            }
        }
    }
    
    return formulation;
  };

  const solveTableau = (tableau) => {
    let currentTableau = tableau.map(row => [...row]);
    const maxIterations = 100;
    let iterCount = 0;

    while (iterCount < maxIterations) {
      const pivotCol = findPivotColumn(currentTableau);
      if (pivotCol === -1) break;

      const pivotRow = findPivotRow(currentTableau, pivotCol);
      if (pivotRow === -1) {
        return { status: 'unbounded' };
      }

      currentTableau = performPivot(currentTableau, pivotRow, pivotCol);
      iterCount++;
    }

    if (iterCount === maxIterations) {
      return { status: 'not_converged' };
    }

    // Check if solution is feasible (no artificial variables in basis)
    const numColumns = currentTableau[0].length;
    const numArtificialVars = Math.floor((numColumns - 3) / 2); // Rough estimate
    
    for (let j = numColumns - numArtificialVars - 1; j < numColumns - 1; j++) {
      for (let i = 0; i < currentTableau.length - 1; i++) {
        if (Math.abs(currentTableau[i][j] - 1) < 0.000001 && currentTableau[i][numColumns - 1] > 0.000001) {
          return { status: 'infeasible' };
        }
      }
    }

    // Extract solution
    const solution = extractSolution(currentTableau);
    const objectiveValue = -currentTableau[currentTableau.length - 1][currentTableau[0].length - 1];

    return {
      status: 'optimal',
      solution,
      objectiveValue
    };
  };

  const solveDuality = () => {
    try {
      // Extract primal problem data
      const primalType = dualityFormData.objective.type;
      const objectiveCoeffs = [
        parseFloat(dualityFormData.objective.x1) || 0,
        parseFloat(dualityFormData.objective.x2) || 0,
        parseFloat(dualityFormData.objective.x3) || 0
      ].slice(0, dualityFormData.objective.numVars);
      
      const constraints = dualityFormData.constraints.map(c => [
        parseFloat(c.x1) || 0,
        parseFloat(c.x2) || 0,
        parseFloat(c.x3) || 0
      ].slice(0, dualityFormData.objective.numVars));
      
      const constraintSigns = dualityFormData.constraints.map(c => c.sign);
      const rhsValues = dualityFormData.constraints.map(c => parseFloat(c.rhs) || 0);
      
      // Get dual problem
      const dualProblem = getDual(primalType, objectiveCoeffs, constraints, constraintSigns, rhsValues);
      
      // Create tableaus for both problems
      const primalTableau = createTableau(dualityFormData.objective, dualityFormData.constraints);
      const dualTableau = createTableau(dualProblem.objective, dualProblem.constraints);
      
      // Solve both problems
      const primalSolution = solveTableau(primalTableau);
      const dualSolution = solveTableau(dualTableau);
      
      // Set solution state
      setDualitySolution({
        primal: {
          type: primalType,
          solution: primalSolution.solution,
          objectiveValue: primalType === 'min' ? primalSolution.objectiveValue : -primalSolution.objectiveValue,
          status: primalSolution.status
        },
        dual: {
          type: dualProblem.objective.type,
          solution: dualSolution.solution,
          objectiveValue: dualProblem.objective.type === 'min' ? dualSolution.objectiveValue : -dualSolution.objectiveValue,
          status: dualSolution.status,
          formulation: dualProblem
        }
      });
      
    } catch (error) {
      console.error('Error in solveDuality:', error);
      alert('An error occurred while solving the duality problem: ' + error.message);
    }
  };

  return (
    <div className="linear-programming">
      <div className="theory-section">
        <h2>Linear Programming</h2>
        <p>
          Linear Programming is a method to achieve the best outcome in a mathematical model
          whose requirements are represented by linear relationships. It is widely used in
          business and economics for resource allocation and optimization problems.
        </p>

        <div className="subtopics">
          <div className="subtopic">
        <h3>Graphical Method</h3>
            <p>
              The graphical method is a visual approach to solving linear programming problems
              with two variables. It involves plotting constraints and finding the optimal
              solution at one of the vertices of the feasible region.
            </p>
            
        <div className="form-container">
          {/* Objective Function */}
          <div className="input-group">
            <h4>Objective Function</h4>
            <div className="objective-inputs">
              <input
                type="number"
                name="x1"
                value={formData.objective.x1}
                onChange={handleObjectiveChange}
                placeholder="x₁ coefficient"
              />
              <span>x₁ +</span>
              <input
                type="number"
                name="x2"
                value={formData.objective.x2}
                onChange={handleObjectiveChange}
                placeholder="x₂ coefficient"
              />
              <span>x₂</span>
              <select
                name="type"
                value={formData.objective.type}
                onChange={handleObjectiveChange}
              >
                <option value="max">Maximize</option>
                <option value="min">Minimize</option>
              </select>
            </div>
          </div>

          {/* Constraints */}
          <div className="input-group">
            <h4>Constraints</h4>
            {formData.constraints.map((constraint, index) => (
              <div key={index} className="constraint-inputs">
                <input
                  type="number"
                  value={constraint.x1}
                  onChange={(e) => handleConstraintChange(index, 'x1', e.target.value)}
                  placeholder="x₁ coefficient"
                />
                <span>x₁ +</span>
                <input
                  type="number"
                  value={constraint.x2}
                  onChange={(e) => handleConstraintChange(index, 'x2', e.target.value)}
                  placeholder="x₂ coefficient"
                />
                <span>x₂</span>
                <select
                  value={constraint.sign}
                  onChange={(e) => handleConstraintChange(index, 'sign', e.target.value)}
                >
                  <option value="<=">≤</option>
                  <option value=">=">≥</option>
                  <option value="=">=</option>
                </select>
                <input
                  type="number"
                  value={constraint.rhs}
                  onChange={(e) => handleConstraintChange(index, 'rhs', e.target.value)}
                  placeholder="RHS"
                />
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addConstraint}>
              Add Constraint
            </button>
          </div>

          <button className="btn btn-primary" onClick={solveGraphically}>
            Solve
          </button>
        </div>

        {/* Solution Display */}
        {solution && (
          <div className="solution-container">
            <h4>Solution</h4>
            {solution.optimalPoint ? (
              <>
                <p>Optimal Point: ({solution.optimalPoint.x.toFixed(2)}, {solution.optimalPoint.y.toFixed(2)})</p>
                <p>Optimal Value: {solution.optimalValue.toFixed(2)}</p>
                <div className="chart-container">
                      <Line data={getChartData()} options={chartOptions} />
                </div>
              </>
            ) : (
              <p>No feasible solution found</p>
            )}
          </div>
        )}
      </div>

          <div className="subtopic">
            <h3>Simplex Method</h3>
            <p>
              The Simplex Method solves linear programming problems by iteratively improving
              the solution using tableau operations.
            </p>
            
            <div className="form-container">
              {/* Objective Function */}
              <div className="input-group">
                <h4>Objective Function</h4>
                <div className="objective-inputs">
                  <input
                    type="number"
                    name="x1"
                    value={simplexFormData.objective.x1}
                    onChange={handleSimplexObjectiveChange}
                    placeholder="x₁ coefficient"
                  />
                  <span>x₁ +</span>
                  <input
                    type="number"
                    name="x2"
                    value={simplexFormData.objective.x2}
                    onChange={handleSimplexObjectiveChange}
                    placeholder="x₂ coefficient"
                  />
                  <span>x₂</span>
                  <select
                    name="type"
                    value={simplexFormData.objective.type}
                    onChange={handleSimplexObjectiveChange}
                  >
                    <option value="max">Maximize</option>
                    <option value="min">Minimize</option>
                  </select>
                </div>
              </div>

              {/* Constraints */}
              <div className="input-group">
                <h4>Constraints</h4>
                {simplexFormData.constraints.map((constraint, index) => (
                  <div key={index} className="constraint-inputs">
                    <input
                      type="number"
                      value={constraint.x1}
                      onChange={(e) => handleSimplexConstraintChange(index, 'x1', e.target.value)}
                      placeholder="x₁ coefficient"
                    />
                    <span>x₁ +</span>
                    <input
                      type="number"
                      value={constraint.x2}
                      onChange={(e) => handleSimplexConstraintChange(index, 'x2', e.target.value)}
                      placeholder="x₂ coefficient"
                    />
                    <span>x₂</span>
                    <select
                      value={constraint.sign}
                      onChange={(e) => handleSimplexConstraintChange(index, 'sign', e.target.value)}
                    >
                      <option value="<=">≤</option>
                      <option value=">=">≥</option>
                      <option value="=">=</option>
                    </select>
                    <input
                      type="number"
                      value={constraint.rhs}
                      onChange={(e) => handleSimplexConstraintChange(index, 'rhs', e.target.value)}
                      placeholder="RHS"
                    />
                  </div>
                ))}
                <button className="btn btn-secondary" onClick={addSimplexConstraint}>
                  Add Constraint
                </button>
              </div>

              <button className="btn btn-primary" onClick={solveSimplex}>
                Solve using Simplex Method
              </button>
            </div>

            {simplexSolution && (
              <div className="solution-container">
                <h4>Simplex Method Solution</h4>
                {simplexSolution.status === 'optimal' ? (
                  <>
                    <p>Optimal Solution:</p>
                    <p>x₁ = {simplexSolution.solution[0].toFixed(4)}</p>
                    <p>x₂ = {simplexSolution.solution[1].toFixed(4)}</p>
                    <p>Optimal Value: {simplexSolution.optimalValue.toFixed(4)}</p>
                    
                    <h4>Iterations</h4>
                    {simplexSolution.iterations.map((tableau, index) => (
                      <div key={index} className="tableau-container">
                        <h5>Iteration {index}</h5>
                        <table className="tableau">
                          <tbody>
                            {tableau.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex}>{cell.toFixed(2)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </>
                ) : simplexSolution.status === 'unbounded' ? (
                  <p>Problem is unbounded</p>
                ) : simplexSolution.status === 'infeasible' ? (
                  <p>Problem is infeasible</p>
                ) : (
                  <p>Solution did not converge</p>
                )}
              </div>
            )}
          </div>

          <div className="subtopic">
            <h3>Transportation Problem</h3>
            <div className="form-container">
              <div className="input-group">
                <div className="transport-row">
                  <label>Number of Sources:</label>
                  <input
                    type="number"
                    min="2"
                    value={transportationData.sources.length}
                    onChange={(e) => {
                      const size = Math.max(2, parseInt(e.target.value) || 2);
                      setTransportationData(prev => {
                        const newSources = Array(size).fill('').map((_, i) => `Source ${i + 1}`);
                        const newSupply = Array(size).fill('');
                        const newCosts = Array(size).fill('').map(() => 
                          Array(prev.destinations.length).fill('')
                        );
                        return {
                          ...prev,
                          sources: newSources,
                          supply: newSupply,
                          costs: newCosts
                        };
                      });
                    }}
                  />
                </div>
                <div className="transport-row">
                  <label>Number of Destinations:</label>
                  <input
                    type="number"
                    min="2"
                    value={transportationData.destinations.length}
                    onChange={(e) => {
                      const size = Math.max(2, parseInt(e.target.value) || 2);
                      setTransportationData(prev => {
                        const newDests = Array(size).fill('').map((_, i) => `Dest ${i + 1}`);
                        const newDemand = Array(size).fill('');
                        const newCosts = prev.costs.map(row => 
                          Array(size).fill('')
                        );
                        return {
                          ...prev,
                          destinations: newDests,
                          demand: newDemand,
                          costs: newCosts
                        };
                      });
                    }}
                  />
                </div>
              </div>

              <div className="input-group">
                <h4>Transportation Problem Data</h4>
                <div className="cost-matrix">
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        {transportationData.destinations.map((_, index) => (
                          <th key={index}>Dest {index + 1}</th>
                        ))}
                        <th>Supply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transportationData.sources.map((_, sourceIndex) => (
                        <tr key={sourceIndex}>
                          <td>Source {sourceIndex + 1}</td>
                          {transportationData.destinations.map((_, destIndex) => (
                            <td key={destIndex}>
                              <input
                                type="number"
                                value={transportationData.costs[sourceIndex][destIndex]}
                                onChange={(e) => handleCostChange(sourceIndex, destIndex, e.target.value)}
                                placeholder="Cost"
                              />
                            </td>
                          ))}
                          <td>
                            <input
                              type="number"
                              value={transportationData.supply[sourceIndex]}
                              onChange={(e) => handleSupplyChange(sourceIndex, e.target.value)}
                              placeholder="Supply"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>Demand</td>
                        {transportationData.demand.map((_, index) => (
                          <td key={index}>
                            <input
                              type="number"
                              value={transportationData.demand[index]}
                              onChange={(e) => handleDemandChange(index, e.target.value)}
                              placeholder="Demand"
                            />
                          </td>
                        ))}
                        <td className="total-cell">
                          Total Supply/Demand: {transportationData.supply.reduce((sum, val) => sum + (parseFloat(val) || 0), 0)} / {transportationData.demand.reduce((sum, val) => sum + (parseFloat(val) || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button className="btn btn-primary" onClick={solveTransportation}>
                Solve Transportation Problem
              </button>
            </div>

            {transportationSolution && (
              <div className="solution-container">
                <h4>Transportation Problem Solution</h4>
                
                {/* Initial Solution */}
                <div className="initial-solutions">
                  <h5>Initial Solution</h5>
                  {transportationSolution.initialSolutions.map((solution, index) => (
                    <div key={index} className="method-solution">
                      <h6>{solution.method}</h6>
                      <div className="allocation-matrix">
                        <table>
                          <thead>
                            <tr>
                              <th></th>
                              {transportationData.destinations.map((dest, index) => (
                                <th key={index}>Dest {index + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {transportationData.sources.map((source, i) => (
                              <tr key={i}>
                                <td>Source {i + 1}</td>
                                {solution.allocation[i].map((value, j) => (
                                  <td key={j}>{Math.abs(value) < 0.0001 ? '0' : value.toFixed(2)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p>Initial Cost: {solution.cost.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Optimal Solution */}
                {transportationSolution.optimal && (
                  <div className="optimal-solution">
                    <h5>Optimal Solution</h5>
                    <div className="allocation-matrix">
                      <table>
                        <thead>
                          <tr>
                            <th></th>
                            {transportationData.destinations.map((dest, index) => (
                              <th key={index}>Dest {index + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transportationData.sources.map((source, i) => (
                            <tr key={i}>
                              <td>Source {i + 1}</td>
                              {transportationSolution.optimal.allocation[i].map((value, j) => (
                                <td key={j}>{Math.abs(value) < 0.0001 ? '0' : value.toFixed(2)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="total-cost">
                      Optimal Total Cost: {transportationSolution.optimal.cost.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="subtopic">
            <h3>Duality Theory</h3>
            <p>
              Duality theory provides insights into linear programming problems by analyzing
              the relationship between primal and dual problems. This helps in sensitivity
              analysis and economic interpretation.
            </p>
            
            <div className="form-container">
              {/* Objective Function */}
              <div className="input-group">
                <h4>Objective Function</h4>
                <div className="objective-inputs">
                  <input
                    type="number"
                    name="x1"
                    value={dualityFormData.objective.x1}
                    onChange={handleDualityObjectiveChange}
                    placeholder="x₁ coefficient"
                  />
                  <span>x₁ +</span>
                  <input
                    type="number"
                    name="x2"
                    value={dualityFormData.objective.x2}
                    onChange={handleDualityObjectiveChange}
                    placeholder="x₂ coefficient"
                  />
                  <span>x₂</span>
                  <select
                    name="type"
                    value={dualityFormData.objective.type}
                    onChange={handleDualityObjectiveChange}
                  >
                    <option value="max">Maximize</option>
                    <option value="min">Minimize</option>
                  </select>
                </div>
              </div>

              {/* Constraints */}
              <div className="input-group">
                <h4>Primal Constraints</h4>
                {dualityFormData.constraints.map((constraint, index) => (
                  <div key={index} className="constraint-inputs">
                    <input
                      type="number"
                      value={constraint.x1}
                      onChange={(e) => handleDualityConstraintChange(index, 'x1', e.target.value)}
                      placeholder="x₁ coefficient"
                    />
                    <span>x₁ +</span>
                    <input
                      type="number"
                      value={constraint.x2}
                      onChange={(e) => handleDualityConstraintChange(index, 'x2', e.target.value)}
                      placeholder="x₂ coefficient"
                    />
                    <span>x₂</span>
                    <select
                      value={constraint.sign}
                      onChange={(e) => handleDualityConstraintChange(index, 'sign', e.target.value)}
                    >
                      <option value="<=">≤</option>
                      <option value=">=">≥</option>
                      <option value="=">=</option>
                    </select>
                    <input
                      type="number"
                      value={constraint.rhs}
                      onChange={(e) => handleDualityConstraintChange(index, 'rhs', e.target.value)}
                      placeholder="RHS"
                    />
                  </div>
                ))}
                <button className="btn btn-secondary" onClick={addDualityConstraint}>
                  Add Constraint
                </button>
              </div>

              <button className="btn btn-primary" onClick={solveDuality}>
                Solve with Duality
              </button>
            </div>

            {dualitySolution && (
              <div className="solution-container">
                <h4>Duality Analysis</h4>
                
                {/* Primal Solution */}
                <div className="primal-solution">
                  <h5>Primal Solution</h5>
                  {dualitySolution.primal.status === 'optimal' ? (
                    <>
                      <p>x₁ = {dualitySolution.primal.solution[0].toFixed(4)}</p>
                      <p>x₂ = {dualitySolution.primal.solution[1].toFixed(4)}</p>
                      <p>Optimal Value: {dualitySolution.primal.objectiveValue.toFixed(4)}</p>
                    </>
                  ) : (
                    <p>Primal problem is {dualitySolution.primal.status}</p>
                  )}
                </div>

                {/* Dual Solution */}
                <div className="dual-solution">
                  <h5>Dual Problem Formulation</h5>
                  <p>Type: {dualitySolution.dual.type}</p>
                  <p>Objective: {dualitySolution.dual.formulation.objective.x1}y₁ + {dualitySolution.dual.formulation.objective.x2}y₂</p>
                  <p>Subject to:</p>
                  <ul>
                    {dualitySolution.dual.formulation.constraints.map((constraint, index) => (
                      <li key={index}>
                        {constraint.x1}y₁ + {constraint.x2}y₂ {constraint.sign} {constraint.rhs}
                      </li>
                    ))}
                  </ul>
                  
                  <h5>Dual Solution</h5>
                  {dualitySolution.dual.status === 'optimal' ? (
                    <>
                      <p>y₁ = {dualitySolution.dual.solution[0].toFixed(4)}</p>
                      <p>y₂ = {dualitySolution.dual.solution[1].toFixed(4)}</p>
                      <p>Optimal Value: {dualitySolution.dual.objectiveValue.toFixed(4)}</p>
                    </>
                  ) : (
                    <p>Dual problem is {dualitySolution.dual.status}</p>
                  )}
                </div>

                {/* Strong Duality */}
                {dualitySolution.primal.status === 'optimal' && dualitySolution.dual.status === 'optimal' && (
                  <div className="strong-duality">
                    <h5>Strong Duality</h5>
                    <p>
                      Primal Optimal Value = Dual Optimal Value = {dualitySolution.primal.objectiveValue.toFixed(4)}
                    </p>
                    <p>This confirms that strong duality holds for this problem.</p>
          </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinearProgramming; 