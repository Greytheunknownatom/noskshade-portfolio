'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseStudent';

export default function CaseStudentPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-hcstudent" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
