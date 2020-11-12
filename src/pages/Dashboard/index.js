import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  subDays,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  isBefore,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import pt from 'date-fns/locale/pt';
import {
  MdChevronLeft,
  MdChevronRight,
  MdCancel,
  MdCheck,
} from 'react-icons/md';
import { isEqual, parseISO } from 'date-fns/esm';
import api from '~/services/api';

import { Container, Time } from './styles';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function Dashboard() {
  const [schedules, setSchedules] = useState([]);
  const [date, setDate] = useState(new Date());

  const dateFormatted = useMemo(
    () => format(date, "d 'de' MMMM", { locale: pt }),
    [date]
  );

  useEffect(() => {
    async function loadSchedule() {
      const response = await api.get('schedule', { params: { date } });

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const data = range.map(hour => {
        const checkDate = setSeconds(setMinutes(setHours(date, hour), 0), 0);
        const compareDate = utcToZonedTime(checkDate, timezone);

        return {
          time: `${hour}:00h`,
          past: isBefore(compareDate, new Date()),
          appointment: response.data.find(a =>
            isEqual(parseISO(a.date), compareDate)
          ),
        };
      });

      setSchedules(data);
    }

    loadSchedule();
  }, [date]);

  function handlePrevDay() {
    setDate(subDays(date, 1));
  }

  function handleNextDay() {
    setDate(addDays(date, 1));
  }

  async function handleConfirmation(param) {
    const data = { id: param.appointment.id, confirmed: true };
    await api.put('appointments', data);
    window.location.reload(true);
  }

  async function handleCancelation(param) {
    const data = { id: param.appointment.id, confirmed: false };
    await api.put('appointments', data);
    window.location.reload(true);
  }

  return (
    <Container>
      <header>
        <button type="button" onClick={handlePrevDay}>
          <MdChevronLeft size={36} color="#fff" />
        </button>
        <strong>{dateFormatted}</strong>
        <button type="button" onClick={handleNextDay}>
          <MdChevronRight size={36} color="#fff" />
        </button>
      </header>

      <ul>
        {schedules.map(schedule => (
          <Time
            key={schedule.time}
            past={schedule.past}
            available={!schedule.appointment}
          >
            <strong>{schedule.time}</strong>
            <span>
              {schedule.appointment
                ? schedule.appointment.user.name
                : 'Em Aberto'}
            </span>
            {schedule.appointment && !schedule.appointment.confirmed ? (
              <button
                type="button"
                onClick={() => handleConfirmation(schedule)}
              >
                <MdCheck size={20} color="#f17b9e" />
                Confirmar
              </button>
            ) : null}
            {schedule.appointment && schedule.appointment.confirmed ? (
              <button type="button" onClick={() => handleCancelation(schedule)}>
                <MdCancel size={20} color="#f17b9e" />
                Cancelar
              </button>
            ) : null}
          </Time>
        ))}
      </ul>
    </Container>
  );
}
