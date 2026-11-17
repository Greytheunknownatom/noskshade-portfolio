'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseTeacher';

export default function CaseTeacherPage() {
  return <LegacyShell page="case-hcteacher">{(v) => <Section v={v} />}</LegacyShell>;
}
