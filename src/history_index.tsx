import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

// History page component
const History = () => {
  // State for storing user input, data, and loading state
  const [name, setName] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle form submission (GET request to fetch user history)
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page refresh
  
    if (name.trim() === '') {
      alert('Name is required!');
      return;
    }
  
    setLoading(true); // Set loading state
  
    try {
      const response = await fetch(`http://localhost:8080/get-questions/?name=${name}`, {
        method: 'GET',
      });
  
      const result = await response.json();
      console.log(result);
  
      if (response.ok) {
        // In your Go server, you return "questions", which is likely an array already
        // But just in case it's not an array, make sure to handle it
        setData(Array.isArray(result) ? result : []);
      } else {
        console.error('Failed to fetch data:', result);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  
  

  // If data is still loading, display loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Request History</h1>
      <p>Enter your name to view your prompts:</p>

      {/* Form to search history by name */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{ padding: '10px', fontSize: '16px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px' }}>
          Search History
        </button>
      </form>

      {/* List of requests */}
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {data.length > 0 ? (
          data.map((item) => (
            <li key={item.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h3>Question:</h3>
              <p>{item}</p>
            </li>
          ))
        ) : (
          <p>No history found for this user.</p>
        )}
      </ul>
    </div>
  );
};

// Select the root element
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<History />);
} else {
  console.error("Root element not found");
}
