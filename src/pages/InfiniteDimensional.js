import React from 'react';
import './InfiniteDimensional.css';

function InfiniteDimensional() {
  const topics = [
    {
      title: 'Metaheuristics',
      content: `Metaheuristics are high-level problem-independent algorithmic frameworks
        that provide a set of guidelines to develop heuristic optimization algorithms.
        They are particularly useful for solving complex optimization problems where
        traditional methods may fail or be impractical.`,
      features: [
        'Problem independence',
        'Ability to escape local optima',
        'No need for gradient information',
        'Applicable to black-box optimization'
      ]
    },
    {
      title: 'Genetic Algorithm',
      content: `Genetic Algorithms (GA) are search heuristics inspired by Charles Darwin's
        theory of natural evolution. They reflect the process of natural selection where
        the fittest individuals are selected for reproduction to produce offspring of
        the next generation.`,
      steps: [
        'Initial Population Generation',
        'Fitness Evaluation',
        'Selection',
        'Crossover',
        'Mutation',
        'Termination'
      ]
    },
    {
      title: 'Ant Colony Optimization',
      content: `Ant Colony Optimization (ACO) is inspired by the foraging behavior of ant
        colonies. Ants deposit pheromones while walking, forming paths that other ants
        are likely to follow. Shorter paths accumulate more pheromone, eventually leading
        to the discovery of optimal routes.`,
      components: [
        'Pheromone trails',
        'Heuristic information',
        'Probabilistic state transition',
        'Pheromone update rules'
      ]
    },
    {
      title: 'Particle Swarm Optimization',
      content: `Particle Swarm Optimization (PSO) is inspired by the social behavior of
        bird flocking or fish schooling. Each particle in the swarm represents a potential
        solution and moves through the search space based on its own experience and the
        experience of neighboring particles.`,
      characteristics: [
        'Population-based search',
        'Velocity and position updates',
        'Social and cognitive components',
        'Global and local best solutions'
      ]
    },
    {
      title: 'Simulated Annealing',
      content: `Simulated Annealing (SA) is inspired by the annealing process in metallurgy.
        It starts with a high "temperature" allowing many worse solutions to be accepted,
        and gradually "cools down" becoming more selective in accepting worse solutions.
        This helps escape local optima.`,
      phases: [
        'Initial temperature setting',
        'Solution neighborhood exploration',
        'Acceptance probability calculation',
        'Temperature reduction',
        'Termination criteria'
      ]
    }
  ];

  return (
    <div className="infinite-dimensional">
      <div className="theory-section">
        <h2>Infinite Dimensional Optimization</h2>
        <p>
          Infinite Dimensional Optimization deals with optimization problems where
          the search space has infinite dimensions. These problems often arise in
          functional analysis, optimal control theory, and machine learning. Due to
          their complexity, they are typically solved using metaheuristic methods.
        </p>
      </div>

      <div className="topics-container">
        {topics.map((topic, index) => (
          <div key={index} className="topic-card">
            <h3>{topic.title}</h3>
            <div className="content">
              <p>{topic.content}</p>
            </div>
            
            {topic.features && (
              <div className="features">
                <h4>Key Features:</h4>
                <ul>
                  {topic.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {topic.steps && (
              <div className="steps">
                <h4>Algorithm Steps:</h4>
                <ol>
                  {topic.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {topic.components && (
              <div className="components">
                <h4>Key Components:</h4>
                <ul>
                  {topic.components.map((component, i) => (
                    <li key={i}>{component}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {topic.characteristics && (
              <div className="characteristics">
                <h4>Characteristics:</h4>
                <ul>
                  {topic.characteristics.map((char, i) => (
                    <li key={i}>{char}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {topic.phases && (
              <div className="phases">
                <h4>Algorithm Phases:</h4>
                <ol>
                  {topic.phases.map((phase, i) => (
                    <li key={i}>{phase}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="theory-section">
        <h3>Applications</h3>
        <div className="applications-grid">
          <div className="application-item">
            <h4>Continuous Optimization</h4>
            <p>
              Problems involving continuous functions and infinite-dimensional
              function spaces, such as optimal control and variational problems.
            </p>
          </div>
          <div className="application-item">
            <h4>Machine Learning</h4>
            <p>
              Training of deep neural networks and other complex models with
              large parameter spaces and non-convex optimization landscapes.
            </p>
          </div>
          <div className="application-item">
            <h4>Engineering Design</h4>
            <p>
              Optimization of complex systems with many variables and constraints,
              such as aerospace design and structural optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfiniteDimensional; 