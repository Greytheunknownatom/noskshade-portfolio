'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseHillcross';

export default function CaseHillcrossPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-hillcross" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
