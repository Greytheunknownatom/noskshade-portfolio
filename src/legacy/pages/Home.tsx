'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/Home';

export default function HomePage({ ov }: { ov?: any }) {
  return <LegacyShell page="home" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
