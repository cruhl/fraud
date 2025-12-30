---
name: Frau
overview: Build a satirical Cookie Clicker-inspired game called "Feeding Our Fraud" based on the Minnesota Feeding Our Future scandal, where players click to submit fake meal claims and upgrade their fraud operation while evading investigators.
todos: []
---

# Feeding

Our Fraud - Cookie Clicker GameA satirical idle/clicker game based on the Minnesota "Feeding Our Future" scandal - the largest COVID-19 fraud case in U.S. history ($300M stolen via fake child meal claims).

## Game Concept

Players run a fraudulent nonprofit, clicking to submit fake meal reimbursement claims. The darker the satire, the more it highlights the absurdity of the real scandal.**Core Loop:**

- Click the "Submit Claim" button to earn fraudulent dollars
- Buy upgrades to automate and multiply fraud
- Watch the "FBI Suspicion" meter - get caught and game ends
- Try to hit $300 million (the real scandal amount) before getting busted

## Tech Stack

- **Vite + React + TypeScript** - Fast modern setup
- **Tailwind CSS** - Rapid styling
- **Zustand** - Lightweight state management (perfect for idle games)
- No backend needed - all client-side

## Core Features

### 1. Clicker Mechanic

- Main button: "Submit Fake Meal Claim" 
- Displays fraudulent dollars counter with dramatic formatting
- Satisfying click animations and sound effects (optional)

### 2. Upgrades System (Cookie Clicker style)

| Upgrade | Cost | Effect ||---------|------|--------|| Ghost Kitchen | $100 | +1 $/sec passive income || Phantom Children | $500 | +5 $/click || Fake Invoices | $2,500 | +10 $/sec || Shell Company | $10,000 | 2x click multiplier || Bribed Inspector | $50,000 | Reduces suspicion gain || Money Laundering | $250,000 | +100 $/sec || Offshore Account | $1,000,000 | Suspicion decays over time |

### 3. Suspicion/Risk System

- FBI Suspicion meter (0-100%)
- Suspicion increases with each fraud action
- At 100% = Game Over (arrested)
- Some upgrades reduce or slow suspicion
- Random audit events that spike suspicion

### 4. UI Design

- Dark, noir aesthetic with paper/document textures
- Breaking news ticker at bottom with satirical headlines
- Counter showing "Children Fed: 0" vs "Fake Claims: 1,000,000"
- Mugshot gallery of upgrades (referencing real convictions)

## File Structure

```javascript
src/
  components/
    Clicker.tsx         # Main click button
    Counter.tsx         # Money display










```