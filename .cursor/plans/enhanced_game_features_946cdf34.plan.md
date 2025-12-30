---
name: Enhanced Game Features
overview: Elevate the game from a basic clicker to an addictive, memorable experience with random events, achievements, prestige mechanics, audio feedback, and expanded content that amplifies the satire.
todos:
  - id: random-events
    content: Implement random events system with popup modal and suspicion/bonus effects
    status: pending
  - id: achievements
    content: Create achievement system with toast notifications and trophy case UI
    status: pending
  - id: more-upgrades
    content: Add 6 new late-game upgrades ($5M-$100M tier)
    status: pending
  - id: golden-clicks
    content: Add floating golden click bonus mechanic
    status: pending
  - id: sound-effects
    content: Implement audio feedback for clicks, purchases, events, and suspicion
    status: pending
  - id: prestige
    content: Add 'Skip Town' prestige system with permanent multipliers
    status: pending
  - id: visual-polish
    content: Add screen shake, particles, and suspicion meter FBI agent visual
    status: pending
  - id: save-system
    content: Implement localStorage auto-save and stats tracking
    status: pending
---

# Phase 2: Making It Addictive and Hilarious

The core loop is solid. Now we add the systems that make cookie clickers irresistible - unpredictability, long-term progression, and constant dopamine hits.---

## 1. Random Events System (High Priority)

Add dramatic tension with unpredictable events that spike suspicion or offer opportunities.**Create [`src/data/events.ts`](src/data/events.ts):**

```typescript
export type GameEvent = {
  id: string;
  title: string;
  description: string;
  effect: EventEffect;
  weight: number; // probability weight
};

// Bad events (increase suspicion)
{ id: "audit", title: "SURPRISE AUDIT!", description: "State inspector making unannounced visit", effect: { suspicion: +15 } }
{ id: "whistleblower", title: "ANONYMOUS TIP", description: "Former employee contacted FBI", effect: { suspicion: +20 } }
{ id: "viral-video", title: "VIRAL VIDEO", description: "Nick Shirley just filmed your parking lot", effect: { suspicion: +25 } }

// Good events (bonuses)
{ id: "grant", title: "FEDERAL GRANT!", description: "COVID emergency funds approved!", effect: { money: "5x passive income" } }
{ id: "inspector-vacation", title: "INSPECTOR ON VACATION", description: "Suspicion frozen for 30 seconds", effect: { suspicionPause: 30 } }
```

**Event popup modal** - Dramatic full-screen takeover with urgent styling, sound effect, and countdown.---

## 2. Achievement System (High Priority)

Achievements provide constant micro-goals and satirical commentary.**Create [`src/data/achievements.ts`](src/data/achievements.ts):**| Achievement | Condition | Flavor Text ||------------|-----------|-------------|| First Lie | 1 claim filed | "Everyone starts somewhere" || Paper Trail | 100 claims | "That's a lot of naptime logs" || Ghost Operation | 1,000 fake children reported | "Not a single parking space used" || Millionaire | $1M earned | "But at what cost? Literally nothing" || Shell Game | Own 5 shell companies | "Good luck following this money" || Close Call | Hit 90% suspicion and survive | "Too close for comfort" || Speed Run | Win in under 10 minutes | "Efficient fraud is the best fraud" || Untouchable | Win with under 30% max suspicion | "You were never even a suspect" |**Toast notifications** when earned + persistent trophy case in sidebar.---

## 3. Golden Click Mechanic (Medium Priority)

Random "golden claims" that appear and must be clicked quickly for massive bonuses.

- Gold-tinted clipboard icon floats across screen
- 5-second window to click
- Rewards: 10x current click value, suspicion reduction, or instant upgrade discount
- Spawn rate: every 30-90 seconds
- Creates urgency and keeps players actively engaged

---

## 4. Prestige System - "Skip Town" (Medium Priority)

The meta-progression that keeps players coming back.**Mechanic:**

- After reaching $10M+, unlock ability to "Skip Town"
- Reset all progress but gain permanent "Experience" multiplier
- Each prestige adds +10% to all earnings
- Unlock prestige-exclusive upgrades (new shell companies in other states, international connections)

**Flavor:** "You've attracted too much heat. Time to start fresh in Florida..."---

## 5. Expanded Upgrade Tiers (High Priority)

Add 4-6 more upgrades for late-game progression in [`src/data/upgrades.ts`](src/data/upgrades.ts):| Upgrade | Cost | Effect | Flavor ||---------|------|--------|--------|| Burner Phones | $5M | +$2,000/sec | "No paper trail" || Crypto Laundering | $15M | 3x click multiplier | "What's a blockchain?" || State Senator | $30M | -75% suspicion gain | "Campaign contributions pay off" || Fake 501(c)(3) | $50M | +$10,000/sec | "It's for the children (wink)" || Media Fixer | $75M | Suspicion decays 5x faster | "Nothing to see here, folks" || DOJ Contact | $100M | Suspicion capped at 85% | "Friends in high places" |---

## 6. Sound Design (Medium Priority)

Audio is crucial for satisfying feedback loops.

- **Click sounds:** Cash register "cha-ching", paper stamp thud
- **Upgrade purchased:** Satisfying "level up" chime
- **Suspicion rising:** Increasingly tense heartbeat
- **Event trigger:** News alert sound
- **Achievement:** Victory fanfare
- **Game over:** Police siren + handcuff sound

Use Web Audio API or Howler.js. Keep sounds short and punchy.---

## 7. Visual Juice (Polish)

Add more feedback to make actions feel impactful:

- **Screen shake** on big purchases or events
- **Particle burst** on clicks (dollar signs, papers flying)
- **Upgrade glow** when affordable
- **Suspicion meter** - Add FBI agent icon that gets closer as suspicion rises
- **Money counter** - Slot machine animation on big gains
- **Background** - Subtle papers floating, crime scene tape at high suspicion

---

## 8. Statistics & Save System (Low Priority)

- Detailed stats modal: Total lifetime earnings, claims filed, times busted, fastest win
- localStorage persistence with auto-save every 10 seconds
- Export/import save codes

---

## Architecture Additions

```javascript
src/
  components/
    EventModal.tsx      # Random event popup
    Achievements.tsx    # Trophy case sidebar
    GoldenClick.tsx     # Floating bonus target
    PrestigeModal.tsx   # Skip town screen
  data/
    events.ts           # Random events definitions
    achievements.ts     # Achievement definitions
  hooks/
    useAudio.ts         # Sound effect management
    useSave.ts          # Persistence logic
  store/
    gameStore.ts        # Add: events, achievements, prestige tracking
```

---

## Recommended Implementation Order

1. **Random Events** - Biggest gameplay impact
2. **Achievements** - Easy wins, high engagement value
3. **More Upgrades** - Extends playtime immediately