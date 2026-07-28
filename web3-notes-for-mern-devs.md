# Web3 Notes for MERN Developers

> Goal: skim this in 20-30 min and recall everything. Written by mapping every Web3 concept to its MERN equivalent.

---

## 1. Mental Model: Web2 vs Web3

| Web2 (MERN) | Web3 |
|---|---|
| Express server | Smart Contract (deployed code with state) |
| MongoDB | Blockchain (state storage, but public & immutable) |
| REST API call | Transaction (tx) / Contract call |
| JWT / session auth | Wallet signature (private key signs messages) |
| `user._id` | Wallet address (`0x...`) |
| Backend holds money/logic | Smart contract holds funds/logic, trustlessly |
| `npm install ethers` | Your bridge between React and the chain |

**Core idea:** A blockchain is a global, shared, append-only database (ledger) maintained by many computers (nodes) instead of one server. Smart contracts are like backend functions, but the "server" is the entire network, the code is public, and execution costs money (gas).

---

## 2. Blockchain Fundamentals

### What is a blockchain?
- A chain of **blocks**, each containing a list of transactions + hash of the previous block (this is what makes it tamper-evident).
- No central server — thousands of **nodes** keep a copy and agree on the latest state via a **consensus algorithm**.

### Consensus mechanisms
- **Proof of Work (PoW)** — miners solve puzzles to add blocks (Bitcoin, old Ethereum). Secure but energy-heavy.
- **Proof of Stake (PoS)** — validators stake coins as collateral to propose/validate blocks (Ethereum since "The Merge" 2022). Cheaper, faster.

### Key properties
- **Decentralized** — no single point of control.
- **Immutable** — once confirmed, transactions can't be changed.
- **Transparent** — anyone can read all transactions (think: public Mongo collection everyone can query, no admin auth).
- **Trustless** — you don't need to trust a party, just the code/math.

### Layer 1 vs Layer 2
- **L1**: base chains — Ethereum, Bitcoin, Solana, Avalanche.
- **L2**: scaling solutions built on top of an L1 to make it cheaper/faster — Arbitrum, Optimism, Base, zkSync (all "rollups"). Think of L2 like a caching layer in front of your DB that periodically syncs back.

---

## 3. Wallets & Accounts (= your "auth system")

### Wallet = key pair, not a bank account
- **Private key** — secret, signs transactions. NEVER expose this (like a password you can never reset).
- **Public key → Address** — derived from private key, e.g. `0x71C7...`. This is your "user ID."
- **Seed phrase (mnemonic)** — 12/24 words that can regenerate all your keys. Losing it = losing access forever. No "forgot password."

### MetaMask (most common wallet)
- Browser extension that injects `window.ethereum` into the page.
- Frontend connects to it, asks user to "sign" things — no password ever sent to your server.
- This **replaces your login/JWT system**: user connects wallet = "logged in" as that address.

### Account types
- **EOA (Externally Owned Account)** — controlled by a private key (normal user wallet).
- **Contract Account** — controlled by code (a deployed smart contract), has no private key.

### "Sign-In With Ethereum" (SIWE) — Web3 auth pattern
1. Backend generates a unique nonce/message.
2. Frontend asks wallet to sign that message (`personal_sign`).
3. Backend verifies the signature matches the claimed address (using `ethers.verifyMessage`).
4. If valid → issue your normal JWT/session as usual.

This is the **standard replacement for password-based auth** in dApps — proves wallet ownership without ever needing a password.

---

## 4. Transactions & Gas

### What's a transaction (tx)?
Any state-changing action: sending ETH, calling a contract function, deploying a contract.

### Gas
- "Gas" = computational cost of executing a transaction, paid in the network's native token (ETH on Ethereum).
- **Gas price** (gwei) × **gas used** = transaction fee.
- Read-only calls (`view`/`pure` functions) are **free** — no state change, no gas, no tx needed.
- Write calls (`transfer`, `mint`, etc.) **cost gas** and need to be mined/confirmed.

### Transaction lifecycle
1. User signs tx in wallet → broadcast to network.
2. Sits in **mempool** (pending pool, like a job queue).
3. Validator/miner includes it in a block.
4. Block confirmed → tx is final (more confirmations = more certainty).

### Nonce
- Each account has a transaction counter (nonce) — prevents replay attacks and orders txs. Similar to an auto-increment ID but per-sender.

---

## 5. Smart Contracts (= your backend logic)

### What is a smart contract?
Code deployed to the blockchain at a fixed address. Once deployed, it's **immutable** (can't `git push` a fix — need upgrade patterns or redeploy).

### Solidity basics (most common language, Ethereum)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private value;          // like a DB field
    address public owner;            // stores deployer's address

    event ValueChanged(uint256 newValue); // like emitting a websocket event / log

    constructor() {
        owner = msg.sender;          // msg.sender = whoever called this (like req.user)
    }

    function setValue(uint256 _value) public {  // costs gas, changes state
        value = _value;
        emit ValueChanged(_value);
    }

    function getValue() public view returns (uint256) { // free, read-only
        return value;
    }
}
```

### Solidity ↔ JS concept mapping
| Solidity | JS/MERN equivalent |
|---|---|
| `mapping(address => uint)` | `{ [address]: number }` object / Mongo doc keyed by address |
| `msg.sender` | `req.user` |
| `msg.value` | amount of ETH sent with the call |
| `require(condition, "msg")` | `if (!cond) throw new Error("msg")` |
| `modifier onlyOwner` | Express middleware (auth check) |
| `event` + `emit` | logging / webhook / Pub-Sub event |
| `view`/`pure` function | GET endpoint (no DB write) |
| non-view function | POST/PUT endpoint (DB write, costs "gas") |
| `struct` | object/schema shape |
| `payable` | function that can receive ETH |

### Function visibility & state mutability
- Visibility: `public`, `private`, `internal`, `external`.
- Mutability: `view` (reads state), `pure` (touches no state at all), default (can modify state, costs gas).

### Important security keywords
- `require()` — validate inputs/conditions, reverts (rolls back) tx if false, refunds remaining gas.
- `revert()` / custom errors — explicit failure.
- `assert()` — for invariants that should never fail (bugs).

### Common standards (= reusable npm packages, but on-chain)
- **ERC-20** — fungible token standard (like a "Coin" — interchangeable units, e.g. USDC).
- **ERC-721** — NFT standard (unique, non-fungible tokens).
- **ERC-1155** — multi-token standard (fungible + non-fungible in one contract, e.g. gaming items).
- Most projects use **OpenZeppelin** contracts (`@openzeppelin/contracts`) — battle-tested, audited base implementations. **Always inherit from these rather than writing token logic from scratch.**

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
```

---

## 6. Development Toolchain (= your dev environment equivalents)

| Need | Web2 tool | Web3 tool |
|---|---|---|
| Local dev server | `nodemon` | Hardhat / Foundry local node |
| Testing | Jest/Mocha | Hardhat + Chai, or Foundry (Solidity tests) |
| Deployment | `vercel deploy` | Hardhat/Foundry deploy script → testnet/mainnet |
| Package manager | npm | npm (Hardhat) or Forge (Foundry) |
| Local blockchain | — | Hardhat Network / Anvil (instant local chain w/ fake ETH) |
| API to read/write chain | your own REST routes | RPC endpoint (Infura, Alchemy, QuickNode) |
| ORM-like contract interaction | Mongoose | `ethers.js` / `viem` / `wagmi` |

### Hardhat (most common framework, JS-based — easiest entry for MERN devs)
```bash
npx hardhat init
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```
- Has a built-in local blockchain simulator with test accounts pre-funded with fake ETH.

### Foundry (faster, Rust-based, write tests in Solidity itself) — more "pro" tool, worth learning after Hardhat.

### RPC Providers (= your DB connection string)
You don't run your own blockchain node — you connect via a provider:
- **Alchemy**, **Infura**, **QuickNode** — give you an RPC URL like `https://eth-sepolia.g.alchemy.com/v2/<key>`.
- This is exactly like a `MONGO_URI` — your app talks to the chain through this endpoint.

### Testnets vs Mainnet
- **Mainnet** = real money, real users (production).
- **Testnet** (e.g. Sepolia, Holesky) = fake ETH, for testing before going live (like staging environment). Get free test ETH from a "faucet."

---

## 7. Connecting Frontend (React) to the Chain

### ethers.js (most common library)
```js
import { ethers } from "ethers";

// 1. Connect to user's wallet (like getting an authenticated client)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();          // can sign txs (write access)

// 2. Connect to a deployed contract
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// 3. Read data (free, like a GET request)
const value = await contract.getValue();

// 4. Write data (costs gas, like a POST request)
const tx = await contract.setValue(42);
await tx.wait(); // wait for confirmation (like awaiting a DB write)
```

### What is an ABI?
**Application Binary Interface** — JSON description of a contract's functions/events, generated when you compile Solidity. It's the equivalent of an **OpenAPI/Swagger spec** — tells your frontend what functions exist and their signatures, without needing the source code.

### wagmi + viem (modern React stack, hooks-based — like React Query for blockchain)
```jsx
import { useReadContract, useWriteContract, useAccount } from "wagmi";

function MyComponent() {
  const { address, isConnected } = useAccount(); // like useAuth()
  const { data } = useReadContract({ address, abi, functionName: "getValue" });
  const { writeContract } = useWriteContract();
  // writeContract({ address, abi, functionName: "setValue", args: [42] })
}
```
- `wagmi` = React hooks for wallet connection, reading/writing contracts, watching events (caches, auto-refetches, like React Query).
- `viem` = lower-level TS library wagmi is built on (lighter/faster alternative to ethers).
- **RainbowKit / ConnectKit** = pre-built "Connect Wallet" button UI (like an auth widget — saves you building wallet-selection UI from scratch).

### Listening to events (= WebSocket equivalent)
```js
contract.on("ValueChanged", (newValue) => {
  console.log("New value:", newValue);
});
```

---

## 8. Storage on Web3 (since blockchain storage is expensive)

- Never store large data (images, JSON, files) directly on-chain — gas cost is enormous.
- **IPFS (InterPlanetary File System)** — decentralized file storage, content-addressed (hash-based URL). Store only the **IPFS hash/CID** on-chain, store the actual file off-chain.
- **Pinata / web3.storage / NFT.storage** — services that pin (host) your files on IPFS (like S3, but decentralized) — equivalent of using Cloudinary/S3 for media in MERN.
- Pattern for NFTs: image → IPFS → metadata JSON (name, image URL, attributes) → IPFS → store metadata URI in the NFT contract.

---

## 9. DeFi & dApp Concepts (good-to-know vocabulary)

| Term | Meaning |
|---|---|
| **dApp** | Decentralized app — frontend (React) + smart contract backend instead of Express/Mongo. |
| **DeFi** | Decentralized Finance — lending, swapping, borrowing via contracts (Uniswap, Aave) instead of banks. |
| **DEX** | Decentralized Exchange — swap tokens via smart contracts + liquidity pools, no order book/middleman. |
| **Liquidity pool** | Pool of two tokens users deposit so others can swap against it; depositors earn fees. |
| **AMM** | Automated Market Maker — algorithm (e.g. `x*y=k`) that prices swaps in a pool, no order matching needed. |
| **Staking** | Locking tokens to earn rewards / secure the network. |
| **Yield farming** | Moving funds between protocols to maximize returns. |
| **Gas optimization** | Writing contracts to minimize gas cost (storage writes are the most expensive operation). |
| **Oracle** | Brings off-chain data on-chain (e.g. Chainlink price feeds) — contracts can't natively call external APIs. |
| **DAO** | Decentralized Autonomous Organization — governance via token-holder voting instead of a company hierarchy. |
| **Multisig wallet** | Wallet requiring multiple signatures to execute a tx (e.g. Gnosis Safe) — like requiring 2 approvers for a deploy. |
| **Bridge** | Moves assets/data between two different blockchains. |
| **Rollup (Optimistic/ZK)** | L2 scaling tech — batches many txs off-chain, posts proof/summary back to L1. |
| **MEV** | Maximal Extractable Value — profit miners/validators can extract by reordering/inserting txs. |

---

## 10. Security — Critical for Smart Contracts (no `try/catch` undo button!)

Since contracts are immutable and hold real money, bugs = permanent loss. Key vulnerabilities to know:

1. **Reentrancy** — external call lets attacker re-enter your function before state updates (the famous DAO hack). Fix: update state *before* external calls (checks-effects-interactions pattern), or use `ReentrancyGuard` from OpenZeppelin.
2. **Integer overflow/underflow** — largely mitigated since Solidity 0.8+ (auto-reverts), but be aware in older code.
3. **Access control bugs** — forgetting `onlyOwner`/role checks on sensitive functions.
4. **Front-running** — attacker sees your pending tx in mempool and submits their own with higher gas to execute first.
5. **Unchecked external calls** — always check return values of low-level `.call()`.
6. **Always get contracts audited** before mainnet deployment with real funds; use established libraries (OpenZeppelin) instead of writing from scratch.

---

## 11. Typical dApp Architecture (full picture for a MERN dev)

```
[React Frontend]
   |  (wagmi/ethers + RainbowKit)
   v
[Wallet: MetaMask] --signs tx--> [RPC Provider: Alchemy/Infura]
   |                                      |
   |                                      v
   |                              [Blockchain Network]
   |                                      |
   |                              [Smart Contracts]
   v
[Your normal Node/Express backend] <---- (optional: indexes on-chain
   |                                      events into MongoDB for fast
   v                                      queries/search, since querying
[MongoDB - cached/indexed                  the chain directly is slow)
 off-chain data, user profiles, etc.]
```

- You'll often **still run a normal Express + MongoDB backend** — for things blockchain is bad at: full-text search, fast pagination, storing non-critical data, sending emails, etc.
- The blockchain is the **source of truth for ownership/value**; your DB is a **fast cache/index** of on-chain events (using The Graph, or your own event listener writing to Mongo).
- **The Graph** — a popular "indexing" protocol — write a subgraph to query historical contract events like a GraphQL API instead of scanning the whole chain yourself.

---

## 12. Quick-Reference Glossary

- **Gwei** — 1 billionth of an ETH, unit gas prices are quoted in.
- **Wei** — smallest ETH unit (1 ETH = 10^18 wei).
- **Mint** — create new tokens/NFTs.
- **Burn** — destroy tokens (send to an unspendable address or call a burn function).
- **Faucet** — free testnet tokens for development.
- **Block explorer** — Etherscan/Basescan — like a GUI for the blockchain DB, search any address/tx/contract.
- **Checksum address** — mixed-case version of an address used to catch typos.
- **Fork** — copying a blockchain's state locally for testing (Hardhat can fork mainnet).
- **Slippage** — price difference between expected and executed trade due to market movement.
- **Whitelist/Allowlist** — addresses pre-approved for an action (e.g. early NFT mint access).

---

## 13. Suggested Learning Path (practical, MERN-dev-friendly)

1. Get a MetaMask wallet + testnet ETH from a faucet.
2. Write & deploy a simple Solidity contract (counter/storage) with Hardhat on a testnet.
3. Connect a React app to it using `wagmi` + `ethers`/`viem` — read and write to the contract.
4. Build a minimal ERC-20 token using OpenZeppelin, deploy, interact via frontend.
5. Build a minimal ERC-721 (NFT) with metadata on IPFS (via Pinata).
6. Learn to listen to contract events and sync them into MongoDB (mini indexer).
7. Study one real audited contract on Etherscan (e.g. a simple Uniswap-like contract) to see production patterns.
8. Read up on reentrancy + the checks-effects-interactions pattern — most important security lesson.

---

### One-line takeaway
**Smart contract = backend route that anyone can call, whose code and data are public, whose execution costs gas, and whose state changes are permanent — wallet = login system, gas = your "server cost," and ethers/wagmi = your fetch/axios for talking to it.**
