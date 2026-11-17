'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/Home';

export default function HomePage() {
  return <LegacyShell page="home">{(v) => <Section v={v} />}</LegacyShell>;
}
