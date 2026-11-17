'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseLaundromate';

export default function CaseLaundromatePage() {
  return <LegacyShell page="case-laundromate">{(v) => <Section v={v} />}</LegacyShell>;
}
