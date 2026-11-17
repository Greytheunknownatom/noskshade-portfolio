'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseHillcross';

export default function CaseHillcrossPage() {
  return <LegacyShell page="case-hillcross">{(v) => <Section v={v} />}</LegacyShell>;
}
