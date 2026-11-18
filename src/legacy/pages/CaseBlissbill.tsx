'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseBlissbill';

export default function CaseBlissbillPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-blissbill" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
