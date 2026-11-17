'use client';
import LegacyShell from '../LegacyShell';
import Section from '../sections/CaseKoynxAdmin';

export default function CaseKoynxAdminPage() {
  return <LegacyShell page="case-koynx-admin">{(v) => <Section v={v} />}</LegacyShell>;
}
