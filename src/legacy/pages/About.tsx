'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/About';

export default function AboutPage({ ov }: { ov?: any }) {
  return <LegacyShell page="about" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
