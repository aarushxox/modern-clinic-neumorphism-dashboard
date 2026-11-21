import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Phone,
  Bell,
  Check,
  ArrowUpRight,
  Clock,
  User,
} from 'lucide-react';
import { PatientRecord } from '../types/clinic';

export interface DailyAppointmentItem {
  id: string;
  sno: number;
  patientName: string;
  phone: string;
  timeSlot: string;
  diagnosis: string;
  queueState: 'Arriving Soon' | 'Upcoming' | 'Checked In';
  ageSexLabel: string;
  patient: PatientRecord | null;
}

interface DailyAppointmentsWidgetProps {
  clinicDate: string;
  appointments: DailyAppointmentItem[];
  onSelectPatient: (patient: PatientRecord) => void;
  onOpenSchedule: () => void;
  onCallPatient: (appointment: DailyAppointmentItem) => void;
  onNotifyPatient: (appointment: DailyAppointmentItem) => void;
  onNotifyAllUpcoming: (appointments: DailyAppointmentItem[]) => void;
}

export const DailyAppointmentsWidget: React.FC<DailyAppointmentsWidgetProps> = ({
  clinicDate,
  appointments,
  onSelectPatient,
  onOpenSchedule,
  onCallPatient,
  onNotifyPatient,
  onNotifyAllUpcoming,
}) => {
  const [viewFilter, setViewFilter] = useState<'UPCOMING' | 'ALL'>('UPCOMING');
  const [calledIds, setCalledIds] = useState<Record<string, boolean>>({});
  const [notifiedIds, setNotifiedIds] = useState<Record<string, boolean>>({});

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.queueState !== 'Checked In'),
    [appointments]
  );

  const visibleAppointments = useMemo(() => {
    const source = viewFilter === 'UPCOMING' ? upcomingAppointments : appointments;
    return source.slice(0, 6);
  }, [appointments, upcomingAppointments, viewFilter]);

  const unnotifiedUpcoming = useMemo(
    () => upcomingAppointments.filter((a) => !notifiedIds[a.id]),
    [upcomingAppointments, notifiedIds]
  );

  const notifiedCount = useMemo(
    () => appointments.filter((a) => Boolean(notifiedIds[a.id])).length,
    [appointments, notifiedIds]
  );

  const handleCallClick = (e: React.MouseEvent, appt: DailyAppointmentItem) => {
    e.stopPropagation();
    setCalledIds((prev) => ({ ...prev, [appt.id]: true }));
    onCallPatient(appt);
  };

  const handleNotifyClick = (e: React.MouseEvent, appt: DailyAppointmentItem) => {
    e.stopPropagation();
    setNotifiedIds((prev) => ({ ...prev, [appt.id]: true }));
    onNotifyPatient(appt);
  };

  const handleNotifyAll = () => {
    if (unnotifiedUpcoming.length === 0) return;
    setNotifiedIds((prev) => {
      const next = { ...prev };
      unnotifiedUpcoming.forEach((a) => {
        next[a.id] = true;
      });
      return next;
    });
    onNotifyAllUpcoming(unnotifiedUpcoming);
  };

  const getQueueBadgeClass = (state: DailyAppointmentItem['queueState']) => {
    if (state === 'Arriving Soon') return 'badge-sand';
    if (state === 'Upcoming') return 'badge-lilac';
    return 'badge-sage';
  };

  return (
    <section
      id="dashboard-daily-appointments-widget"
      className="lg:col-span-7 neu-card rounded-[24px] p-5 sm:p-6 flex flex-col justify-between gap-4"
    >
      <div className="space-y-3.5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span
              className="w-9 h-9 rounded-full grid place-items-center shrink-0 mt-0.5"
              style={{
                background: 'var(--pastel-blue-bg)',
                color: 'var(--pastel-blue-fg)',
                boxShadow: 'var(--neu-raised-sm)',
              }}
            >
              <CalendarClock className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                  Daily Appointments
                </h2>
                <span className="badge-lilac px-2.5 py-0.5 text-[10px] font-bold font-mono tabular-nums">
                  {upcomingAppointments.length} upcoming
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Scheduled OPD queue for {clinicDate} with direct call &amp; reminder actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start">
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--surface-muted)] border border-[var(--border-subtle)]"
              role="group"
              aria-label="Filter daily appointments"
            >
              <button
                type="button"
                onClick={() => setViewFilter('UPCOMING')}
                className={`px-2.5 py-1 rounded-full text-[10.5px] transition-colors cursor-pointer ${
                  viewFilter === 'UPCOMING'
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setViewFilter('ALL')}
                className={`px-2.5 py-1 rounded-full text-[10.5px] transition-colors cursor-pointer ${
                  viewFilter === 'ALL'
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                All ({appointments.length})
              </button>
            </div>
          </div>
        </div>

        {/* Appointment Rows */}
        {visibleAppointments.length === 0 ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-[var(--border)] rounded-[20px]">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              No upcoming appointments scheduled for {clinicDate}.
            </p>
            {appointments.length > 0 && viewFilter === 'UPCOMING' && (
              <button
                type="button"
                onClick={() => setViewFilter('ALL')}
                className="text-xs font-bold hover:underline cursor-pointer"
                style={{ color: 'var(--accent-text)' }}
              >
                View all {appointments.length} appointments
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {visibleAppointments.map((appt) => {
              const isCalled = Boolean(calledIds[appt.id]);
              const isNotified = Boolean(notifiedIds[appt.id]);

              return (
                <div
                  key={appt.id}
                  onClick={() => appt.patient && onSelectPatient(appt.patient)}
                  className="p-2.5 sm:p-3 rounded-[18px] bg-[var(--surface-muted)]/60 hover:bg-[var(--surface-muted)] border border-transparent hover:border-[var(--border)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Time Slot Pill */}
                    <div className="px-2.5 py-1.5 rounded-[12px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-center shrink-0 min-w-[76px]">
                      <div className="text-[11px] font-bold font-mono tabular-nums text-[var(--text-primary)] leading-tight flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />
                        <span>{appt.timeSlot}</span>
                      </div>
                      <div className="text-[9.5px] font-mono text-[var(--text-muted)] mt-0.5">
                        #{appt.sno}
                      </div>
                    </div>

                    {/* Patient & Visit Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:underline">
                          {appt.patientName}
                        </span>
                        <span
                          className={`${getQueueBadgeClass(
                            appt.queueState
                          )} px-2 py-0.5 text-[9.5px] font-semibold shrink-0`}
                        >
                          {appt.queueState}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3 shrink-0 opacity-70" />
                        <span className="truncate">
                          {appt.ageSexLabel ? `${appt.ageSexLabel} · ` : ''}
                          {appt.diagnosis}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call & Notify Action Buttons */}
                  <div
                    className="flex items-center gap-1.5 shrink-0 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      id={`appt-call-btn-${appt.sno}`}
                      type="button"
                      onClick={(e) => handleCallClick(e, appt)}
                      className="neu-pill-btn h-8 px-3 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                      style={
                        isCalled
                          ? {
                              background: 'var(--pastel-blue-bg)',
                              color: 'var(--pastel-blue-fg)',
                            }
                          : { color: 'var(--text-primary)' }
                      }
                      title={`Call ${appt.patientName} at ${appt.phone}`}
                    >
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{isCalled ? 'Called' : 'Call'}</span>
                    </button>

                    <button
                      id={`appt-notify-btn-${appt.sno}`}
                      type="button"
                      onClick={(e) => handleNotifyClick(e, appt)}
                      className="h-8 px-3 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all border"
                      style={
                        isNotified
                          ? {
                              background: 'var(--pastel-sage-bg)',
                              color: 'var(--pastel-sage-fg)',
                              borderColor: 'var(--pastel-sage-border)',
                            }
                          : {
                              background: 'var(--accent-soft)',
                              color: 'var(--accent-text)',
                              borderColor: 'transparent',
                            }
                      }
                      title={
                        isNotified
                          ? `Re-send appointment notification to ${appt.patientName}`
                          : `Send appointment reminder to ${appt.patientName}`
                      }
                    >
                      {isNotified ? (
                        <Check className="w-3 h-3 shrink-0" />
                      ) : (
                        <Bell className="w-3 h-3 shrink-0" />
                      )}
                      <span>{isNotified ? 'Notified' : 'Notify'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Strip */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="text-[var(--text-muted)]">
          Showing {visibleAppointments.length} of{' '}
          {viewFilter === 'UPCOMING' ? upcomingAppointments.length : appointments.length} slots ·{' '}
          <strong className="text-[var(--text-primary)] font-mono tabular-nums">
            {notifiedCount}
          </strong>{' '}
          notified
        </span>

        <div className="flex items-center gap-3">
          {unnotifiedUpcoming.length > 0 && (
            <button
              id="appointments-notify-all-btn"
              type="button"
              onClick={handleNotifyAll}
              className="font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
              style={{ color: 'var(--accent-text)' }}
            >
              <Bell className="w-3 h-3" />
              <span>Notify all upcoming ({unnotifiedUpcoming.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSchedule}
            className="font-semibold hover:underline cursor-pointer inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <span>Open schedule</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
