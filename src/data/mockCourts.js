/* ============================================================================
   MOCK DATA — 5 real London courts. No external APIs.
   `capacity` drives the derived heat level; `players` is the live count.
   ========================================================================= */
export const INITIAL_COURTS = [
  {
    id: "clissold",
    name: "Clissold Park",
    area: "Stoke Newington · N16",
    distanceKm: 0.8,
    surface: "Tarmac · 2 full courts",
    players: 9,
    capacity: 12,
    checkedIn: ["Marcus T.", "Deyo", "Lil Rich", "Ana B.", "Kofi", "JJ", "Smiley", "Tariq", "Bea"],
    runs: [
      { id: "r1", time: "Today · 6:30 PM", skill: "Intermediate", format: "5v5", spotsLeft: 2, host: "Marcus T." },
      { id: "r2", time: "Sat · 10:00 AM", skill: "All levels", format: "3v3", spotsLeft: 4, host: "Ana B." },
    ],
  },
  {
    id: "londonfields",
    name: "London Fields",
    area: "Hackney · E8",
    distanceKm: 1.4,
    surface: "Painted concrete · 1 full court",
    players: 4,
    capacity: 10,
    checkedIn: ["Femi", "Oscar W.", "Dre", "Maya"],
    runs: [
      { id: "r3", time: "Today · 7:00 PM", skill: "Advanced", format: "5v5", spotsLeft: 1, host: "Femi" },
    ],
  },
  {
    id: "clapham",
    name: "Clapham Common",
    area: "Clapham · SW4",
    distanceKm: 6.2,
    surface: "Tarmac · 2 half courts",
    players: 0,
    capacity: 10,
    checkedIn: [],
    runs: [],
  },
  {
    id: "haggerston",
    name: "Haggerston Park",
    area: "Hackney · E2",
    distanceKm: 2.1,
    surface: "Rubberised · 1 full court",
    players: 10,
    capacity: 10,
    checkedIn: ["Big Sam", "Nia", "Carlos", "Teo", "Ravi", "Jords", "Elle", "Moses", "Kwame", "Pat"],
    runs: [
      { id: "r4", time: "Today · 8:00 PM", skill: "Intermediate", format: "21 / King of Court", spotsLeft: 0, host: "Big Sam" },
    ],
  },
  {
    id: "finsbury",
    name: "Finsbury Park",
    area: "Finsbury Park · N4",
    distanceKm: 2.9,
    surface: "Tarmac · 3 hoops",
    players: 2,
    capacity: 9,
    checkedIn: ["Leon", "Ish"],
    runs: [
      { id: "r5", time: "Sun · 2:00 PM", skill: "Beginner friendly", format: "3v3", spotsLeft: 5, host: "Leon" },
    ],
  },
];
