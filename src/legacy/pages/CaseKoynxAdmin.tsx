'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseKoynxAdmin';

export default function CaseKoynxAdminPage({ ov }: { ov?: any }) {
  return <LegacyShell page="case-koynx-admin" ov={ov}>{(v) => <Section v={v} />}</LegacyShell>;
}
