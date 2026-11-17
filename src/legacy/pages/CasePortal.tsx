'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CasePortal';

export default function CasePortalPage() {
  return <LegacyShell page="case-hcportal">{(v) => <Section v={v} />}</LegacyShell>;
}
