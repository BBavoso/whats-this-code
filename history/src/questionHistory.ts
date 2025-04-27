/**
 * Renders the question history in the provided container element.
 *
 * @param {HTMLElement} container - The container element
 * @param {string[]} questions - Array of questions to render
 */
export function renderQuestionHistory(
    container: HTMLElement,
    questions: string[]
): void {
    if (!questions.length) {
        renderEmptyState(container);
        return;
    }

    const questionsList = document.createElement("ul");
    questionsList.className = "question-list";

    questions.forEach((question, index) => {
        const questionItem = createQuestionItem(question, index);
        questionsList.appendChild(questionItem);
    });

    container.innerHTML = "";
    container.appendChild(questionsList);
}

/**
 * Creates a question item element.
 *
 * @param {string} question - The question text
 * @param {number} index - The question index
 * @returns {HTMLLIElement} - The question item element
 */
function createQuestionItem(question: string, index: number): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "question-item";
    li.style.animationDelay = `${index * 0.05}s`;

    // Generate a random date within the last 30 days
    const randomDate = getRandomRecentDate(30);
    const formattedDate = formatDate(randomDate);

    li.innerHTML = `
    <p class="question-text">${question}</p>
    <div class="question-meta">
      <span class="question-date">${formattedDate}</span>
      <button class="copy-button" data-question="${question}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Copy
      </button>
    </div>
  `;

    // Add event listener to copy button
    const copyButton = li.querySelector(".copy-button") as HTMLButtonElement;
    copyButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const questionText = copyButton.dataset.question;
        if (questionText) {
            copyToClipboard(questionText);
            showCopySuccess(copyButton);
        }
    });

    return li;
}

/**
 * Renders an empty state when there are no questions.
 *
 * @param {HTMLElement} container - The container element
 */
function renderEmptyState(container: HTMLElement): void {
    container.innerHTML = `
    <div class="empty-state">
      <h3 class="empty-state-title">No questions yet</h3>
      <p class="empty-state-message">
        Questions asked through the Code Explainer extension will appear here.
        Start using the extension to see your question history.
      </p>
    </div>
  `;
}

/**
 * Copies the given text to clipboard.
 *
 * @param {string} text - The text to copy
 */
function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch((err) => {
        console.error("Failed to copy text:", err);
    });
}

/**
 * Shows a success message after copying.
 *
 * @param {HTMLButtonElement} button - The copy button
 */
function showCopySuccess(button: HTMLButtonElement): void {
    const originalText = button.innerHTML;
    button.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12L10 17L20 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Copied!
  `;
    button.style.color = "var(--color-success-500)";

    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.color = "";
    }, 2000);
}

/**
 * Generates a random date within the specified number of days from now.
 *
 * @param {number} days - Number of days in the past
 * @returns {Date} - A random date
 */
function getRandomRecentDate(days: number): Date {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const randomTime =
        pastDate.getTime() +
        Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTime);
}

/**
 * Formats a date in a human-readable format.
 *
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date string
 */
function formatDate(date: Date): string {
    const now = new Date();
    const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
        return "Today";
    } else if (diffInDays === 1) {
        return "Yesterday";
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }
}
