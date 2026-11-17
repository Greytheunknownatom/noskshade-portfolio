'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseBlissbill';

export default function CaseBlissbillPage() {
  return <LegacyShell page="case-blissbill">{(v) => <Section v={v} />}</LegacyShell>;
}
