import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './home.css';

const localizer = dayjsLocalizer(dayjs);

const HomePage = () => {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartRef3 = useRef(null); // Ref para el gráfico de burbujas
  let chart1 = null;
  let chart2 = null;
  let chart3 = null; // Objeto para el gráfico de burbujas

  const [events, setEvents] = useState([]);

  useEffect(() => {
    buildCharts();
  }, []);

  const buildCharts = () => {
    const data1 = [10, 20, 30, 40, 50];
    const data2 = [5, 15, 25, 35, 45];
    const data3 = [
      { x: 'Enero', y: 10, r: 5 },
      { x: 'Febrero', y: 20, r: 8 },
      { x: 'Marzo', y: 15, r: 10 },
      { x: 'Abril', y: 20, r: 5 },
      { x: 'Mayo', y: 50, r: 15 }
    ]; // Datos para el gráfico de burbujas

    if (chart1) {
      chart1.destroy();
    }
    if (chart2) {
      chart2.destroy();
    }
    if (chart3) {
      chart3.destroy();
    }

    chart1 = new Chart(chartRef1.current, {
      type: 'bar',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [{
          label: 'Solicitudes de Vacaciones en los Ultimos Meses ',
          data: data1,
          backgroundColor: '#7300f7',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    chart2 = new Chart(chartRef2.current, {
      type: 'pie',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [{
          label: 'Contratos Creados en los ultimos meses',
          data: data2,
          backgroundColor: ['#9660d4', '#9a4cf3', '#a361ff', '#a376ff', '#a58bff'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    chart3 = new Chart(chartRef3.current, { // Crea el gráfico de burbujas
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Contratos Ingresados en los ultimos meses',
          data: data3,
          backgroundColor: 'rgba(115, 0, 247, 0.5)', 
          borderColor: 'rgba(115, 0, 247, 1)', 
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Contratos Ingresados en los ultimos meses'
            }
          },
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Meses'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  };

  const handleSelect = ({ start, end }) => {
    const title = window.prompt('Nuevo Evento:');
    if (title) {
      const newEvent = {
        start,
        end,
        title,
      };
      setEvents([...events, newEvent]);
    }
  };

  return (
    <div className="maintenance-container">
      <div className="charts-container">
        <div className="chart-wrapper">
          <div className="white-container">
            <canvas ref={chartRef1}></canvas>
          </div>
        </div>
        <div className="chart-wrapper">
          <div className="white-container">
            <canvas ref={chartRef2}></canvas>
          </div>
        </div>
        <div className="chart-wrapper">
          <div className="white-container">
            <canvas ref={chartRef3}></canvas> {/* Agrega el gráfico de burbujas */}
          </div>
        </div>
      </div>
      <div className="white-container" style={{ width: '85%', height: 1000, position: 'relative', marginLeft: 150, marginRight:170 }}>
        <div className="calendar-container" style={{ width: '100%', height: 1000, position: 'relative' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 350, width: 1000}}
            onSelectSlot={handleSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
