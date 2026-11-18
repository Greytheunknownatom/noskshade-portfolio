'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/Contact';

export default function ContactPage({ ov }: { ov?: any }) {
  return <LegacyShell page="contact" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
