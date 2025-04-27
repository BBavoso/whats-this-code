import { fetchQuestions } from './api'
import { renderQuestionHistory } from './questionHistory'
import { getUserName, saveUserName } from './userStorage'

export function initializeApp(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  // Create the app structure
  appElement.innerHTML = `
    <header>
      <div class="container header-content">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.75 20.25C14.58 20.25 18.5 16.33 18.5 11.5C18.5 6.67 14.58 2.75 9.75 2.75C4.92 2.75 1 6.67 1 11.5C1 16.33 4.92 20.25 9.75 20.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.5 7.5C11.54 6.54 10.25 6 8.86 6C7.47 6 6.18 6.54 5.22 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 21L18 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Code Explainer
        </div>
        <div class="controls">
          <div class="search-container">
            <input type="text" class="search-input" placeholder="Search questions..." id="search-input">
          </div>
          <div class="user-name" id="user-name-display">Guest</div>
        </div>
      </div>
    </header>
    
    <main>
      <div class="container">
        <div id="user-input-container" class="user-input-container">
          <h2 class="user-input-title">Enter your name to see your questions</h2>
          <form class="user-input-form" id="user-input-form">
            <input type="text" class="user-input" id="user-input" placeholder="Your name">
            <button type="submit" class="submit-button">Submit</button>
          </form>
        </div>
        
        <div id="questions-container" class="questions-container" style="display: none;">
          <div class="questions-header">
            <h2 class="questions-title">Your Question History</h2>
            <span class="questions-count" id="questions-count">0 questions</span>
          </div>
          
          <div id="questions-content"></div>
        </div>
      </div>
    </main>
    
    <footer>
      <div class="container footer-content">
        <div class="copyright">© ${new Date().getFullYear()} Code Explainer - All rights reserved</div>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
          <a href="#" class="footer-link">Support</a>
        </div>
      </div>
    </footer>
  `

  // Initialize user name form
  initUserNameForm()
  
  // Check if we already have a stored user name
  const storedUserName = getUserName()
  if (storedUserName) {
    hideUserInputForm()
    showQuestionHistory(storedUserName)
    updateUserNameDisplay(storedUserName)
  }
  
  // Initialize search functionality
  initSearch()
}

function initUserNameForm(): void {
  const form = document.getElementById('user-input-form') as HTMLFormElement
  const input = document.getElementById('user-input') as HTMLInputElement
  
  if (!form || !input) return
  
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = input.value.trim()
    
    if (name) {
      saveUserName(name)
      hideUserInputForm()
      showQuestionHistory(name)
      updateUserNameDisplay(name)
    }
  })
}

function hideUserInputForm(): void {
  const container = document.getElementById('user-input-container')
  if (container) {
    container.style.display = 'none'
  }
}

function showQuestionHistory(name: string): void {
  const container = document.getElementById('questions-container')
  const content = document.getElementById('questions-content')
  
  if (!container || !content) return
  
  container.style.display = 'block'
  content.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>'
  
  fetchQuestions(name)
    .then(questions => {
      renderQuestionHistory(content, questions)
      updateQuestionCount(questions.length)
    })
    .catch(error => {
      content.innerHTML = `
        <div class="error">
          <p>Sorry, we couldn't load your questions. Please try again later.</p>
          <p>${error.message}</p>
        </div>
      `
    })
}

function updateUserNameDisplay(name: string): void {
  const display = document.getElementById('user-name-display')
  if (display) {
    display.textContent = name
  }
}

function updateQuestionCount(count: number): void {
  const countElement = document.getElementById('questions-count')
  if (countElement) {
    countElement.textContent = `${count} question${count !== 1 ? 's' : ''}`
  }
}

function initSearch(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement
  
  if (!searchInput) return
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase()
    const questionItems = document.querySelectorAll('.question-item')
    
    questionItems.forEach(item => {
      const questionText = item.querySelector('.question-text')?.textContent?.toLowerCase() || ''
      
      if (questionText.includes(searchTerm)) {
        (item as HTMLElement).style.display = 'block'
      } else {
        (item as HTMLElement).style.display = 'none'
      }
    })
    
    // Update count of visible questions
    const visibleCount = Array.from(questionItems).filter(
      item => (item as HTMLElement).style.display !== 'none'
    ).length
    
    updateQuestionCount(visibleCount)
  })
}