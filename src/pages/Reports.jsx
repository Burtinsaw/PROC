import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, Grid, LinearProgress, Typography } from '@mui/material';
import { getFinanceAging, getFinanceCashflow, getSpendBySupplier, getLogisticsKPIs, getPOStatusBreakdown, getCompanyTypeSummary } from '../api/reports';

function Section({ title, children, loading }){
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title={title} />
      {loading ? <LinearProgress /> : null}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default function Reports(){
  const qAging = useQuery({ queryKey: ['reports','aging'], queryFn: ()=> getFinanceAging({}) });
  const qCash = useQuery({ queryKey: ['reports','cashflow'], queryFn: ()=> getFinanceCashflow({ months: 6 }) });
  const qSpend = useQuery({ queryKey: ['reports','spend-supplier'], queryFn: ()=> getSpendBySupplier({}) });
  const qKpi = useQuery({ queryKey: ['reports','logistics-kpi'], queryFn: ()=> getLogisticsKPIs() });
  const qPO = useQuery({ queryKey: ['reports','po-status'], queryFn: ()=> getPOStatusBreakdown() });
  const qCompany = useQuery({ queryKey: ['reports','company-types'], queryFn: ()=> getCompanyTypeSummary() });

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Section title="Finance Aging" loading={qAging.isLoading}>
          <pre style={{ margin:0 }}>{JSON.stringify(qAging.data, null, 2)}</pre>
        </Section>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Section title="Cashflow (6 ay)" loading={qCash.isLoading}>
          <pre style={{ margin:0 }}>{JSON.stringify(qCash.data, null, 2)}</pre>
        </Section>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Section title="Tedarikçiye Göre Harcama" loading={qSpend.isLoading}>
          <pre style={{ margin:0 }}>{JSON.stringify(qSpend.data, null, 2)}</pre>
        </Section>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Section title="Lojistik KPI" loading={qKpi.isLoading}>
          <pre style={{ margin:0 }}>{JSON.stringify(qKpi.data, null, 2)}</pre>
        </Section>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Section title="PO Durum Dağılımı" loading={qPO.isLoading}>
          <pre style={{ margin:0 }}>{JSON.stringify(qPO.data, null, 2)}</pre>
        </Section>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Section title="Firma Tip Özeti" loading={qCompany.isLoading}>
          <pre style={{ margin:0 }}>{JSON.stringify(qCompany.data, null, 2)}</pre>
        </Section>
      </Grid>
    </Grid>
  );
}
