import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const topics = [
    {
      title: 'Linear Programming',
      description: 'Learn about Graphical Method, Simplex Method, Transportation Problems, and more.',
      path: '/linear-programming',
      color: '#3498db'
    },
    {
      title: 'Non-Linear Programming',
      description: 'Study Quadratic Programming, KKT Conditions, and various optimization methods.',
      path: '/non-linear-programming',
      color: '#2ecc71'
    },
    {
      title: 'Combinatorial Optimization',
      description: 'Explore Integer Programming, Branch & Bound, Knapsack Problem, and TSP.',
      path: '/combinatorial-optimization',
      color: '#e74c3c'
    },
    {
      title: 'Infinite Dimensional',
      description: 'Discover Metaheuristics, Genetic Algorithms, and other advanced optimization techniques.',
      path: '/infinite-dimensional',
      color: '#f39c12'
    }
  ];

  return (
    <div className="home">
      <div className="welcome-section">
        <h1>Welcome to OptiMath</h1>
        <p>Your platform for learning and solving mathematical programming problems</p>
      </div>

      <div className="topic-grid">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="topic-panel"
            style={{ borderTop: `4px solid ${topic.color}` }}
            onClick={() => navigate(topic.path)}
          >
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <button className="learn-more-btn" style={{ backgroundColor: topic.color }}>
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;