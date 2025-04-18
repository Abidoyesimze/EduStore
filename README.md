OpenEdStore Decentralised Educational Storage Platform

A decentralised application (dApp) that enables secure, scalable, and cost-effective storage of educational content, such as research papers, course materials, and administrative records—leveraging Filecoin's decentralised storage network, IPFS for content addressing, and FVM-based smart contracts for automated storage deal management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Smart Contracts](#smart-contracts)
- [UI/UX Design](#uiux-design)
- [Contributing](#contributing)
- [License](#license)

## Overview

Educational institutions often face challenges with traditional storage systems, including scalability issues, high costs, and data security concerns. OpenEdStore addresses these challenges by:

- Utilising IPFS for decentralised file storage and content addressing.
- Employing Filecoin's network for incentivised, verifiable storage.
- Implementing FVM-based smart contracts to automate storage deal management, verification, and renewals.
- Providing a user-friendly interface for educators, students, and administrators to manage educational content seamlessly.

## Features

- **Decentralized Storage**: Store educational content across a distributed network, ensuring high availability and resilience.
- **Automated Deal Management**: Smart contracts handle storage deal initiation, verification, and renewal without manual intervention.
- **Storage Renewal Notifications**: Users receive timely notifications before their storage deals expire, allowing them to renew or sign a new deal.
- **Access Control**: Role-based permissions ensure that only authorized users can access or modify content.
- **User-Friendly Interface**: Intuitive dashboards for uploading, managing, and retrieving educational materials.
- **Cost Efficiency**: Leverage Filecoin's marketplace to optimize storage costs.

## Architecture

- **Frontend**: Built with React.js, providing responsive dashboards for different user roles.
- **Backend**: Node.js server handling API requests, user authentication, and off-chain metadata storage.
- **Smart Contracts**: Solidity contracts deployed on FVM to manage storage deals, access control, and verification processes.
- **Storage**: Files are uploaded to IPFS, with storage deals made on the Filecoin network to ensure persistence and reliability.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Yarn or npm
- Hardhat (for smart contract development)
- Metamask or any Web3-compatible wallet

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/educational-storage-platform.git
   cd educational-storage-platform
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the root directory and add the necessary configurations:

   ```env
   REACT_APP_IPFS_API_URL=your_ipfs_api_url
   REACT_APP_FILECOIN_API_URL=your_filecoin_api_url
   REACT_APP_CONTRACT_ADDRESS=your_smart_contract_address
   ```


4. **Start the development server**:

   ```bash
   yarn start
   # or
   npm start
   ```

## Usage

1. **Upload Files**: Users can upload educational materials through the dashboard. Files are added to IPFS, and a CID is generated.

2. **Initiate Storage Deal**: The platform automatically initiates a storage deal on the Filecoin network using the generated CID.

3. **Access Control**: Set permissions for each file to control who can view or edit the content.

4. **Monitor Storage Deals**: View the status of storage deals, including verification results and renewal schedules.

**LMS SDK**

OpenEdStore provides a Software Development Kit (SDK) to integrate decentralized storage functionality into Learning Management Systems (LMS).

**SDK Features:**

Easy file upload to IPFS and Filecoin from within an LMS

CID retrieval and access control integration

Notifications for storage deal expiration

Lightweight and easy-to-implement modules

Coming Soon:

SDK documentation and implementation examples

Plugins for Moodle, Canvas, and other popular LMS platforms

Upload Files: Users upload educational materials via the dashboard. Files are added to IPFS, generating a CID.

Initiate Storage Deal: The platform automatically initiates a storage deal on Filecoin using the CID.

Access Control: Set role-based file permissions.

Monitor Storage Deals: View deal status, verification results, and receive renewal alerts.

Extend/Sign New Deal: Upon notification, users can extend or initiate a new storage deal.


## Smart Contracts

OpenEdStore utilizes several smart contracts deployed on the Filecoin Virtual Machine (FVM):

- **StorageDealManager.sol**: Handles initiation, verification, and renewal of storage deals.
- **AccessControl.sol**: Manages user roles and permissions for accessing content.
- **Verification.sol**: Integrates with Filecoin's proof mechanisms to verify data integrity.

Contracts are written in Solidity and can be found in the `contracts/` directory. Deployment scripts and configurations are located in the `scripts/` and `hardhat.config.js` files, respectively.

## UI/UX Design

The user interface is designed with accessibility and ease of use in mind:

- **Dashboard**: Provides an overview of storage usage, active deals, and recent activity.
- **File Manager**: Allows users to upload, download, and manage files.
- **Access Settings**: Enable users to set permissions and share content securely.
- **Notifications**: Alerts users about storage deal statuses, upcoming renewals, and verification results.

## Screenshots

![image](https://github.com/user-attachments/assets/1df05a32-29e8-4179-9ea3-b59bd96e6b00)
![image](https://github.com/user-attachments/assets/3d105031-c082-48c6-9a7a-1b6b7ce1dab8)


## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.
2. **Create a new branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them:

   ```bash
   git commit -m "Add your message here"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a pull request** detailing your changes.

## License

This project is licensed under the [MIT License](LICENSE).

Authors & Acknowledgements
@Beautify – Project Lead

Contributors – @Abidoyesimze @oluwatomilola , @oluwasina97

Special thanks to Filecoin, IPFS, FVM, and the open-source community

For more information on building with Filecoin, IPFS, and FVM, consider exploring resources like the [FIL-Frame starter repository](https://github.com/FIL-Builders/fil-frame) and the [Filecoin Virtual Machine documentation](https://docs.filecoin.io/smart-contracts/fundamentals 
