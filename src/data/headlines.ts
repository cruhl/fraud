export type Headline = {
  text: string;
  category:
    | "nick-shirley"
    | "state-response"
    | "scale"
    | "absurdist"
    | "political"
    | "international"
    | "corruption"
    | "voter-fraud"
    | "federal"
    | "legal"
    | "whistleblower"
    | "media";
};

export const HEADLINES: Headline[] = [
  // ============================================
  // NICK SHIRLEY SPECIFIC
  // ============================================
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
  { text: "Nick Shirley returns to Cedar-Riverside, finds same buildings still empty", category: "nick-shirley" },
  { text: "Shirley's follow-up video reveals 5 more empty daycares in same neighborhood", category: "nick-shirley" },
  { text: "YouTuber's drone footage shows entire block of 'licensed' facilities with zero activity", category: "nick-shirley" },
  { text: "Nick Shirley interviews whistleblower, state says interview 'doesn't count'", category: "nick-shirley" },
  { text: "Shirley finds daycare operating from storage unit, licensed for 50 children", category: "nick-shirley" },
  { text: "YouTuber's spreadsheet of fraud more detailed than state's entire database", category: "nick-shirley" },
  { text: "Nick Shirley's Part 2 video somehow finds MORE fraud than Part 1", category: "nick-shirley" },
  { text: "Shirley documents 47 empty facilities in one week, state says 'still reviewing'", category: "nick-shirley" },

  // ============================================
  // STATE RESPONSE SATIRE
  // ============================================
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
  { text: "State announces new fraud hotline, puts it on hold for 3 hours", category: "state-response" },
  { text: "DCYF implements 'enhanced monitoring' - adds one part-time employee", category: "state-response" },
  { text: "Governor praises 'culture of trust' that enabled $9 billion fraud", category: "state-response" },
  { text: "State audit finds 'room for improvement' in program that lost billions", category: "state-response" },
  { text: "Commissioner testifies fraud 'could not have been predicted' despite 47 warnings", category: "state-response" },
  { text: "State database shows 100% compliance rate at facilities with 0% children", category: "state-response" },
  { text: "DCYF annual report celebrates 'successful partnerships' with fraud operators", category: "state-response" },
  { text: "Governor's office releases 800-page report concluding 'lessons were learned'", category: "state-response" },

  // ============================================
  // SCALE OF FRAUD
  // ============================================
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
  { text: "Recovered funds reach $70 million of $9 billion stolen - officials call it 'progress'", category: "scale" },
  { text: "New estimate suggests fraud may have started in 2015, not 2020", category: "scale" },
  { text: "57 convictions so far, estimated 500+ conspirators still at large", category: "scale" },
  { text: "Single daycare network billed more than entire state's education budget", category: "scale" },
  { text: "Fraud per capita in Minnesota now exceeds GDP per capita of 40 countries", category: "scale" },
  { text: "If fraud money were stacked in $100 bills, pile would reach International Space Station", category: "scale" },

  // ============================================
  // ABSURDIST
  // ============================================
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
  { text: "State approves license for daycare on second floor with no stairs", category: "absurdist" },
  { text: "Meal program claims to serve 10,000 lunches daily from kitchen with one microwave", category: "absurdist" },
  { text: "Transport van billed for 500-mile trip to appointment 2 blocks away", category: "absurdist" },
  { text: "Therapy notes copy-pasted from Wikipedia article about feelings", category: "absurdist" },
  { text: "Daycare attendance sheet signed by 'Mickey Mouse' and 'Donald Duck'", category: "absurdist" },
  { text: "Foster home inspection finds house doesn't exist, approves anyway", category: "absurdist" },
  { text: "PCA claims to have worked 127 hours in single day, calls it 'dedication'", category: "absurdist" },

  // ============================================
  // POLITICAL SATIRE
  // ============================================
  { text: "JD Vance tweets praise for Nick Shirley's investigation, video gains 10 million views in an hour", category: "political" },
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
  { text: "Senator introduces 'Fraud Prevention Act', bill dies in committee same day", category: "political" },
  { text: "Governor blames previous administration for fraud that happened on his watch", category: "political" },
  { text: "State legislator caught on hot mic: 'Everyone knew, nobody cared'", category: "political" },

  // ============================================
  // INTERNATIONAL MONEY LAUNDERING
  // ============================================
  { text: "FBI traces $3.5M to Nairobi real estate developer, state says 'cultural exchange'", category: "international" },
  { text: "Daycare owner opens luxury car dealership in Mogadishu, claims 'side hustle'", category: "international" },
  { text: "Wire transfers to Somalia labeled 'educational supplies' total $7 million", category: "international" },
  { text: "Hawala network moves $12M overseas, files as 'international curriculum development'", category: "international" },
  { text: "FBI discovers daycare operator on no-fly list, state says 'not our jurisdiction'", category: "international" },
  { text: "Cryptocurrency conversion through 'educational apps' totals $4.2M", category: "international" },
  { text: "Swiss bank account opened for 'emergency snack fund' holds $8 million", category: "international" },
  { text: "Kenya property records show 47 homes purchased with 'childcare stipends'", category: "international" },
  { text: "Defendant's passport shows 30 trips to Turkey, claims 'naptime research'", category: "international" },
  { text: "Dubai real estate portfolio worth $15M linked to Cedar-Riverside daycare", category: "international" },
  { text: "Money trail leads through 7 countries before dead-ending in Cyprus shell company", category: "international" },
  { text: "Al-Shabaab recruitment poster found in daycare break room, owner says 'decorative'", category: "international" },
  { text: "Wire transfer to 'Orphan Relief Fund' goes to account flagged by Treasury since 2018", category: "international" },
  { text: "Defendant purchases $2M villa in Morocco, claims it's 'staff housing'", category: "international" },
  { text: "Luxury goods shipment to Djibouti labeled 'educational materials'", category: "international" },
  { text: "Bank of Cyprus account linked to 14 Minnesota nonprofits, all share same address", category: "international" },

  // ============================================
  // POLITICAL CORRUPTION
  // ============================================
  { text: "Daycare owners donated $500K to state campaigns, got $50M in contracts", category: "corruption" },
  { text: "MDE whistleblower who flagged fraud in 2019 now works in records storage", category: "corruption" },
  { text: "Commissioner's nephew hired as 'oversight consultant' at $180K salary", category: "corruption" },
  { text: "Lobbyist who wrote childcare legislation now runs largest daycare network", category: "corruption" },
  { text: "State inspector receiving 'appreciation gifts' worth $40K annually", category: "corruption" },
  { text: "Governor's former aide now lobbies for daycare industry, shocked by fraud", category: "corruption" },
  { text: "Campaign donation records show $2M from entities receiving $200M in funding", category: "corruption" },
  { text: "Aimee Bock's Feeding Our Future donated to both parties, got protection from both", category: "corruption" },
  { text: "State official's home renovations paid by 'anonymous community supporter'", category: "corruption" },
  { text: "Anti-fraud task force staffed by former fraud defendants, cites 'expertise'", category: "corruption" },
  { text: "Investigation into investigation finds nothing wrong with investigation", category: "corruption" },
  { text: "Daycare owner named Ambassador to country with no extradition treaty", category: "corruption" },
  { text: "State creates $9B fraud response fund, contracts oversight to fraud defendant", category: "corruption" },
  { text: "Legislator who killed audit bill now 'consulting' for daycare association", category: "corruption" },
  { text: "Internal emails show state officials warned about fraud, chose to 'monitor'", category: "corruption" },
  { text: "Prosecutor who declined to investigate now partner at firm defending fraudsters", category: "corruption" },

  // ============================================
  // VOTER FRAUD INTEGRATION
  // ============================================
  { text: "Voter registration drives at fake daycares sign up 3,000 'parents'", category: "voter-fraud" },
  { text: "47 phantom children somehow registered to vote in school board election", category: "voter-fraud" },
  { text: "Absentee ballot collection at CCAP sites yields 90% turnout at empty buildings", category: "voter-fraud" },
  { text: "Address listed for 99 daycare children also registered 99 voters", category: "voter-fraud" },
  { text: "Community organizer at fraud daycare registers 500 voters per week", category: "voter-fraud" },
  { text: "Nursing home resident allegedly voted from daycare address 200 miles away", category: "voter-fraud" },
  { text: "Ballot harvester caught, claims collecting 'parental feedback forms'", category: "voter-fraud" },
  { text: "Same handwriting found on 400 absentee ballots and daycare naptime logs", category: "voter-fraud" },
  { text: "Precinct at Cedar-Riverside reports 127% turnout, officials say 'enthusiasm'", category: "voter-fraud" },
  { text: "Election judge also works as daycare inspector, sees no conflict", category: "voter-fraud" },
  { text: "Voter rolls list 50 people at address with occupancy limit of 4", category: "voter-fraud" },
  { text: "State certifies election from district where 80% of addresses are P.O. boxes", category: "voter-fraud" },
  { text: "Whistleblower alleges ballot harvesting at fraud daycares, investigation 'ongoing' for 3 years", category: "voter-fraud" },
  { text: "Voter ID shows daycare address, building demolished in 2018", category: "voter-fraud" },

  // ============================================
  // FEDERAL INVESTIGATION
  // ============================================
  { text: "DOJ announces task force, Minnesota AG says 'we've got this'", category: "federal" },
  { text: "FBI agents arrive in Minneapolis, immediately need more agents", category: "federal" },
  { text: "Federal grand jury subpoenas entire DCYF filing cabinet", category: "federal" },
  { text: "IRS joins investigation, finds nobody paid taxes on fraud proceeds", category: "federal" },
  { text: "Secret Service traces gift cards purchased with stolen funds", category: "federal" },
  { text: "Treasury Department flags 2,000 suspicious wire transfers from Minnesota", category: "federal" },
  { text: "DEA notes overlap between fraud networks and drug trafficking routes", category: "federal" },
  { text: "Homeland Security adds 6 fraud defendants to no-fly list", category: "federal" },
  { text: "Federal prosecutor: 'This is the largest pandemic fraud case we've ever seen'", category: "federal" },
  { text: "FBI raids 12 locations simultaneously, finds mostly empty buildings", category: "federal" },
  { text: "Federal judge denies bail, calls defendant 'obvious flight risk'", category: "federal" },
  { text: "US Attorney allocates entire office to Minnesota fraud cases", category: "federal" },

  // ============================================
  // LEGAL PROCEEDINGS
  // ============================================
  { text: "Defendant claims 'cultural misunderstanding' of what constitutes fraud", category: "legal" },
  { text: "Defense attorney argues client 'didn't know stealing billions was wrong'", category: "legal" },
  { text: "Judge denies bail after defendant caught booking one-way flight to Kenya", category: "legal" },
  { text: "Plea deal requires defendant to name co-conspirators, names 47 people", category: "legal" },
  { text: "Jury selection complicated by jurors who all lost money to fraud", category: "legal" },
  { text: "28-year sentence handed down, defendant asks 'for what?'", category: "legal" },
  { text: "Appeals court rejects argument that fraud was 'victimless crime'", category: "legal" },
  { text: "Defendant's luxury car seized, was purchased with 'naptime funds'", category: "legal" },
  { text: "Sentencing memo reveals defendant bragged about fraud on Instagram", category: "legal" },
  { text: "Cooperating witness agrees to testify, immediately needs witness protection", category: "legal" },
  { text: "Judge orders $47M restitution, defendant's declared assets total $200", category: "legal" },
  { text: "Defense claims insufficient evidence despite 10,000 fraudulent documents", category: "legal" },

  // ============================================
  // WHISTLEBLOWER STORIES
  // ============================================
  { text: "Whistleblower reported fraud in 2019, told to 'focus on positive outcomes'", category: "whistleblower" },
  { text: "Former employee provided evidence to state, was fired next week", category: "whistleblower" },
  { text: "Internal auditor found $500M discrepancy, supervisor said 'rounding error'", category: "whistleblower" },
  { text: "Anonymous tip line received 200 reports about same daycare, no action taken", category: "whistleblower" },
  { text: "Whistleblower lawsuit reveals state ignored warnings for 3 years", category: "whistleblower" },
  { text: "Former inspector goes public: 'We were told not to look too hard'", category: "whistleblower" },
  { text: "Nurse reports PCA fraud, gets labeled 'difficult employee'", category: "whistleblower" },
  { text: "Teacher reports fake enrollment numbers, school says 'mind your business'", category: "whistleblower" },
  { text: "Accountant who flagged irregularities now testifying before grand jury", category: "whistleblower" },
  { text: "Landlord reported fake tenants to housing authority, was ignored for 2 years", category: "whistleblower" },

  // ============================================
  // MEDIA CIRCUS
  // ============================================
  { text: "Documentary crew arrives in Minneapolis, already has 40 hours of footage", category: "media" },
  { text: "Netflix announces true crime series about Minnesota fraud", category: "media" },
  { text: "Podcast about scandal reaches #1, more popular than Serial", category: "media" },
  { text: "Local news finally covers story after it hits 50 million views nationally", category: "media" },
  { text: "National outlet sends reporter, finds more fraud in first hour than local media found in year", category: "media" },
  { text: "Satirical news site struggles to compete with actual headlines", category: "media" },
  { text: "TikTok explainers about fraud get more views than original investigation", category: "media" },
  { text: "Fraud defendants hire PR firm, makes everything worse", category: "media" },
  { text: "Newspaper editorial board calls for accountability after running 0 investigative pieces", category: "media" },
  { text: "Cable news covers story for 48 hours, moves on to next scandal", category: "media" },
  { text: "Comedian's joke about Minnesota fraud gets more engagement than news coverage", category: "media" },
  { text: "Influencer visits empty daycare, calls it 'giving haunted energy'", category: "media" },
];

export const getHeadlinesByCategory = (category: Headline["category"]): Headline[] =>
  HEADLINES.filter((h) => h.category === category);

export const getRandomHeadline = (): Headline =>
  HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
