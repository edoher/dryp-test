import { Component, Input } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
  Highcharts: typeof Highcharts = Highcharts;

  @Input() timeseriesData: [number, number][] = [];
  @Input() downsample: boolean = false;

  constructor() {}

  chartInitialized(chart: Highcharts.Chart): void {
    const data: [number, number][] = !this.downsample
      ? this.timeseriesData
      : this.returnDownsampledData();

    chart.series[0].setData(data);
  }

  chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
    },
    title: {
      text: '',
    },
    xAxis: {
      type: 'datetime', // Use datetime type for time series
      labels: {
        enabled: false, // Disable x-axis labels
      },
    },
    yAxis: {
      title: {
        text: null, // Remove y-axis title
      },
    },
    legend: {
      enabled: false, // Disable the legend
    },
    series: [
      {
        type: 'line',
        lineWidth: 1,
      },
    ],
    plotOptions: {
      series: {
        states: {
          hover: {
            lineWidthPlus: 0, // Prevent line from growing bold on hover
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
  };

  /** Modify and extend the code where indicated. You're also allowed to add utility functions below.*/
  private returnDownsampledData(): [number, number][] {
    console.time('returnDownsampledData');
    const dataToDownsample: [number, number][] = [...this.timeseriesData];
    const plotWidth: number = 548;

    // <-- Modify start

    /** After some research I found out that "downsampling" is averaging data points
     * so that we can display the same data with less points.
     */

    // Subdivide the array in smaller chunks of dataToDownsample/plotWidth
    const chunkSize = Math.floor(dataToDownsample.length / plotWidth);

    // Helper to break down array in smaller chunks
    // Based on https://stackoverflow.com/a/61413202
    const chunker = (array: [number, number][], size: number) => {
      let result = [];

      // clone original array to not destroy it
      const arrayClone = array.slice();

      while (arrayClone.length) {
        result.push(arrayClone.splice(0, size));
      }

      return result;
    };

    const chunks = chunker(dataToDownsample, chunkSize);

    console.log('chunked', chunks);

    // Helper to get average value in set of coordinates
    const averageValue = (array: [number, number][]): [number, number] => {
      const length = array.length;

      const sum = array.reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);

      return [sum[0] / length, sum[1] / length];
    };

    const averaged = chunks.map((chunk) => averageValue(chunk));

    const downsampledData: [number, number][] = averaged;
    // --> Modify end

    console.timeEnd('returnDownsampledData');
    console.log(
      `Input ${this.timeseriesData.length}, Output ${downsampledData.length}`
    );
    return downsampledData;
  }
}
