'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseKoynx';

export default function CaseKoynxPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-koynx" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
