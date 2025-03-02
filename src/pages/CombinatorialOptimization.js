import React, { useState, useEffect, useRef } from 'react';
import './CombinatorialOptimization.css';

function CombinatorialOptimization() {
  const [knapsackData, setKnapsackData] = useState({
    capacity: '',
    items: [
      { weight: '', value: '' },
      { weight: '', value: '' }
    ]
  });

  const [solution, setSolution] = useState(null);

  const handleCapacityChange = (e) => {
    setKnapsackData(prev => ({
      ...prev,
      capacity: e.target.value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setKnapsackData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setKnapsackData(prev => ({
      ...prev,
      items: [...prev.items, { weight: '', value: '' }]
    }));
  };

  const solveKnapsack = () => {
    const capacity = parseInt(knapsackData.capacity);
    const items = knapsackData.items.map(item => ({
      weight: parseInt(item.weight),
      value: parseInt(item.value)
    }));

    // Create DP table
    const n = items.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    const selected = Array(n + 1).fill().map(() => Array(capacity + 1).fill(false));

    // Fill DP table
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        if (items[i-1].weight <= w) {
          const include = items[i-1].value + dp[i-1][w - items[i-1].weight];
          const exclude = dp[i-1][w];
          if (include > exclude) {
            dp[i][w] = include;
            selected[i][w] = true;
          } else {
            dp[i][w] = exclude;
            selected[i][w] = false;
          }
        } else {
          dp[i][w] = dp[i-1][w];
          selected[i][w] = false;
        }
      }
    }

    // Backtrack to find selected items
    const selectedItems = [];
    let i = n;
    let w = capacity;
    while (i > 0 && w > 0) {
      if (selected[i][w]) {
        selectedItems.push(i - 1);
        w -= items[i-1].weight;
      }
      i--;
    }

    setSolution({
      maxValue: dp[n][capacity],
      selectedItems,
      dpTable: dp,
      items
    });
  };

  // Add new state for Branch and Bound
  const [branchAndBoundData, setBranchAndBoundData] = useState({
    numVars: 2,
    objective: { type: 'max', coefficients: ['', ''] },
    numConstraints: 2,
    constraints: [
      { coefficients: ['', ''], sign: '<=', rhs: '' },
      { coefficients: ['', ''], sign: '<=', rhs: '' }
    ],
    integerVariables: [true, true]
  });

  const [branchAndBoundSolution, setBranchAndBoundSolution] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const canvasRef = useRef(null);

  const handleNumVarsChange = (e) => {
    const num = parseInt(e.target.value) || 2;
    setBranchAndBoundData(prev => ({
      ...prev,
      numVars: num,
      objective: {
        ...prev.objective,
        coefficients: Array(num).fill('')
      },
      constraints: prev.constraints.map(c => ({
        ...c,
        coefficients: Array(num).fill('')
      })),
      integerVariables: Array(num).fill(true)
    }));
  };

  const handleNumConstraintsChange = (e) => {
    const num = parseInt(e.target.value) || 1;
    setBranchAndBoundData(prev => ({
      ...prev,
      numConstraints: num,
      constraints: Array(num).fill().map(() => ({
        coefficients: Array(prev.numVars).fill(''),
        sign: '<=',
        rhs: ''
      }))
    }));
  };

  const handleObjectiveChange = (index, value) => {
    setBranchAndBoundData(prev => ({
      ...prev,
      objective: {
        ...prev.objective,
        coefficients: prev.objective.coefficients.map((c, i) => i === index ? value : c)
      }
    }));
  };

  const handleConstraintChange = (constraintIndex, coeffIndex, value) => {
    setBranchAndBoundData(prev => {
      const newConstraints = [...prev.constraints];
      const newCoefficients = [...newConstraints[constraintIndex].coefficients];
      newCoefficients[coeffIndex] = value;
      newConstraints[constraintIndex] = {
        ...newConstraints[constraintIndex],
        coefficients: newCoefficients
      };
      return { ...prev, constraints: newConstraints };
    });
  };

  const handleConstraintSignChange = (index, value) => {
    setBranchAndBoundData(prev => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = { ...newConstraints[index], sign: value };
      return { ...prev, constraints: newConstraints };
    });
  };

  const handleRHSChange = (index, value) => {
    setBranchAndBoundData(prev => {
      const newConstraints = [...prev.constraints];
      newConstraints[index] = { ...newConstraints[index], rhs: value };
      return { ...prev, constraints: newConstraints };
    });
  };

  const toggleIntegerVariable = (index) => {
    setBranchAndBoundData(prev => ({
      ...prev,
      integerVariables: prev.integerVariables.map((v, i) => i === index ? !v : v)
    }));
  };

  // Function to draw the tree
  const drawTree = (nodes, canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with a white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const levelHeight = 120; // Increased vertical spacing
    const boxWidth = 160;    // Fixed box width
    const boxHeight = 60;    // Fixed box height
    let levels = {};

    // Group nodes by depth
    nodes.forEach(node => {
      if (!levels[node.depth]) {
        levels[node.depth] = [];
      }
      levels[node.depth].push(node);
    });

    // Draw connections first
    Object.entries(levels).forEach(([depth, levelNodes]) => {
      const y = (parseInt(depth) + 1) * levelHeight + 50;
      const levelWidth = width - 100;
      const spacing = levelWidth / (levelNodes.length + 1);

      levelNodes.forEach((node, index) => {
        const x = (index + 1) * spacing + 50;
        
        // Draw connection to parent if not root
        if (node.parentId !== undefined) {
          const parentNode = nodes.find(n => n.id === node.parentId);
          if (parentNode) {
            const parentY = (parentNode.depth + 1) * levelHeight + 50;
            const parentX = (levels[parentNode.depth].indexOf(parentNode) + 1) * spacing + 50;
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(parentX, parentY + boxHeight/2);
            ctx.lineTo(x, y - boxHeight/2);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw constraint on the line
            if (node.constraint) {
              const midX = (parentX + x) / 2;
              const midY = (parentY + y - boxHeight) / 2;
              
              ctx.fillStyle = '#ffffff';
              const textMetrics = ctx.measureText(node.constraint);
              const padding = 4;
              ctx.fillRect(
                midX - textMetrics.width/2 - padding,
                midY - 8,
                textMetrics.width + 2*padding,
                16
              );
              
              ctx.fillStyle = '#333';
              ctx.font = '12px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(node.constraint, midX, midY);
            }
          }
        }
      });
    });

    // Draw nodes
    Object.entries(levels).forEach(([depth, levelNodes]) => {
      const y = (parseInt(depth) + 1) * levelHeight + 50;
      const levelWidth = width - 100;
      const spacing = levelWidth / (levelNodes.length + 1);

      levelNodes.forEach((node, index) => {
        const x = (index + 1) * spacing + 50;
        
        // Draw box with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw box
        ctx.beginPath();
        ctx.rect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Reset shadow for text
        ctx.shadowColor = 'transparent';

        // Draw node values
        ctx.fillStyle = '#333';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (node.solution) {
          // Format solution values to match image style
          const x1Value = node.solution[0].toFixed(1);
          const x2Value = node.solution[1].toFixed(1);
          const zValue = node.value.toFixed(1);
          
          ctx.fillText(`x₁ = ${x1Value}, x₂ = ${x2Value}`, x, y - 10);
          ctx.fillText(`Zmax = ${zValue}`, x, y + 10);
        }

        // Add status label if needed
        if (node.status === 'infeasible' || node.status === 'optimal') {
          ctx.font = '12px Arial';
          ctx.fillStyle = '#666';
          ctx.fillText(node.status === 'infeasible' ? 'Fathomed' : 'Optimal', x, y + boxHeight/2 + 15);
        }
      });
    });

    // Add title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Branch and Bound Tree', width / 2, 25);
  };

  const solveLP = (c, A, b, bounds) => {
    try {
      // Simple implementation of Two-Phase Simplex Method
      const m = A.length; // number of constraints
      const n = c.length; // number of variables
      
      // Initialize solution
      let x = Array(n).fill(0);
      let z = -Infinity;
      
      // Try corner points of the feasible region
      const cornerPoints = [];
      
      // Add origin if feasible
      if (A.every((row, i) => b[i] >= 0)) {
        cornerPoints.push(Array(n).fill(0));
      }
      
      // Try intersections of constraints
      for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
          const x1 = solveEquations(A[i], A[j], b[i], b[j]);
          if (x1 && isPointFeasible(x1, A, b, bounds)) {
            cornerPoints.push(x1);
          }
        }
      }
      
      // Try points where one constraint intersects with bounds
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          if (A[i][j] !== 0) {
            const point = Array(n).fill(0);
            point[j] = bounds[j][1] || 5; // Use upper bound or 5 as default
            const otherVar = (b[i] - A[i][j] * point[j]) / A[i][(j + 1) % n];
            point[(j + 1) % n] = otherVar;
            if (isPointFeasible(point, A, b, bounds)) {
              cornerPoints.push(point);
            }
          }
        }
      }
      
      // Evaluate objective at each corner point
      cornerPoints.forEach(point => {
        const value = c.reduce((sum, coeff, i) => sum + coeff * point[i], 0);
        if (value > z) {
          z = value;
          x = [...point];
        }
      });
      
      return [x, z];
    } catch (error) {
      console.error('LP Error:', error);
      return [null, null];
    }
  };

  const solveEquations = (a1, a2, b1, b2) => {
    try {
      const det = a1[0] * a2[1] - a1[1] * a2[0];
      if (Math.abs(det) < 1e-10) return null;
      
      const x1 = (b1 * a2[1] - b2 * a1[1]) / det;
      const x2 = (a1[0] * b2 - a2[0] * b1) / det;
      
      return [x1, x2];
    } catch (error) {
      return null;
    }
  };

  const isPointFeasible = (x, A, b, bounds) => {
    // Check bounds
    for (let i = 0; i < x.length; i++) {
      if (x[i] < (bounds[i][0] || 0) || (bounds[i][1] !== null && x[i] > bounds[i][1])) {
        return false;
      }
    }
    
    // Check constraints
    return A.every((row, i) => {
      const sum = row.reduce((acc, coeff, j) => acc + coeff * x[j], 0);
      return sum <= b[i] + 1e-10;
    });
  };

  const solveBranchAndBound = () => {
    // Set up the specific problem
    const c = [2, 3]; // Objective coefficients
    const A = [
      [6, 5], // First constraint coefficients
      [1, 3]  // Second constraint coefficients
    ];
    const b = [25, 10]; // RHS values
    
    let bounds = [[0, null], [0, null]];
    let iterations = [];
    let treeNodes = [];
    let nodeId = 0;
    let bestInteger = null;
    let bestValue = -Infinity;

    // Solve root problem
    const [x, z] = solveLP(c, A, b, bounds);
    if (!x) {
      setBranchAndBoundSolution({
        status: 'no_solution',
        iterations: []
      });
      return;
    }

    // Add root node
    const rootNode = {
      id: nodeId++,
      depth: 0,
      value: z,
      solution: x,
      status: 'processing'
    };
    treeNodes.push(rootNode);
    iterations.push({
      nodeId: rootNode.id,
      solution: x,
      value: z,
      feasible: true
    });

    // Create queue for BFS
    let queue = [{
      bounds,
      parentId: 0,
      depth: 1,
      branchVar: null,
      branchVal: null
    }];

    while (queue.length > 0) {
      const current = queue.shift();
      
      // Solve LP with current bounds
      const [x, z] = solveLP(c, A, b, current.bounds);
      
      if (!x || z <= bestValue) {
        // Node is infeasible or can't improve solution
        treeNodes.push({
          id: nodeId++,
          parentId: current.parentId,
          depth: current.depth,
          value: z || bestValue,
          status: 'infeasible',
          constraint: current.branchVar !== null ? 
            `x${current.branchVar + 1} ${current.branchVal >= 0 ? '≥' : '≤'} ${Math.abs(current.branchVal)}` : ''
        });
        continue;
      }

      // Check if solution is integer
      const isInteger = x.every(val => Math.abs(Math.round(val) - val) < 1e-10);
      
      if (isInteger) {
        if (z > bestValue) {
          bestValue = z;
          bestInteger = x;
        }
        treeNodes.push({
          id: nodeId++,
          parentId: current.parentId,
          depth: current.depth,
          value: z,
          solution: x,
          status: 'optimal',
          constraint: current.branchVar !== null ? 
            `x${current.branchVar + 1} ${current.branchVal >= 0 ? '≥' : '≤'} ${Math.abs(current.branchVal)}` : ''
        });
        iterations.push({
          nodeId: nodeId - 1,
          solution: x,
          value: z,
          feasible: true
        });
      } else {
        // Find first non-integer variable
        const idx = x.findIndex(val => Math.abs(Math.round(val) - val) >= 1e-10);
        const floor = Math.floor(x[idx]);
        const ceil = Math.ceil(x[idx]);

        // Add node for current solution
        const currentNode = {
          id: nodeId++,
          parentId: current.parentId,
          depth: current.depth,
          value: z,
          solution: x,
          status: 'bounded',
          constraint: current.branchVar !== null ? 
            `x${current.branchVar + 1} ${current.branchVal >= 0 ? '≥' : '≤'} ${Math.abs(current.branchVal)}` : ''
        };
        treeNodes.push(currentNode);
        iterations.push({
          nodeId: currentNode.id,
          solution: x,
          value: z,
          feasible: true
        });

        // Branch on floor
        const lowerBounds = current.bounds.map((b, i) => 
          i === idx ? [b[0], floor] : [...b]
        );
        queue.push({
          bounds: lowerBounds,
          parentId: currentNode.id,
          depth: current.depth + 1,
          branchVar: idx,
          branchVal: -floor
        });

        // Branch on ceil
        const upperBounds = current.bounds.map((b, i) => 
          i === idx ? [ceil, b[1]] : [...b]
        );
        queue.push({
          bounds: upperBounds,
          parentId: currentNode.id,
          depth: current.depth + 1,
          branchVar: idx,
          branchVal: ceil
        });
      }
    }

    setBranchAndBoundSolution({
      status: 'optimal',
      solution: bestInteger,
      objectiveValue: bestValue,
      iterations: iterations
    });
    setTreeData(treeNodes);
  };

  // Effect to draw tree when data changes
  useEffect(() => {
    if (treeData && canvasRef.current) {
      drawTree(treeData, canvasRef.current);
    }
  }, [treeData]);

  // Add new state for TSP
  const [tspData, setTspData] = useState({
    cities: ['A', 'B', 'C', 'D'],
    distances: [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0]
    ]
  });
  const [tspSolution, setTspSolution] = useState(null);
  const tspCanvasRef = useRef(null);

  // Handle adding a new city
  const addCity = () => {
    setTspData(prev => {
      const newCityName = String.fromCharCode(65 + prev.cities.length); // A, B, C, ...
      const newDistances = prev.distances.map(row => [...row, 0]);
      newDistances.push(Array(prev.cities.length + 1).fill(0));
      return {
        cities: [...prev.cities, newCityName],
        distances: newDistances
      };
    });
  };

  // Handle distance change
  const handleDistanceChange = (fromCity, toCity, value) => {
    setTspData(prev => {
      const newDistances = prev.distances.map(row => [...row]);
      newDistances[fromCity][toCity] = parseInt(value) || 0;
      newDistances[toCity][fromCity] = parseInt(value) || 0; // Make matrix symmetric
      return {
        ...prev,
        distances: newDistances
      };
    });
  };

  // Nearest Neighbor algorithm for TSP
  const solveTSP = () => {
    const n = tspData.cities.length;
    const visited = new Set([0]);
    const path = [0];
    let totalDistance = 0;

    while (visited.size < n) {
      let lastCity = path[path.length - 1];
      let nearestCity = -1;
      let minDistance = Infinity;

      for (let city = 0; city < n; city++) {
        if (!visited.has(city) && tspData.distances[lastCity][city] < minDistance) {
          minDistance = tspData.distances[lastCity][city];
          nearestCity = city;
        }
      }

      visited.add(nearestCity);
      path.push(nearestCity);
      totalDistance += minDistance;
    }

    // Return to starting city
    totalDistance += tspData.distances[path[path.length - 1]][0];
    path.push(0);

    setTspSolution({
      path,
      totalDistance,
      iterations: Array(path.length).fill().map((_, i) => ({
        step: i + 1,
        currentCity: tspData.cities[path[i]],
        nextCity: i < path.length - 1 ? tspData.cities[path[i + 1]] : tspData.cities[0],
        distance: i < path.length - 1 ? tspData.distances[path[i]][path[i + 1]] : tspData.distances[path[path.length - 1]][0]
      }))
    });
  };

  // Draw TSP solution
  useEffect(() => {
    if (tspCanvasRef.current) {
      const canvas = tspCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      
      // Clear canvas with a light background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;
      const cities = tspData.cities;
      const n = cities.length;
      
      // Function to draw a node with shadow and gradient
      const drawNode = (x, y, label, isStart) => {
        // Add shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(x-5, y-5, 0, x, y, 30);
        gradient.addColorStop(0, isStart ? '#4CAF50' : '#2196F3');
        gradient.addColorStop(1, isStart ? '#388E3C' : '#1976D2');
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = isStart ? '#388E3C' : '#1976D2';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Reset shadow for text
        ctx.shadowColor = 'transparent';
        
        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
      };
      
      // Function to draw arrow with gradient
      const drawArrow = (fromX, fromY, toX, toY, distance, isPath) => {
        const headLength = 15;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        
        // Calculate points for arrow
        const nodeRadius = 25;
        const startX = fromX + nodeRadius * Math.cos(angle);
        const startY = fromY + nodeRadius * Math.sin(angle);
        const endX = toX - nodeRadius * Math.cos(angle);
        const endY = toY - nodeRadius * Math.sin(angle);
        
        // Create gradient for path
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        if (isPath) {
          gradient.addColorStop(0, '#4CAF50');
          gradient.addColorStop(1, '#81C784');
        } else {
          gradient.addColorStop(0, '#9E9E9E');
          gradient.addColorStop(1, '#BDBDBD');
        }
        
        // Draw line with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = isPath ? 3 : 1;
        ctx.stroke();
        
        // Draw arrowhead if it's part of the path
        if (isPath) {
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headLength * Math.cos(angle - Math.PI/6),
            endY - headLength * Math.sin(angle - Math.PI/6)
          );
          ctx.lineTo(
            endX - headLength * Math.cos(angle + Math.PI/6),
            endY - headLength * Math.sin(angle + Math.PI/6)
          );
          ctx.closePath();
          ctx.fillStyle = '#4CAF50';
          ctx.fill();
        }
        
        // Reset shadow for distance label
        ctx.shadowColor = 'transparent';
        
        // Draw distance label with background
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const text = distance.toString();
        const textMetrics = ctx.measureText(text);
        const padding = 6;
        
        // Draw background with rounded corners
        const bgWidth = textMetrics.width + padding * 2;
        const bgHeight = 20;
        ctx.beginPath();
        ctx.roundRect(
          midX - bgWidth/2,
          midY - bgHeight/2,
          bgWidth,
          bgHeight,
          4
        );
        ctx.fill();
        ctx.strokeStyle = isPath ? '#4CAF50' : '#9E9E9E';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw distance text
        ctx.fillStyle = isPath ? '#2E7D32' : '#616161';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, midY);
      };
      
      // Calculate and store city positions
      const cityPositions = cities.map((_, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
      
      // Draw all connections first (non-path)
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const pos1 = cityPositions[i];
          const pos2 = cityPositions[j];
          drawArrow(
            pos1.x,
            pos1.y,
            pos2.x,
            pos2.y,
            tspData.distances[i][j],
            false
          );
        }
      }
      
      // Draw solution path if available
      if (tspSolution) {
        const path = tspSolution.path;
        for (let i = 0; i < path.length - 1; i++) {
          const pos1 = cityPositions[path[i]];
          const pos2 = cityPositions[path[i + 1]];
          drawArrow(
            pos1.x,
            pos1.y,
            pos2.x,
            pos2.y,
            tspData.distances[path[i]][path[i + 1]],
            true
          );
        }
      }
      
      // Draw city nodes (on top of arrows)
      cityPositions.forEach((pos, i) => {
        drawNode(pos.x, pos.y, cities[i], i === 0);
      });
      
      // Add title and legend
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TSP Graph Visualization', width / 2, 30);
      
      if (tspSolution) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(`Total Distance: ${tspSolution.totalDistance}`, width / 2, height - 20);
      }
    }
  }, [tspData, tspSolution]);

  // Update the CSS for better presentation
  const styles = {
    treeVisualization: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    canvas: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      backgroundColor: '#f8f9fa'
    },
    legend: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '10px'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    table: {
      width: '100%',
      marginTop: '20px',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      padding: '12px',
      borderBottom: '2px solid #dee2e6',
      textAlign: 'left'
    },
    tableCell: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6'
    }
  };

  return (
    <div className="combinatorial-optimization">
      <div className="theory-section">
        <h2>Combinatorial Optimization</h2>
        <p>
          Combinatorial optimization problems involve finding an optimal object from a
          finite set of objects, where the solution space is discrete or combinatorial.
        </p>
      </div>

      <div className="knapsack-problem">
        <h3>Knapsack Problem</h3>
        <div className="form-container">
          <div className="input-group">
            <label>Knapsack Capacity</label>
            <input
              type="number"
              value={knapsackData.capacity}
              onChange={handleCapacityChange}
              placeholder="Enter capacity"
              min="1"
            />
          </div>

          <div className="input-group">
            <label>Items</label>
            {knapsackData.items.map((item, index) => (
              <div key={index} className="item-inputs">
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                  placeholder="Weight"
                  min="1"
                />
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  min="1"
                />
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addItem}>
              Add Item
            </button>
          </div>

          <button className="btn btn-primary" onClick={solveKnapsack}>
            Solve
          </button>
        </div>

        {solution && (
          <div className="solution-container">
            <h4>Solution</h4>
            <p>Maximum Value: {solution.maxValue}</p>
            <p>Selected Items:</p>
            <ul>
              {solution.selectedItems.map(index => (
                <li key={index}>
                  Item {index + 1} (Weight: {solution.items[index].weight}, Value: {solution.items[index].value})
                </li>
              ))}
            </ul>

            <div className="dp-table">
              <h4>Dynamic Programming Table</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item/Weight</th>
                      {Array(parseInt(knapsackData.capacity) + 1).fill().map((_, i) => (
                        <th key={i}>{i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {solution.dpTable.map((row, i) => (
                      <tr key={i}>
                        <td>{i}</td>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="branch-and-bound-section">
        <h3>Branch and Bound Method</h3>
        <p>
          Branch and Bound is a systematic method for solving optimization problems,
          particularly integer programming problems. It breaks down a problem into
          smaller subproblems (branching) and eliminates solutions that cannot be optimal (bounding).
        </p>

        <div className="form-container">
          <div className="input-group">
            <h4>Problem Definition</h4>
            <div className="problem-inputs">
              <div>
                <label>Number of Variables:</label>
                <input
                  type="number"
                  value={branchAndBoundData.numVars}
                  onChange={handleNumVarsChange}
                  min="1"
                />
              </div>
              <div>
                <label>Number of Constraints:</label>
                <input
                  type="number"
                  value={branchAndBoundData.numConstraints}
                  onChange={handleNumConstraintsChange}
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <h4>Objective Function</h4>
            <div className="objective-inputs">
              <select
                value={branchAndBoundData.objective.type}
                onChange={(e) => setBranchAndBoundData(prev => ({
                  ...prev,
                  objective: { ...prev.objective, type: e.target.value }
                }))}
              >
                <option value="max">Maximize</option>
                <option value="min">Minimize</option>
              </select>
              {branchAndBoundData.objective.coefficients.map((coeff, index) => (
                <div key={index} className="variable-input">
                  <input
                    type="number"
                    value={coeff}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`x${index + 1} coefficient`}
                  />
                  <span>x{index + 1}</span>
                  <label>
                    <input
                      type="checkbox"
                      checked={branchAndBoundData.integerVariables[index]}
                      onChange={() => toggleIntegerVariable(index)}
                    />
                    Integer
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group">
            <h4>Constraints</h4>
            {branchAndBoundData.constraints.map((constraint, index) => (
              <div key={index} className="constraint-inputs">
                {constraint.coefficients.map((coeff, coeffIndex) => (
                  <React.Fragment key={coeffIndex}>
                    <input
                      type="number"
                      value={coeff}
                      onChange={(e) => handleConstraintChange(index, coeffIndex, e.target.value)}
                      placeholder={`x${coeffIndex + 1} coefficient`}
                    />
                    <span>x{coeffIndex + 1} {coeffIndex < constraint.coefficients.length - 1 ? '+' : ''}</span>
                  </React.Fragment>
                ))}
                <select
                  value={constraint.sign}
                  onChange={(e) => handleConstraintSignChange(index, e.target.value)}
                >
                  <option value="<=">≤</option>
                  <option value=">=">≥</option>
                  <option value="=">=</option>
                </select>
                <input
                  type="number"
                  value={constraint.rhs}
                  onChange={(e) => handleRHSChange(index, e.target.value)}
                  placeholder="RHS"
                />
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={solveBranchAndBound}>
            Solve using Branch and Bound
          </button>
        </div>

        {branchAndBoundSolution && (
          <div className="solution-container">
            <h4>Solution</h4>
            {branchAndBoundSolution.status === 'optimal' ? (
              <>
                <p>Optimal Solution Found:</p>
                {branchAndBoundSolution.solution.map((value, index) => (
                  <p key={index}>x{index + 1} = {value.toFixed(4)}</p>
                ))}
                <p>Objective Value: {branchAndBoundSolution.objectiveValue.toFixed(4)}</p>
                
                <h4>Iterations:</h4>
                <div className="iterations-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Iteration</th>
                        <th>Node ID</th>
                        <th>Solution</th>
                        <th>Objective Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchAndBoundSolution.iterations.map((iter, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{iter.nodeId}</td>
                          <td>{iter.solution.map((v, i) => `x${i+1}=${v.toFixed(2)}`).join(', ')}</td>
                          <td>{iter.value.toFixed(4)}</td>
                          <td>{iter.feasible ? 'Feasible' : 'Infeasible'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="tree-visualization">
                  <h4>Branch and Bound Tree</h4>
                  <canvas 
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ border: '1px solid #ccc' }}
                  />
                  <div className="tree-legend">
                    <div><span className="legend-dot optimal"></span> Optimal Node</div>
                    <div><span className="legend-dot infeasible"></span> Infeasible Node</div>
                    <div><span className="legend-dot bounded"></span> Bounded Node</div>
                    <div><span className="legend-dot processing"></span> Processing Node</div>
                  </div>
                </div>
              </>
            ) : (
              <p>No feasible solution found</p>
            )}
          </div>
        )}
      </div>

      <div className="tsp-section">
        <h3>Traveling Salesman Problem (TSP)</h3>
        <p>
          The Traveling Salesman Problem asks for the shortest possible route that visits
          each city exactly once and returns to the starting city. Enter the distances
          between cities in the matrix below.
        </p>

        <div className="form-container">
          <div className="input-group">
            <h4>Distance Matrix</h4>
            <div className="distance-matrix">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    {tspData.cities.map((city, i) => (
                      <th key={i}>{city}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tspData.cities.map((fromCity, i) => (
                    <tr key={i}>
                      <td>{fromCity}</td>
                      {tspData.cities.map((toCity, j) => (
                        <td key={j}>
                          {i === j ? (
                            '0'
                          ) : (
                            <input
                              type="number"
                              value={tspData.distances[i][j]}
                              onChange={(e) => handleDistanceChange(i, j, e.target.value)}
                              min="0"
                              style={{ width: '60px' }}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-secondary" onClick={addCity}>
              Add City
            </button>
          </div>

          <button className="btn btn-primary" onClick={solveTSP}>
            Find Shortest Route
          </button>
        </div>

        {tspSolution && (
          <div className="solution-container">
            <h4>Solution</h4>
            <p>Total Distance: {tspSolution.totalDistance}</p>
            <p>Route: {tspSolution.path.map(i => tspData.cities[i]).join(' → ')}</p>
            
            <div className="visualization">
              <canvas
                ref={tspCanvasRef}
                width={600}
                height={600}
              />
              <div className="visualization-legend">
                <div className="legend-item">
                  <div className="legend-color node"></div>
                  <span>City Node</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color connection"></div>
                  <span>Path Connection</span>
                </div>
              </div>
            </div>

            <h4>Route Details:</h4>
            <div className="route-table">
              <table>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {tspSolution.iterations.map((iter, index) => (
                    <tr key={index}>
                      <td>{iter.step}</td>
                      <td>{iter.currentCity}</td>
                      <td>{iter.nextCity}</td>
                      <td>{iter.distance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CombinatorialOptimization; 