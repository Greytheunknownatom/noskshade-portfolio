'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseKoynx';

export default function CaseKoynxPage() {
  return <LegacyShell page="case-koynx">{(v) => <Section v={v} />}</LegacyShell>;
}
