'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseWemove';

export default function CaseWemovePage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-wemove" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
