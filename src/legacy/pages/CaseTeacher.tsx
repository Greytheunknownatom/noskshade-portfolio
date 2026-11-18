'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseTeacher';

export default function CaseTeacherPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-hcteacher" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
