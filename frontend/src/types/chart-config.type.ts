export type ChartConfigType = {
  type: 'pie';
  data: {
    labels: string[],
    datasets: {
      data: number[],
      label: string,
      borderWidth: number,
      backgroundColor: string[],
    }[],
  },
  options: {
    devicePixelRatio: number,
    plugins: {
      legend: {
        labels: {
          font: {
            weight: string,
          };
          color: string,
        },
      },
    },
  },
}
