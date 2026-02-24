export type LearningTopic = "english" | "reading" | "science" | "math";

export type LearningCard = {
  id: string;
  english: string;
  spanish: string;
  topic: LearningTopic;
  context: string;
  prompt: string;
  exampleEnglish: string;
  exampleSpanish: string;
};

export const STARTER_CARDS: LearningCard[] = [
  {
    id: "parallel-lines",
    english: "Parallel lines",
    spanish: "Lineas paralelas",
    topic: "math",
    context:
      "Parallel lines run in the same direction and never cross each other.",
    prompt: "Can you point to two things around you that look parallel?",
    exampleEnglish:
      "The rails on a train track are parallel lines because they stay the same distance apart.",
    exampleSpanish:
      "Los rieles de un tren son lineas paralelas porque mantienen la misma distancia.",
  },
  {
    id: "perpendicular-lines",
    english: "Perpendicular lines",
    spanish: "Lineas perpendiculares",
    topic: "math",
    context: "Perpendicular lines cross to make a square corner, or 90 degrees.",
    prompt:
      "Can you find something in your room where two lines make an L shape?",
    exampleEnglish:
      "The edge of a wall and the floor are often perpendicular lines.",
    exampleSpanish:
      "El borde de una pared y el piso suelen ser lineas perpendiculares.",
  },
  {
    id: "hardwood-floors",
    english: "Hardwood floors",
    spanish: "Pisos de madera",
    topic: "english",
    context: "Hardwood floors are made from solid wood boards.",
    prompt:
      "What does a hardwood floor feel like when you walk on it barefoot?",
    exampleEnglish:
      "Our living room has hardwood floors that are smooth and shiny.",
    exampleSpanish:
      "Nuestra sala tiene pisos de madera que son lisos y brillantes.",
  },
  {
    id: "fraction",
    english: "Fraction",
    spanish: "Fraccion",
    topic: "math",
    context: "A fraction is a part of a whole, like one slice of a pizza.",
    prompt: "If you cut an apple into two equal parts, what fraction is one part?",
    exampleEnglish: "One half is written as the fraction 1/2.",
    exampleSpanish: "Un medio se escribe como la fraccion 1/2.",
  },
  {
    id: "pattern",
    english: "Pattern",
    spanish: "Patron",
    topic: "math",
    context: "A pattern is something that repeats in the same order.",
    prompt: "Can you make a clap-clap-stomp pattern with your hands and feet?",
    exampleEnglish: "Red, blue, red, blue is a color pattern.",
    exampleSpanish: "Rojo, azul, rojo, azul es un patron de colores.",
  },
  {
    id: "evaporation",
    english: "Evaporation",
    spanish: "Evaporacion",
    topic: "science",
    context: "Evaporation happens when liquid water changes into water vapor.",
    prompt:
      "Why do puddles get smaller after the sun shines on them for a while?",
    exampleEnglish:
      "Wet clothes dry outside because water evaporates into the air.",
    exampleSpanish:
      "La ropa mojada se seca afuera porque el agua se evapora al aire.",
  },
  {
    id: "habitat",
    english: "Habitat",
    spanish: "Habitat",
    topic: "science",
    context:
      "A habitat is the natural home where a plant or animal gets what it needs.",
    prompt: "What is the habitat of a fish?",
    exampleEnglish: "A pond is a habitat for frogs and fish.",
    exampleSpanish: "Un estanque es un habitat para ranas y peces.",
  },
  {
    id: "recycle",
    english: "Recycle",
    spanish: "Reciclar",
    topic: "science",
    context:
      "To recycle means turning used materials into new useful products.",
    prompt: "What items in your house can go in a recycling bin?",
    exampleEnglish: "We recycle paper and plastic bottles every week.",
    exampleSpanish: "Reciclamos papel y botellas de plastico cada semana.",
  },
  {
    id: "prediction",
    english: "Prediction",
    spanish: "Prediccion",
    topic: "reading",
    context:
      "A prediction is a smart guess about what might happen next in a story.",
    prompt:
      "Before turning the page, what do you predict the main character will do?",
    exampleEnglish:
      "I made a prediction that the dog would find its way home.",
    exampleSpanish:
      "Hice una prediccion de que el perro encontraria el camino a casa.",
  },
  {
    id: "compare",
    english: "Compare",
    spanish: "Comparar",
    topic: "reading",
    context: "To compare is to look at how two things are alike and different.",
    prompt:
      "Can you compare two fruits and tell one way they are alike and one way they are different?",
    exampleEnglish:
      "We compare characters by their actions, feelings, and choices.",
    exampleSpanish:
      "Comparamos personajes por sus acciones, sentimientos y decisiones.",
  },
];
