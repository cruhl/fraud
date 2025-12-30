export type Headline = {
  text: string;
  category: "nick-shirley" | "state-response" | "scale" | "absurdist" | "political";
};

export const HEADLINES: Headline[] = [
  // NICK SHIRLEY SPECIFIC (The viral hook)
  { text: "BREAKING: YouTuber finds empty daycare receiving $1.9 million in state funding", category: "nick-shirley" },
  { text: "Nick Shirley visits 10 daycares in ONE DAY, finds combined total of 2 children", category: "nick-shirley" },
  { text: "Man with camera finds more fraud in 42 minutes than state found in 7 years", category: "nick-shirley" },
  { text: "Nick Shirley's video hits 100 million views, state says 'who is this person?'", category: "nick-shirley" },
  { text: "Conservative YouTuber does job state inspectors couldn't or wouldn't", category: "nick-shirley" },
  { text: "Nick Shirley exposes $110M in fraud before lunch, takes afternoon off", category: "nick-shirley" },
  { text: "YouTuber's 42-minute video creates more accountability than 7 years of oversight", category: "nick-shirley" },
  { text: "Shirley finds 'Quality LEARING Center' - apparently nobody noticed the typo", category: "nick-shirley" },
  { text: "Nick Shirley asks neighbors about daycare, they say 'haven't seen kids since 2017'", category: "nick-shirley" },
  { text: "YouTuber films empty building during business hours, state claims 'bad timing'", category: "nick-shirley" },

  // STATE RESPONSE SATIRE
  { text: "State inspector confirms 99 children present at facility with 0 parking spaces", category: "state-response" },
  { text: "DCYF: 'Our unannounced visits found children present' - visited at 2 AM", category: "state-response" },
  { text: "Commissioner: 'No evidence of fraud' despite $1.9M going to empty building", category: "state-response" },
  { text: "Governor creates Inspector General office after only $9 billion stolen", category: "state-response" },
  { text: "Tim Walz announces 'robust oversight' for 15th time this year", category: "state-response" },
  { text: "State: 'We've investigated ourselves and found no wrongdoing'", category: "state-response" },
  { text: "DCYF: 'Each facility was visited in last 6 months' - nobody asked why they're empty NOW", category: "state-response" },
  { text: "Governor's office: 'Prosecutions prove our oversight is working'", category: "state-response" },
  { text: "State inspector visits empty building, writes 'operations consistent with expectations'", category: "state-response" },
  { text: "Commissioner Brown: 'Children were present' - refuses to elaborate", category: "state-response" },

  // SCALE OF FRAUD
  { text: "Federal prosecutor: Fraud total could surpass $1 billion. Update: Make that $9 billion", category: "scale" },
  { text: "Half of $18 billion in federal funds may have been stolen, official says casually", category: "scale" },
  { text: "14 Minnesota programs under investigation, 15th says 'we're definitely different'", category: "scale" },
  { text: "Housing Stabilization Services shut down entirely. Childcare: 'We're fine'", category: "scale" },
  { text: "State allocates $18 billion to programs, shocked when $9 billion goes missing", category: "scale" },
  { text: "Fraud total rises from $250M to $500M to $1B to $9B in same fiscal year", category: "scale" },
  { text: "FBI 'surges resources' to Minnesota - sends 2 additional agents", category: "scale" },
  { text: "Homeland Security deploys 'strike team' - consists of 4 people with clipboards", category: "scale" },
  { text: "28-year sentence handed down for $47M fraud - math suggests 5,000 years needed total", category: "scale" },
  { text: "State budget meeting: 'Where did the money go?' 'We gave it away' 'To whom?' 'Unclear'", category: "scale" },

  // ABSURDIST
  { text: "Quality LEARING Center passes state spelling inspection", category: "absurdist" },
  { text: "Daycare licensed for 99 kids opens inside abandoned Kmart", category: "absurdist" },
  { text: "Autism therapy provider bills for 47-hour session, client confirms 'felt thorough'", category: "absurdist" },
  { text: "State database shows 50,000 children enrolled at P.O. Box addresses", category: "absurdist" },
  { text: "Investigator finds paper trail leads to Cayman Islands via North Dakota", category: "absurdist" },
  { text: "Daycare naptime log shows 99 children sleeping for 47 hours straight", category: "absurdist" },
  { text: "Inspector visits at 2 AM, confirms children 'probably sleeping at home'", category: "absurdist" },
  { text: "Daycare owner: 'The children are real, they're just camera-shy'", category: "absurdist" },
  { text: "CCAP approves funding for daycare located in a shipping container", category: "absurdist" },
  { text: "Audit reveals daycare spent $800,000 on 'miscellaneous educational snacks'", category: "absurdist" },
  { text: "Housing voucher issued for apartment that doesn't have walls yet", category: "absurdist" },
  { text: "Therapy session billed for patient who moved to Wisconsin 3 years ago", category: "absurdist" },
  { text: "Daycare claims 200 children but parking lot fits 4 cars", category: "absurdist" },
  { text: "PCA logs show caregiver in two places simultaneously, files quantum mechanics exemption", category: "absurdist" },
  { text: "Daycare owner purchases fourth vacation home, cites 'educational field trip expenses'", category: "absurdist" },

  // POLITICAL SATIRE
  { text: "JD Vance tweets praise for Nick Shirley, video gains 10 million views in an hour", category: "political" },
  { text: "Kristi Noem announces DHS 'strike team' deployed to Minneapolis immediately", category: "political" },
  { text: "Kash Patel: FBI has 'surged resources' to Minnesota fraud investigation", category: "political" },
  { text: "Tom Emmer demands answers from Walz administration, gets press release", category: "political" },
  { text: "Bipartisan concern expressed about fraud - no action taken", category: "political" },
  { text: "Congressional hearing scheduled, then rescheduled, then quietly cancelled", category: "political" },
  { text: "Governor's press conference: 'We take this very seriously' (15th time)", category: "political" },
  { text: "State creates new oversight position, fills it with person who missed $9B fraud", category: "political" },
  { text: "Election year begins, all fraud investigations mysteriously pause", category: "political" },
  { text: "Both parties agree fraud is bad, disagree on whose fault it is", category: "political" },
  { text: "Whistleblower who reported fraud in 2019 found 'promoted' to basement office", category: "political" },
  { text: "Tim Walz: 'Prosecutions show our system works' - Prosecutor: 'We had to sue to investigate'", category: "political" },
  { text: "State official resigns, immediately hired as consultant for same department", category: "political" },
  { text: "Federal oversight requested, state says 'we've got this under control'", category: "political" },
  { text: "Audit recommends 47 changes, state implements 2 and calls it 'comprehensive reform'", category: "political" },
];

export const getHeadlinesByCategory = (category: Headline["category"]): Headline[] =>
  HEADLINES.filter((h) => h.category === category);

export const getRandomHeadline = (): Headline =>
  HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
