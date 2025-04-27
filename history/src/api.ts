/**
 * Fetches the questions for a given user.
 *
 * @param {string} name - The user's name
 * @returns {Promise<string[]>} - A promise that resolves to an array of questions
 */
export async function fetchQuestions(name: string): Promise<string[]> {
  try {
    const url = new URL('http://localhost:8080/get-questions');
    url.searchParams.append('name', name);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Origin: window.location.origin,
      },
      credentials: 'include',
      mode: 'no-cors', // This will prevent CORS errors but won't allow you to access the response data.
    });

    if (!response.ok) {
      if (response.status === 0) {
        throw new Error('Network error: Please check if the server is running and CORS is enabled');
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        "Unable to connect to the server. Please check if it's running and CORS is enabled."
      );
    }
    console.error('Error fetching questions:', error);
    throw error;
  }
}
