export type QuestionKind = 'single' | 'multi' | 'text'

export interface Question {
  id: string
  number: number
  section: SectionId
  title: string
  kind: QuestionKind
  /** Max selections for multi-select questions. */
  max?: number
  options?: string[]
  /** When true, the last option is "Other" and reveals a free-text input. */
  allowOther?: boolean
  /** Options are derived from another question's answers. */
  optionsFrom?: string
  optional?: boolean
  placeholder?: string
}

export type SectionId = 'about' | 'challenges' | 'features' | 'adoption'

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'about', label: 'About you' },
  { id: 'challenges', label: 'Challenges & goals' },
  { id: 'features', label: 'Features' },
  { id: 'adoption', label: 'Adoption' },
]

export const OTHER = 'Other'

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    number: 1,
    section: 'about',
    title: 'What is your role within the organization?',
    kind: 'single',
    allowOther: true,
    options: [
      'Founder / CEO / Managing Director',
      'HR / People & Culture',
      'Marketing / Communications',
      'Employer Branding / Internal Communications',
      'Digital / Social Media',
      OTHER,
    ],
  },
  {
    id: 'q2',
    number: 2,
    section: 'about',
    title: 'Approximately how many employees does your organization have?',
    kind: 'single',
    options: ['Fewer than 50', '50–249', '250–999', '1,000–4,999', '5,000+'],
  },
  {
    id: 'q3',
    number: 3,
    section: 'about',
    title: 'What industry does your organization operate in?',
    kind: 'single',
    allowOther: true,
    options: [
      'Government / Public Sector',
      'Financial Services',
      'Technology',
      'Telecommunications',
      'Retail / E-commerce',
      'Healthcare',
      'Hospitality / Tourism',
      'Real Estate',
      'Professional Services',
      'Media / Entertainment',
      OTHER,
    ],
  },
  {
    id: 'q4',
    number: 4,
    section: 'challenges',
    title: 'What are the biggest challenges your organization currently faces?',
    kind: 'multi',
    max: 3,
    allowOther: true,
    options: [
      'Low employee engagement',
      'Difficulty keeping employees informed',
      'Low participation in company initiatives',
      'Employees rarely share company content',
      'Difficulty motivating employees to participate',
      'Difficulty measuring employee engagement',
      'Difficulty measuring employee advocacy or social media impact',
      'Lack of a centralized platform',
      OTHER,
    ],
  },
  {
    id: 'q5',
    number: 5,
    section: 'challenges',
    title: 'What would you most want SADA to help your organization achieve?',
    kind: 'multi',
    max: 3,
    options: [
      'Increase employee engagement',
      'Improve internal communication',
      'Increase participation in company initiatives',
      'Turn employees into brand ambassadors',
      'Increase organic social media reach',
      'Strengthen employer branding',
      'Measure employee engagement and advocacy',
      'Build a stronger internal company community',
    ],
  },
  {
    id: 'q6',
    number: 6,
    section: 'features',
    title: 'Which SADA features would be most valuable to your organization?',
    kind: 'multi',
    max: 5,
    allowOther: true,
    options: [
      'Centralized company content feed',
      'Ready-to-share social media content',
      'Employee content customization',
      'Push notifications',
      'Analytics and reporting',
      'Social media reach and advocacy tracking',
      'Points and rewards',
      'Leaderboards',
      'Challenges and competitions',
      'Employee recognition and badges',
      'Surveys and polls',
      'Employee-generated content',
      'Personalized content',
      'Multilingual support',
      'LinkedIn integration',
      'Microsoft Teams / Slack integration',
      'HR system integration',
      'AI-assisted content suggestions',
      OTHER,
    ],
  },
  {
    id: 'q7',
    number: 7,
    section: 'features',
    title: 'If you could choose only ONE feature, which would be most important to your organization?',
    kind: 'single',
    optionsFrom: 'q6',
  },
  {
    id: 'q8',
    number: 8,
    section: 'features',
    title: 'Was there a feature or capability you expected to see that was missing from the demo?',
    kind: 'text',
    optional: true,
    placeholder: 'e.g. an integration, a workflow, a report you would need…',
  },
  {
    id: 'q9',
    number: 9,
    section: 'adoption',
    title: 'What would most encourage employees to regularly use SADA?',
    kind: 'multi',
    max: 3,
    allowOther: true,
    options: [
      'Easy access to useful content',
      'Personalized content',
      'Rewards and incentives',
      'Recognition from the company',
      'Challenges and competitions',
      'Leaderboards',
      'A simple and easy-to-use experience',
      'The ability to contribute their own content',
      'Regular company updates',
      OTHER,
    ],
  },
  {
    id: 'q10',
    number: 10,
    section: 'adoption',
    title: 'What would matter most when deciding whether to adopt SADA?',
    kind: 'multi',
    max: 3,
    options: [
      'Ease of use',
      'Employee adoption',
      'Measurable ROI',
      'Analytics and reporting',
      'Integrations with existing systems',
      'Security and data privacy',
      'Customization',
      'Arabic-language support',
      'Pricing',
      'Customer support',
      'Proven results / case studies',
    ],
  },
  {
    id: 'q11',
    number: 11,
    section: 'adoption',
    title: 'What would be the biggest concern or barrier preventing your organization from adopting SADA?',
    kind: 'single',
    allowOther: true,
    options: [
      'Employees may not use it',
      'Cost / budget',
      'Data privacy or security',
      'Integration with existing systems',
      'Difficulty getting internal approval',
      'Time or resources required to manage it',
      'Unclear ROI',
      'We already use another solution',
      OTHER,
    ],
  },
  {
    id: 'q12',
    number: 12,
    section: 'adoption',
    title: 'Based on what you saw, what would you be most interested in doing next?',
    kind: 'single',
    options: [
      'Test SADA through a pilot',
      'Receive a more detailed product demo',
      'Receive pricing information',
      'Learn more before deciding',
      'No current need for SADA',
    ],
  },
]

export function selectionHint(q: Question): string | null {
  if (q.kind === 'single') return 'Select one'
  if (q.kind === 'multi') return `Select up to ${q.max === 3 ? 'three' : q.max === 5 ? 'five' : q.max}`
  return null
}
