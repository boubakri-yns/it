import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime } from '../../utils/actorSpaces';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/logs').then(({ data }) => {
      setLogs(data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Logs d'activite" description="Journal des actions critiques effectuees sur la plateforme." />
      <Panel title="Evenements recents" subtitle="Trace d'activite">
        {loading ? <LoadingBlock label="Chargement des logs..." /> : null}
        {!loading && logs.length === 0 ? (
          <EmptyBlock label="Aucun log d'activite." />
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{log.user ? `${log.user.prenom} ${log.user.nom}` : 'Systeme'}</div>
                  <div className="mt-1 text-sm text-charcoal/65">
                    {log.action} - {log.description}
                  </div>
                </div>
                <StatusPill tone="neutral">{formatDateTime(log.created_at)}</StatusPill>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
