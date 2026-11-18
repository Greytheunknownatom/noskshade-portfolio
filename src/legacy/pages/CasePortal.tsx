'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CasePortal';

export default function CasePortalPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-hcportal" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
