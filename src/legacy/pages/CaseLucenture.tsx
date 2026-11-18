'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseLucenture';

export default function CaseLucenturePage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-lucenture" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
