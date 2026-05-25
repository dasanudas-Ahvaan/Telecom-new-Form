export const options = [
  {
    id: "loan",
    title: "Loan Application",
    description: "Apply for a personal loan.",
    pdfUrl: "/pdfs/loan-terms.pdf",
    questions: [
      {
        id: "income",
        label: "Monthly Income",
      },
      {
        id: "employment",
        label: "Employment Type",
      },
    ],
  },
  {
    id: "insurance",
    title: "Insurance Coverage",
    description: "Health insurance onboarding.",
    pdfUrl: "/pdfs/insurance-terms.pdf",
    questions: [
      {
        id: "age",
        label: "Your Age",
      },
    ],
  },
];

export const serviceChoices = [
  {
    id: "ahvn-dharmik-class",
    title: "Ahvaan Dharmik Classes",
    description:
      "The study of dharmik books and dharm philosophy under the guidance of shri Shivansh Narayan Dwivedi Ji",
    pdfUrl: "/terms/web-development.pdf", // Ensure these paths exist in your public folder
    questions: [
      {
        id: "1",
        label: "Why are you joining these classes?",
        type: "options",
        options: [
          "To understand Ishvar",
          "To worship Ishvar correctly",
          "For being a protector of dharm",
          "All of the above",
        ],
      },
      {
        id: "2",
        label:
          "Name any propaganda or cult related to Ishvar or Dharm that you have been associated with in the past / present.",
        type: "textarea",
      },
    ],
  },
  {
    id: "seo-audit",
    title: "Ahvaan Naam astra",
    description:
      "Daily naam jap in five sessions along with devotional events through online means. As per the directive of Pujya Gurudev Bhagwan, Shankaracharya, Puri Peeth",
    pdfUrl: "/terms/seo-services.pdf",
    questions: [
      {
        id: "1",
        label:
          "Name any propaganda or cult related to Ishvar or Dharm that you have been associated with in the past / present.",
        type: "textarea",
      },
    ],
  },
  {
    id: "graphic-design",
    title: "Financial Assistance",
    description: "Monetory contribution for dharm",
    pdfUrl: "/terms/design-terms.pdf",
    questions: [
      {
        id: "1",
        label:
          "Name any propaganda or cult related to Ishvar or Dharm that you have been associated with in the past / present.",
        type: "textarea",
      },
      {
        id: "2",
        label: "Is this a one time assistance or recurring assistance?",
        type: "options",
        options: ["One Time", "Recurring"],
        value: 500,
      },
    ],
  },
  {
    id: "ground-work",
    title: "Ground Work",
    description:
      "Be a soldier of Aditya Vahini- complete guidance of groundwork for dharm",
    pdfUrl: "/terms/design-terms.pdf",
    questions: [
      {
        id: "brand-colors",
        label:
          "Have you ever been a part of or assisted in any way in a public event?",
        type: "options",
        options: ["yes", "no"],
      },
      {
        id: "design-goals",
        label:
          "Have you ever been in a situation where you had to deal with public or law enforcement institution like court, police, bureaucrats?",
        type: "textarea",
      },
      {
        id: "design-goals",
        label:
          "On a scale of 1 to 5 describe your leadership ability, with 1 being low and 5 being very high",
        type: "text",
      },
      {
        id: "design-goals",
        label: "What do you understand by dharm? Explain in about 50 words.",
        type: "textarea",
      },
      {
        id: "design-goals",
        label:
          "On a scale of 1 to 5 describe your dharmik ability, with 1 being low and 5 being very high",
        type: "text",
      },
    ],
  },
  {
    id: "online-assistance",
    title: "Online Assistance",
    description: "Volunteer for expertise specific skill related contribution",
    pdfUrl: "/terms/design-terms.pdf",
    questions: [
      {
        id: "brand-colors",
        label: "Select the skills you're experienced /  confident in.",
        type: "options",
        options: [
          "Poster-Animation Creation",
          "Communication",
          "Video Editing",
          "Media Production",
          "Content Creation",
          "Web Development",
          "Legal",
        ],
      },
      {
        id: "design-goals",
        label:
          "On a scale of 1 to 5 describe your dharmik ability, with 1 being low and 5 being very high",
        type: "text",
      },
    ],
  },
];
