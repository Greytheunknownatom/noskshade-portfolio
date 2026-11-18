'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseHeatbud';

export default function CaseHeatbudPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-heatbud" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
