'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/Contact';

export default function ContactPage() {
  return <LegacyShell page="contact">{(v) => <Section v={v} />}</LegacyShell>;
}
