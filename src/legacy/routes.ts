// Old page ids (from the single-file site) ↔ real URLs on the new site.
export const CASE_SLUGS: Record<string, string> = {
  'case-koynx': 'koynx',
  'case-koynx-admin': 'koynx-admin',
  'case-hillcross': 'hillcross-college-website',
  'case-hcstudent': 'hillcross-student-dashboard',
  'case-hcteacher': 'hillcross-teacher-dashboard',
  'case-hcportal': 'hillcross-university-student-portal',
  'case-wemove': 'wemove-fitness',
  'case-lucenture': 'lucenture-consult',
  'case-heatbud': 'heatbud',
  'case-blissbill': 'blissbill',
  'case-laundromate': 'laundromate',
};

export function pathFor(page: string): string {
  if (!page || page === 'home') return '/';
  if (page.startsWith('post-')) return `/blog/${page.slice(5)}`;
  if (page.startsWith('case-')) return `/work/${CASE_SLUGS[page] ?? page.slice(5)}`;
  return `/${page}`;
}
