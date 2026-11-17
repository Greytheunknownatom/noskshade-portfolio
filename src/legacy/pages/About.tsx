'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/About';

export default function AboutPage() {
  return <LegacyShell page="about">{(v) => <Section v={v} />}</LegacyShell>;
}
