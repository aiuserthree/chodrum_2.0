/* FO-11 개인정보처리방침 — ChodrumLegal (BO 약관관리와 동일 본문 · v1.0) */
const DS = window.DrumSheetStoreDesignSystem_3a2462;
const { Card, Badge } = DS;
const F = window.FO;

function PrivacyPage() {
  const doc = F.legalDoc('privacy') || { name: '개인정보처리방침', ver: 'v1.0', date: '2026.07.14', body: '' };
  return (
    <F.Scaffold title="개인정보처리방침" back={F.PAGES.home} width="mid">
      <div data-screen-label="FO-11 개인정보처리방침" style={{ padding: '28px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)', letterSpacing: '-0.9px' }}>{doc.name}</h2>
          <Badge variant="outline" size="sm">{doc.ver}</Badge>
        </div>
        <p className="ds-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>시행일 {doc.date}</p>
        <Card padding={20} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {doc.body}
          </div>
        </Card>
      </div>
    </F.Scaffold>
  );
}
window.ChodrumBoot.whenReady(() => {
  ReactDOM.createRoot(document.getElementById('app')).render(<PrivacyPage />);
});
