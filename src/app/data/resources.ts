import { Resource } from '../types';

export const RESOURCES: Resource[] = [
  {
    id: 1,
    name: "Atomic Habits",
    type: "book",
    desc: "How tiny behavioral changes compound into identity-level transformation. The best single book on habit change.",
    tags: ["habits", "negative", "self-improvement"]
  },
  {
    id: 2,
    name: "The Body Keeps the Score",
    type: "book",
    desc: "Explores how trauma and chronic stress live in the body — essential if any of your bubbles go back a long way.",
    tags: ["mental health", "negative", "self-awareness"]
  },
  {
    id: 3,
    name: "Daily journaling",
    type: "practice",
    desc: "10 minutes each morning. Write what your map looked like yesterday, what you did, what you'd change.",
    tags: ["self-awareness", "habits"]
  },
  {
    id: 4,
    name: "Dopamine Nation",
    type: "book",
    desc: "A sober clinical look at compulsive behavior and the pleasure-pain balance. Relevant for any addictive pattern.",
    tags: ["negative", "habits"]
  },
  {
    id: 5,
    name: "CBT thought record",
    type: "practice",
    desc: "Map the thought → feeling → behavior loop driving the patterns you want to change.",
    tags: ["mental health", "negative", "self-awareness"]
  },
  {
    id: 6,
    name: "Weekly review",
    type: "practice",
    desc: "A structured 20-minute review: what drained you, what energized you, what you avoided, what you'll do differently.",
    tags: ["self-awareness", "habits", "positive"]
  },
  {
    id: 7,
    name: "Huberman sleep protocol",
    type: "tool",
    desc: "Andrew Huberman's evidence-based sleep stack. The foundation beneath every other bubble.",
    tags: ["habits", "health"]
  },
  {
    id: 8,
    name: "Boundaries book",
    type: "book",
    desc: "For relationship patterns that keep showing up despite wanting to change them.",
    tags: ["relationships", "negative", "self-awareness"]
  },
  {
    id: 9,
    name: "20-min daily exercise",
    type: "practice",
    desc: "The easiest green bubble to add. Even 20 minutes 3× a week reshapes mood, discipline, and self-image.",
    tags: ["positive", "habits", "health"]
  },
  {
    id: 10,
    name: "Digital detox experiment",
    type: "practice",
    desc: "Remove every app you suspect is filling a void for one week. See what surfaces underneath.",
    tags: ["habits", "negative"]
  },
  {
    id: 11,
    name: "Therapy",
    type: "tool",
    desc: "Some bubbles are too heavy to move alone. A professional can help you understand the roots.",
    tags: ["mental health", "any", "negative"]
  },
  {
    id: 12,
    name: "Mindfulness basics",
    type: "practice",
    desc: "Even 5 minutes of deliberate stillness a day builds the self-awareness muscle this whole app depends on.",
    tags: ["self-awareness", "habits", "positive"]
  }
];
