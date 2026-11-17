'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/Work';

export default function WorkPage() {
  return <LegacyShell page="work">{(v) => <Section v={v} />}</LegacyShell>;
}
