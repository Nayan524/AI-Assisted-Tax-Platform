export type MockTaxDocument = {
  id: string
  form: string
  title: string
  subtitle: string
  meta: string
  url: string
}

const recipients = ['Maya Flores', 'Daniel Flores', 'Maya and Daniel Flores', 'Maya Flores', 'Daniel Flores']

const documentGroups = [
  { slug: 'w2', form: 'W-2', title: '2025 W-2', issuers: ['Summit Retail Group', 'Bayline Technologies', 'Redwood Learning', 'Pacific Culinary Co.', 'Civic Design Studio'] },
  { slug: '1099-int', form: '1099-INT', title: '2025 1099-INT', issuers: ['Golden State Credit Union', 'Harbor National Bank', 'Oakline Savings', 'Metro Community Bank', 'Pioneer Online Bank'] },
  { slug: '1099-nec', form: '1099-NEC', title: '2025 1099-NEC', issuers: ['Atlas Creative Partners', 'Juniper Media LLC', 'Westline Consulting', 'Market Street Labs', 'Silver Coast Events'] },
  { slug: '1098', form: '1098', title: '2025 Form 1098', issuers: ['Coastal Mortgage', 'Evergreen Home Finance', 'Union Lending Group', 'North Bay Mortgage', 'Crescent Loan Services'] },
  { slug: '1095-a', form: '1095-A', title: '2025 Form 1095-A', issuers: ['California Health Exchange', 'BayCare Marketplace', 'Golden Health Exchange', 'Pacific Health Marketplace', 'Community Coverage Exchange'] },
  { slug: 'k1', form: 'K-1', title: '2025 Schedule K-1', issuers: ['Flores Family Ventures', 'Market Square Partners', 'Harborview Holdings', 'Juniper Street Fund', 'North Coast Partnership'] },
  { slug: 'brokerage', form: '1099-B', title: '2025 Brokerage Summary', issuers: ['Harbor Investments', 'Pioneer Brokerage', 'Summit Securities', 'Redwood Wealth', 'Bayline Financial'] },
  { slug: 'property-tax', form: 'TAX', title: '2025 Property Tax Statement', issuers: ['San Francisco County', 'Alameda County', 'Marin County', 'San Mateo County', 'Contra Costa County'] },
  { slug: 'charity', form: 'GIFT', title: '2025 Charitable Receipt', issuers: ['Community Food Network', 'Bay Area Arts Fund', 'Coastal Habitat Alliance', 'City Youth Foundation', 'Regional Medical Fund'] },
  { slug: 'estimated-tax', form: '1040-ES', title: '2025 Estimated Tax Payment', issuers: ['IRS Direct Pay - Q1', 'IRS Direct Pay - Q2', 'IRS Direct Pay - Q3', 'IRS Direct Pay - Q4', 'California FTB Payment'] },
] as const

export const additionalDocuments: MockTaxDocument[] = documentGroups.flatMap(group =>
  group.issuers.map((issuer, index) => ({
    id: `${group.slug}-${index + 1}`,
    form: group.form,
    title: group.title,
    subtitle: `${issuer} · ${recipients[index]}`,
    meta: `Uploaded Aug ${19 + ((index + documentGroups.indexOf(group)) % 9)}`,
    url: `/mock-${group.slug}-${String(index + 1).padStart(2, '0')}.pdf`,
  })),
)
