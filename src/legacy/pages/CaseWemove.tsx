'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseWemove';

export default function CaseWemovePage() {
  return <LegacyShell page="case-wemove">{(v) => <Section v={v} />}</LegacyShell>;
}
