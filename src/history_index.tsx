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
    event.preventDefault(); // Prevent page refresh on form submit

    if (name.trim() === '') {
      alert('Name is required!');
      return;
    }

    setLoading(true); // Set loading state for GET request

    try {
      const response = await fetch(`http://localhost:8080/get-question?name=${name}`);
      const result = await response.json(); // Assuming the response is JSON

      if (response.ok) {
        setData(result); // Store fetched data
      } else {
        console.error('Failed to fetch data:', result);
        setData([]); // Clear data if request fails
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
      setData([]); // Clear data if there was an error
    } finally {
      setLoading(false); // Reset loading state
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
              <h3>Name:</h3>
              <p>{item.name}</p>
              <h3>Prompt:</h3>
              <p>{item.prompt}</p>
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
