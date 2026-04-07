import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, formatMoney, statusTone } from '../../utils/actorSpaces';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments').then(({ data }) => {
      setPayments(data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Paiements" description="Suivi des encaissements Stripe et des paiements rattaches aux commandes." />
      <Panel title="Transactions" subtitle="Historique recent">
        {loading ? <LoadingBlock label="Chargement des paiements..." /> : null}
        {!loading && payments.length === 0 ? (
          <EmptyBlock label="Aucun paiement." />
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{formatLabel(payment.method)}</div>
                  <div className="mt-1 text-sm text-charcoal/65">Commande #{payment.order?.id || '-'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={statusTone(payment.status)}>{formatLabel(payment.status)}</StatusPill>
                  <span className="font-semibold">{formatMoney(payment.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
