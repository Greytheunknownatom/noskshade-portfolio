'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/Work';

export default function WorkPage({ ov }: { ov?: any }) {
  return <LegacyShell page="work" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
