export const WORKOUT_SPLITS = [
  {
    id: "ppl",
    title: "Push / Pull / Legs (PPL)",
    description: "The gold standard split dividing sessions into pushing, pulling, and leg movements.",
    recommendedDays: [3, 6],
    categoriesCovered: [
      { id: 11, name: "Chest" },
      { id: 13, name: "Shoulders" },
      { id: 12, name: "Back" },
      { id: 8,  name: "Arms" },
      { id: 9,  name: "Legs" },
      { id: 14, name: "Calves" },
      { id: 10, name: "Abs" }
    ]
  },
  {
    id: "arnold",
    title: "Arnold Split",
    description: "Antagonistic pairing (Chest/Back, Shoulders/Arms, Legs) for high-volume growth.",
    recommendedDays: [3, 4, 6],
    categoriesCovered: [
      { id: 11, name: "Chest" },
      { id: 12, name: "Back" },
      { id: 13, name: "Shoulders" },
      { id: 8,  name: "Arms" },
      { id: 9,  name: "Legs" },
      { id: 10, name: "Abs" }
    ]
  },
  {
    id: "upper-lower",
    title: "Upper / Lower Body",
    description: "A balanced 4-day routine splitting the body cleanly into upper and lower halves.",
    recommendedDays: [2, 4],
    categoriesCovered: [
      { id: 11, name: "Chest" },
      { id: 12, name: "Back" },
      { id: 13, name: "Shoulders" },
      { id: 8,  name: "Arms" },
      { id: 9,  name: "Legs" },
      { id: 14, name: "Calves" },
      { id: 10, name: "Abs" }
    ]
  },
  {
    id: "full-body",
    title: "Full Body Blast",
    description: "High-frequency training targeting every major muscle group in each session.",
    recommendedDays: [2, 3],
    categoriesCovered: [
      { id: 11, name: "Chest" },
      { id: 12, name: "Back" },
      { id: 9,  name: "Legs" },
      { id: 13, name: "Shoulders" },
      { id: 8,  name: "Arms" },
      { id: 15, name: "Cardio" },
      { id: 10, name: "Abs" }
    ]
  },
  {
    id: "bro-split",
    title: "Classic Bro Split",
    description: "Dedicated single-muscle group focus per day for maximum localized pump and recovery.",
    recommendedDays: [4, 5],
    categoriesCovered: [
      { id: 11, name: "Chest" },
      { id: 12, name: "Back" },
      { id: 9,  name: "Legs" },
      { id: 13, name: "Shoulders" },
      { id: 8,  name: "Arms" }
    ]
  },
  {
    id: "upper-focus",
    title: "Upper Body Specialization",
    description: "A partial split focused entirely on building chest, back, shoulders, and arms without leg fatigue.",
    recommendedDays: [2, 3, 4],
    categoriesCovered: [
      { id: 11, name: "Chest" },
      { id: 12, name: "Back" },
      { id: 13, name: "Shoulders" },
      { id: 8,  name: "Arms" }
    ]
  },
  {
    id: "core-cardio",
    title: "Core & Cardio Conditioning",
    description: "A specialized partial routine designed to torch fat and bulletproof your midsection.",
    recommendedDays: [2, 3],
    categoriesCovered: [
      { id: 10, name: "Abs" },
      { id: 15, name: "Cardio" }
    ]
  }
];

export const AVAILABLE_TAGS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Cardio', 'Abs'];