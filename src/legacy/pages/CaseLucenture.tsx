'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseLucenture';

export default function CaseLucenturePage() {
  return <LegacyShell page="case-lucenture">{(v) => <Section v={v} />}</LegacyShell>;
}
