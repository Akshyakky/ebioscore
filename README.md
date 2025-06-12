# eBios Core HMIS

## Overview

eBios Core HMIS is a comprehensive Hospital Management Information System built
with React TypeScript and Vite. The system provides end-to-end solutions for
hospital operations including patient management, billing, clinical services,
and reporting.

## Features

- **Patient Management**

  - Registration
  - Revisit Management
  - Admission & Discharge
  - Appointment Booking

- **Financial Management**

  - Chargesheet Generation
  - Bill Estimation
  - Billing
  - Statement of Accounts

- **Clinical Services**

  - Laboratory Information System
  - Radiology Entry
  - Ultrasound Management
  - Clinical Management System

- **Additional Features**
  - Counter Sales
  - Comprehensive Reporting
  - User Management
  - Role-based Access Control

## Technology Stack

### Frontend

- React 18.2.0
- TypeScript
- Material-UI (MUI) v7
- Redux Toolkit for State Management
- React Router v6
- React Query for Data Fetching
- React Hook Form with Zod Validation
- Axios for API Communication
- Recharts for Data Visualization
- React Toastify for Notifications

### Backend

- .NET Core with Generic Architecture
- Generic Controller
- Generic Service
- Generic Repository
- AutoMapper
- Fluent Validation
- Entity Framework Core

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- .NET Core SDK 6.0 or higher
- SQL Server

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd ebioscore
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables: Create a `.env` file in the root directory
   and add necessary configuration:

```env
VITE_API_BASE_URL=your_api_url
VITE_API_TIMEOUT=30000
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (default Vite port)

## Available Scripts

- `npm run dev` - Starts development server
- `npm run build` - Creates production build
- `npm run preview` - Serves production build locally
- `npm run type-check` - Runs TypeScript type checking
- `npm run lint` - Runs ESLint
- `npm run lint:fix` - Fixes ESLint issues
- `npm run format` - Formats code using Prettier
- `npm run test` - Runs test suite
- `npm run test:watch` - Runs test suite in watch mode
- `npm run test:coverage` - Generates test coverage report

## Project Structure

```
ebioscore/
├── src/
│   ├── components/         # Reusable UI components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── interfaces/        # TypeScript interfaces
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store/            # Redux store configuration
│   ├── utils/            # Utility functions
│   └── App.tsx           # Root component
├── public/               # Static assets
├── dist/                # Production build output
├── .vscode/            # VS Code configuration
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── eslint.config.js    # ESLint configuration
├── .prettierrc         # Prettier configuration
└── package.json        # Project dependencies
```

## Key Features Implementation

### State Management

The application uses Redux Toolkit for global state management and React Query
for server state management:

```typescript
// Redux store configuration
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    // your reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(/* your middleware */),
});

setupListeners(store.dispatch);
```

### Form Management

Uses React Hook Form with Zod validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  // your validation schema
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});
```

## Development Guidelines

1. **Code Style**

   - Follow the ESLint and Prettier configurations
   - Use TypeScript for type safety
   - Follow the project's component structure

2. **Git Workflow**

   - Create feature branches from `main`
   - Use meaningful commit messages
   - Create pull requests for code review

3. **Testing**
   - Write unit tests for components
   - Test critical user flows
   - Maintain good test coverage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for
details.

## Support

For support, email support@ebios.com or raise an issue in the repository.

## Acknowledgments

- Material-UI Team
- React Team
- All contributors who have helped shape eBios Core HMIS

## Security

Please report any security vulnerabilities to security@ebios.com

---

For more detailed documentation about specific modules and features, please
refer to the `/docs` directory in the repository.
