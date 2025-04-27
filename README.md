# What's This Code?

[Demo Website](https://bbavoso.github.io/HackDartmouthDemoWebsite/)

What's This Code? is a browser extension that helps users understand and translate code snippets. It integrates with Google GenAI to provide explanations and translations for selected code, and also maintains a history of user queries.

## Features

- **Explain Code**: Get a simple explanation of selected code snippets.
- **Translate Code**: Translate code into different programming languages.
- **History**: View a history of your past queries.
- **Highlight Menu**: Quickly access features via a context menu when selecting text on a webpage.

## Installation

### Prerequisites

- Git
- Go
- Node/NPM

1. Clone the repository:
   ```bash
   git clone https://github.com/BBavoso/whats-this-code.git && cd whats-this-code
   ```
2. Install Dependencies

```bash
npm install
```

3. Build Extension

```bash
npm run build
```

4.

- Open your browser's extensions page.
- Enable "Developer mode."
- Click "Load unpacked" and select the dist folder.

### Backend

The backend is a Go server that stores user query history in MongoDB. To run the backend:

Set up a .env file with your MongoDB URI:

MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/test

make sure this file is in the backend/ directory.

Start the server:

```bash
cd backend && go run .
```

### History

History is accessed at [History Page](https://bbavoso.github.io/HackDartmouthHistoryPage/) for now
