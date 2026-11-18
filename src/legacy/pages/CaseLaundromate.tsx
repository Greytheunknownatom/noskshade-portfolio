'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseLaundromate';

export default function CaseLaundromatePage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-laundromate" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
