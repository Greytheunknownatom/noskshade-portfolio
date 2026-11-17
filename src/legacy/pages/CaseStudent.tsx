'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseStudent';

export default function CaseStudentPage() {
  return <LegacyShell page="case-hcstudent">{(v) => <Section v={v} />}</LegacyShell>;
}
