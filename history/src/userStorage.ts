const USER_NAME_KEY = 'code_explainer_user_name'

/**
 * Saves the user name to local storage.
 * 
 * @param {string} name - The user name to save
 */
export function saveUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name)
}

/**
 * Gets the user name from local storage.
 * 
 * @returns {string|null} - The user name or null if not found
 */
export function getUserName(): string | null {
  return localStorage.getItem(USER_NAME_KEY)
}

/**
 * Clears the user name from local storage.
 */
export function clearUserName(): void {
  localStorage.removeItem(USER_NAME_KEY)
}