import { useState, useEffect } from 'react';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// project imports
import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';

// chart options
const areaChartOptions = {
  chart: {
    id: 'invoice-state',
    toolbar: {
      show: false
    },
    sparkline: {
      enabled: true
    },
    background: 'transparent'
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    show: false
  },
  stroke: {
    width: 1,
    curve: 'smooth'
  },
  grid: {
    show: false
  },
  yaxis: {
    show: false,
    stepSize: 50
  }
};

// ==============================|| INVOICE - CHART ||============================== //

export default function InvoiceChart({ color, data }: any) {
  const { mode } = useConfig();

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [color.main],
      tooltip: {
        x: {
          show: false
        },
        y: {
          formatter(val: number) {
            return `$${val}`;
          }
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, color]);

  const [series] = useState([
    {
      name: 'Sales',
      data: data
    }
  ]);

  return <ReactApexChart options={options} series={series} type="area" height={80} />;
}
