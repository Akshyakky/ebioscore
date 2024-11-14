# eBios Core HMIS

## Overview

eBios Core HMIS is a comprehensive Hospital Management Information System built with React TypeScript and .NET Core. The system provides end-to-end solutions for hospital operations including patient management, billing, clinical services, and reporting.

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

- React 18.3.1
- TypeScript
- Material-UI (MUI) v6
- Redux for State Management
- React Router v6
- Axios for API Communication
- Various UI Components:
  - DevExtreme
  - MUI Data Grid
  - Date-FNS
  - React-PDF
  - SweetAlert2

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
cd ebios-core
```

2. Install frontend dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env` file in the root directory and add necessary configuration:

```env
VITE_API_BASE_URL=your_api_url
VITE_API_TIMEOUT=30000
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Starts development server
- `npm run build` - Creates production build
- `npm run serve` - Serves production build locally
- `npm test` - Runs test suite

## Project Structure

```
ebios-core/
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
└── package.json         # Project dependencies
```

## Key Features Implementation

### Generic Architecture

The system implements a generic architecture pattern for standardized CRUD operations:

```typescript
// Generic Service Example
interface IGenericService<T> {
  getAll(): Promise<T[]>;
  getById(id: number): Promise<T>;
  save(entity: T): Promise<T>;
  update(id: number, entity: T): Promise<T>;
  delete(id: number): Promise<void>;
}
```

### Form Management

Uses custom form components with validation:

```typescript
<FormField
  type="text"
  label="Patient Name"
  value={patientName}
  onChange={handleChange}
  isMandatory
  errorMessage={errors.patientName}
/>
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Support

For support, email support@ebios.com or raise an issue in the repository.

## Acknowledgments

- Material-UI Team
- React Team
- DevExtreme Team
- All contributors who have helped shape eBios Core HMIS

## Security

Please report any security vulnerabilities to security@ebios.com

---

For more detailed documentation about specific modules and features, please refer to the `/docs` directory in the repository.
