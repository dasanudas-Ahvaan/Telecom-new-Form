export const serviceChoices = [
  {
    id: "ahvn-dharmik-class",
    title: "Ahvaan Dharmik Classes",
    description: "The study of dharmik books and dharm philosophy under the guidance of Shivansh Narayan Dwivedi Ji",
    pdfUrl: "/terms/web-development.pdf", 
    questions: [
      {
        id: "dharmik-reason", // Unique ID
        label: "Why are you joining these classes?",
        type: "options",
        options: ["To understand Ishvar", "To worship Ishvar correctly", "For being a protector of dharm", "All of the above"],
      },
      {
        id: "dharmik-past-association", // Unique ID
        label: "Name any propaganda or cult related to Ishvar or Dharm, you were associated to in the past. If not, mention NA",
        type: "textarea",
      },
    ],
  },
  {
    id: "ahvn-naam astra",
    title: "Ahvaan Naam astra",
    description: "Daily naam jap in five sessions along with other devotional means through online mode- As per instruction of Pujya Gurudev Puri Shankaracharya.",
    pdfUrl: "/terms/seo-services.pdf",
    questions: [
      {
        id: "naam-past-association", // Unique ID
        label: "Name any propaganda or cult related to Ishvar or Dharm, you were associated to in the past. If not, mention NA",
        type: "textarea",
      },
    ],
  },
  {
    id: "financial-assistance",
    title: "Financial Assistance",
    description: "Monetory contribution for dharm",
    pdfUrl: "/terms/design-terms.pdf",
    questions: [
      {
        id: "finance-past-association", // Unique ID
        label: "Name any propaganda or cult related to Ishvar or Dharm, you were associated to in the past. If not, mention NA",
        type: "textarea",
      },
      {
        id: "finance-frequency", // Unique ID
        label: "Is this a one time assistance or recurring assistance?",
        type: "options",
        options: ["One Time", "Recurring"],
      },
    ],
  },
  {
    id: "ground-work",
    title: "Ground Work",
    description: "Be a soldier of Aditya Vahini, get complete guidance for fieldwork",
    pdfUrl: "/terms/design-terms.pdf",
    questions: [
      {
        id: "gw-public-event", // Unique ID
        label: "Have you ever been a part of or assisted in any way in a public event?",
        type: "options",
        options: ["yes", "no"],
      },
      {
        id: "gw-law-experience", // Unique ID
        label: "Have you ever been in a situation where you had to deal with public or law enforcement agencies like police, judiciary etc.",
        type: "textarea",
      },
      {
        id: "gw-leadership-scale", // Unique ID
        label: "On a scale of 1 to 5 describe your leadership ability. With 1 being the least and 5 being the highest.",
        type: "text",
      },
      {
        id: "gw-dharm-definition", // Unique ID
        label: "What do you understand by dharm? Explain in about 50 words.",
        type: "textarea",
      },
      {
        id: "gw-dharmik-scale", // Unique ID
        label: "On a scale of 1 to 5 describe your dharmik ability. With 1 being the least and 5 being the highest.",
        type: "text",
      },
    ],
  },
  {
    id: "online-assistance",
    title: "Online Assistance",
    description: "Volunteer for expertise specific skill related contribution.",
    pdfUrl: "/terms/design-terms.pdf",
    questions: [
      {
        id: "online-skills", // Unique ID
        label: "Select the skills you're experienced / confident in.",
        type: "options",
        options: ["Poster-Animation Creation", "Communication", "Video Editing", "Media Production", "Content Creation", "Web Development", "Legal"],
      },
      {
        id: "online-dharmik-scale", // Unique ID
        label: "On a scale of 1 to 5 describe your dharmik ability. With 1 being the least and 5 being the highest.",
        type: "text",
      },
    ],
  },
];