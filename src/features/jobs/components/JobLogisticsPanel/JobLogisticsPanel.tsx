import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CUSTOMS_EXAMINATION_RESULTS, CUSTOMS_STATUSES } from '../../constants/job.constants';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import {
  useJobCustomsExaminations,
  useJobDamageReports,
  useJobDeposits,
  useJobFreeDays,
  useJobPartDeliveries,
  useJobPods,
  useJobSubJobs,
} from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { jobDisplayNumber } from '../../utils/jobRoute';

interface JobLogisticsPanelProps {
  jobId: string;
  jobType?: string;
}

export function JobLogisticsPanel({ jobId, jobType }: JobLogisticsPanelProps) {
  const isAirImport = jobType === 'AIR_IMPORT';
  const mutations = useJobSubresourceMutations(jobId);
  const { data: deposits = [], refetch: refetchDeposits } = useJobDeposits(jobId);
  const { data: freeDays = [], refetch: refetchFreeDays } = useJobFreeDays(jobId);
  const { data: damageReports = [], refetch: refetchDamage } = useJobDamageReports(jobId);
  const { data: partDeliveries = [], refetch: refetchParts } = useJobPartDeliveries(jobId);
  const { data: pods = [], refetch: refetchPods } = useJobPods(jobId);
  const { data: subJobs = [], refetch: refetchSubJobs } = useJobSubJobs(jobId);
  const {
    data: customsExaminations = [],
    refetch: refetchCustomsExaminations,
  } = useJobCustomsExaminations(jobId, isAirImport);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [depositType, setDepositType] = useState('CONTAINER');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('AED');

  const [freeContainerId, setFreeContainerId] = useState('');
  const [freeDaysAllowed, setFreeDaysAllowed] = useState('7');

  const [damageDesc, setDamageDesc] = useState('');
  const [partDate, setPartDate] = useState('');
  const [partPackages, setPartPackages] = useState('');
  const [podDate, setPodDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customsStatus, setCustomsStatus] =
    useState<(typeof CUSTOMS_STATUSES)[number]>('PENDING');
  const [cfsAsOf, setCfsAsOf] = useState('');
  const [cfsResult, setCfsResult] = useState<unknown>(null);
  const [exportJobId, setExportJobId] = useState('');
  const [airExportJobId, setAirExportJobId] = useState('');
  const [subCommodity, setSubCommodity] = useState('');
  const [airStorageAsOf, setAirStorageAsOf] = useState('');
  const [airStorageResult, setAirStorageResult] = useState<unknown>(null);
  const [examDate, setExamDate] = useState('');
  const [examResult, setExamResult] =
    useState<(typeof CUSTOMS_EXAMINATION_RESULTS)[number]>('HELD');
  const [examOfficer, setExamOfficer] = useState('');
  const [examRemarks, setExamRemarks] = useState('');

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}

      {isAirImport && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Air import storage</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
              <Input
                type="date"
                value={airStorageAsOf}
                onChange={(e) => setAirStorageAsOf(e.target.value)}
                placeholder="As of date"
              />
              <Button
                type="button"
                disabled={mutations.getStorageCalculation.isPending}
                onClick={() =>
                  run(async () => {
                    const result = await mutations.getStorageCalculation.mutateAsync(
                      airStorageAsOf ? { as_of_date: airStorageAsOf } : {},
                    );
                    setAirStorageResult(result);
                  }, 'Storage calculated.')
                }
              >
                Calculate storage
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={mutations.createStorageInvoice.isPending}
                onClick={() =>
                  run(
                    () => mutations.createStorageInvoice.mutateAsync(),
                    'Draft storage invoice created.',
                  )
                }
              >
                Create storage invoice
              </Button>
              {airStorageResult != null && (
                <pre className="sm:col-span-2 text-xs overflow-auto max-h-32">
                  {JSON.stringify(airStorageResult, null, 2)}
                </pre>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customs examinations ({customsExaminations.length})</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 space-y-3">
              {customsExaminations.length === 0 ? (
                <p className="text-sm text-[var(--color-neutral-400)]">
                  No examination records.
                </p>
              ) : (
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(customsExaminations, null, 2)}
                </pre>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
                <select
                  className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                  value={examResult}
                  onChange={(e) =>
                    setExamResult(
                      e.target.value as (typeof CUSTOMS_EXAMINATION_RESULTS)[number],
                    )
                  }
                >
                  {CUSTOMS_EXAMINATION_RESULTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Examining officer"
                  value={examOfficer}
                  onChange={(e) => setExamOfficer(e.target.value)}
                />
                <Input
                  placeholder="Remarks"
                  value={examRemarks}
                  onChange={(e) => setExamRemarks(e.target.value)}
                />
              </div>
              <Button
                type="button"
                disabled={!examDate || mutations.createCustomsExamination.isPending}
                onClick={() =>
                  run(async () => {
                    await mutations.createCustomsExamination.mutateAsync({
                      examination_date: examDate,
                      result: examResult,
                      examining_officer: examOfficer.trim() || undefined,
                      remarks: examRemarks.trim() || undefined,
                    });
                    setExamRemarks('');
                    refetchCustomsExaminations();
                  }, 'Customs examination recorded.')
                }
              >
                Record examination
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Air transhipment link</CardTitle>
            </CardHeader>
            <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Export job UUID *"
                value={airExportJobId}
                onChange={(e) => setAirExportJobId(e.target.value)}
              />
              <Button
                type="button"
                disabled={!airExportJobId || mutations.linkAirTranshipment.isPending}
                onClick={() =>
                  run(
                    () =>
                      mutations.linkAirTranshipment.mutateAsync({
                        export_job_id: airExportJobId.trim(),
                      }),
                    'Air transhipment linked.',
                  )
                }
              >
                Link air transhipment
              </Button>
            </div>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customs status</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 flex flex-wrap gap-2 items-end">
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={customsStatus}
            onChange={(e) =>
              setCustomsStatus(e.target.value as (typeof CUSTOMS_STATUSES)[number])
            }
          >
            {CUSTOMS_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button
            type="button"
            disabled={mutations.updateCustomsStatus.isPending}
            onClick={() =>
              run(
                () =>
                  mutations.updateCustomsStatus.mutateAsync({
                    customs_status: customsStatus,
                  }),
                'Customs status updated.',
              )
            }
          >
            Update customs status
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CFS storage</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            type="date"
            value={cfsAsOf}
            onChange={(e) => setCfsAsOf(e.target.value)}
            placeholder="As of date"
          />
          <Button
            type="button"
            disabled={mutations.calculateCfsStorage.isPending}
            onClick={() =>
              run(async () => {
                const result = await mutations.calculateCfsStorage.mutateAsync(
                  cfsAsOf ? { as_of_date: cfsAsOf } : {},
                );
                setCfsResult(result);
              }, 'CFS storage calculated.')
            }
          >
            Calculate CFS storage
          </Button>
          {cfsResult != null && (
            <pre className="sm:col-span-2 text-xs overflow-auto max-h-32">
              {JSON.stringify(cfsResult, null, 2)}
            </pre>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transhipment link</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="Export job UUID *"
            value={exportJobId}
            onChange={(e) => setExportJobId(e.target.value)}
          />
          <Button
            type="button"
            disabled={!exportJobId || mutations.linkTranshipment.isPending}
            onClick={() =>
              run(
                () =>
                  mutations.linkTranshipment.mutateAsync({
                    export_job_id: exportJobId.trim(),
                  }),
                'Transhipment linked.',
              )
            }
          >
            Link transhipment
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deposits ({deposits.length})</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {deposits.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No deposits.</p>
          ) : (
            deposits.map((raw) => {
              const d = raw as {
                id: string;
                deposit_type?: string;
                deposit_amount?: number;
                currency_code?: string;
              };
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-2 text-sm border-b border-[var(--color-neutral-100)] py-2"
                >
                  <span>
                    {d.deposit_type} · {d.deposit_amount} {d.currency_code || ''}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      run(async () => {
                        await mutations.deleteDeposit.mutateAsync(d.id);
                        refetchDeposits();
                      }, 'Deposit removed.')
                    }
                  >
                    Remove
                  </Button>
                </div>
              );
            })
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              placeholder="Deposit type *"
              value={depositType}
              onChange={(e) => setDepositType(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Amount *"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Input
              placeholder="Currency"
              value={depositCurrency}
              onChange={(e) => setDepositCurrency(e.target.value.toUpperCase())}
            />
          </div>
          <Button
            type="button"
            disabled={
              !depositType || !depositAmount || mutations.createDeposit.isPending
            }
            onClick={() =>
              run(async () => {
                await mutations.createDeposit.mutateAsync({
                  deposit_type: depositType.trim(),
                  deposit_amount: Number(depositAmount),
                  currency_code: depositCurrency || undefined,
                });
                setDepositAmount('');
                refetchDeposits();
              }, 'Deposit added.')
            }
          >
            Add deposit
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Free days</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          <pre className="text-xs overflow-auto max-h-32">
            {freeDays.length ? JSON.stringify(freeDays, null, 2) : 'No free-days records.'}
          </pre>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Container UUID *"
              value={freeContainerId}
              onChange={(e) => setFreeContainerId(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Free days allowed"
              value={freeDaysAllowed}
              onChange={(e) => setFreeDaysAllowed(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={!freeContainerId || mutations.upsertFreeDays.isPending}
              onClick={() =>
                run(async () => {
                  await mutations.upsertFreeDays.mutateAsync({
                    container_id: freeContainerId.trim(),
                    free_days_allowed: freeDaysAllowed
                      ? Number(freeDaysAllowed)
                      : undefined,
                  });
                  refetchFreeDays();
                }, 'Free days saved.')
              }
            >
              Upsert free days
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={mutations.recalculateFreeDays.isPending}
              onClick={() =>
                run(async () => {
                  await mutations.recalculateFreeDays.mutateAsync();
                  refetchFreeDays();
                }, 'Free days recalculated.')
              }
            >
              Recalculate
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Damage reports ({damageReports.length})</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {damageReports.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No damage reports.</p>
          ) : (
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(damageReports, null, 2)}
            </pre>
          )}
          <Input
            placeholder="Damage description *"
            value={damageDesc}
            onChange={(e) => setDamageDesc(e.target.value)}
          />
          <Button
            type="button"
            disabled={!damageDesc.trim() || mutations.createDamageReport.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createDamageReport.mutateAsync({
                  damage_description: damageDesc.trim(),
                });
                setDamageDesc('');
                refetchDamage();
              }, 'Damage report created.')
            }
          >
            Add damage report
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Part deliveries ({partDeliveries.length})</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {partDeliveries.length > 0 && (
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(partDeliveries, null, 2)}
            </pre>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="date"
              value={partDate}
              onChange={(e) => setPartDate(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Packages delivered *"
              value={partPackages}
              onChange={(e) => setPartPackages(e.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={
              !partDate || !partPackages || mutations.createPartDelivery.isPending
            }
            onClick={() =>
              run(async () => {
                await mutations.createPartDelivery.mutateAsync({
                  delivery_date: partDate,
                  packages_delivered: Number(partPackages),
                });
                setPartPackages('');
                refetchParts();
              }, 'Part delivery recorded.')
            }
          >
            Add part delivery
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proof of delivery ({pods.length})</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {pods.length > 0 && (
            <pre className="text-xs overflow-auto max-h-32">
              {JSON.stringify(pods, null, 2)}
            </pre>
          )}
          <Input type="date" value={podDate} onChange={(e) => setPodDate(e.target.value)} />
          <Button
            type="button"
            disabled={!podDate || mutations.createPod.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createPod.mutateAsync({
                  actual_delivery_date: podDate,
                });
                refetchPods();
              }, 'POD recorded.')
            }
          >
            Add POD
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment request</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <Input
            type="number"
            placeholder="Amount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <Button
            type="button"
            disabled={mutations.createPaymentRequest.isPending}
            onClick={() =>
              run(
                () =>
                  mutations.createPaymentRequest.mutateAsync(
                    paymentAmount
                      ? { amount: Number(paymentAmount), currency_code: 'AED' }
                      : {},
                  ),
                'Payment request created.',
              )
            }
          >
            Create payment request
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sub-jobs ({subJobs.length})</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          {subJobs.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No sub-jobs.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {subJobs.map((j) => (
                <li key={j.id}>{jobDisplayNumber(j)}</li>
              ))}
            </ul>
          )}
          <Input
            placeholder="Commodity (optional)"
            value={subCommodity}
            onChange={(e) => setSubCommodity(e.target.value)}
          />
          <Button
            type="button"
            disabled={mutations.createSubJob.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createSubJob.mutateAsync(
                  subCommodity.trim() ? { commodity: subCommodity.trim() } : {},
                );
                setSubCommodity('');
                refetchSubJobs();
              }, 'Sub-job created.')
            }
          >
            Create sub-job
          </Button>
        </div>
      </Card>
    </div>
  );
}
