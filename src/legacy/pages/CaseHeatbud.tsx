'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseHeatbud';

export default function CaseHeatbudPage() {
  return <LegacyShell page="case-heatbud">{(v) => <Section v={v} />}</LegacyShell>;
}
