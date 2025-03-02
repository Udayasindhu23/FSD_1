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
