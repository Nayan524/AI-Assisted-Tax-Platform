export type AiReview = {
  action: string
  confidence: number
  uncertainty: 'Low' | 'Moderate' | 'High'
  summary: string
  rationale: string
  evidence: string[]
  suggestedValue: string
}

const reviews: Record<string, AiReview> = {
  'Federal income tax withheld': {
    action: 'Compare Box 2 with the source and verify or correct the value.', confidence: 82, uncertainty: 'Moderate',
    summary: 'AI extracted Box 2 and flagged it for professional review.',
    rationale: 'The value is legible, but withholding is higher than the expected pattern for the reported wages.',
    evidence: ['W-2, page 1, Box 2 reads 12636.00', 'Box 1 wages read 86420.00', 'Withholding is 14.6% of wages'],
    suggestedValue: '$12,636.00',
  },
  'Wages, tips, other compensation': {
    action: 'Confirm the highlighted Box 1 value.', confidence: 98, uncertainty: 'Low',
    summary: 'AI extracted and formatted the Box 1 wage amount.',
    rationale: 'The printed value is clear and passed numeric consistency checks.',
    evidence: ['W-2, page 1, Box 1 reads 86420.00', 'No conflicting wage value was found'],
    suggestedValue: '$86,420.00',
  },
}

export function getMockAiReview(label: string, currentValue: string): AiReview {
  return reviews[label] || {action:'Review the source evidence before confirming.',confidence:91,uncertainty:'Low',summary:'AI mapped the source value into the return field.',rationale:'The source label and extracted value matched the expected field.',evidence:['The linked source is available below'],suggestedValue:currentValue}
}
