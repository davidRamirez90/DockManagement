import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { Dock, DockType, SensorSlot, SetType } from './models';
import { StateService } from './state.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public title = 'Line Chart';
  viewModel$: Observable<SensorSlot[][]>;

  SetType = SetType;

  setType = SetType.LTR;

  dock: Dock = {
    dockType: DockType.GEN_5,
    sets: [
      {
        id: '001',
        position: 0,
        setType: SetType.LTR,
        color: '##FFAA00',
        is_outlined: false,
      },
      {
        id: '002',
        position: 3,
        setType: SetType.LTR,
        color: '##FFAA00',
        is_outlined: true,
      },
    ],
  };

  dockPositions = [...Array(10).keys()];

  margin = { top: 30, right: 30, bottom: 30, left: 30 };
  width: number;
  height: number;
  svgWidth = 536;
  svgHeight = 294;

  xSensorScale;
  ySensorScale;

  constructor(private _stateService: StateService) {
    this.viewModel$ = this._stateService
      .getViewModel()
      .pipe(tap((state) => console.log(state)));

    // configure margins and width/height of the graph
    this.width = this.svgWidth - this.margin.left - this.margin.right;
    this.height = this.svgHeight - this.margin.top - this.margin.bottom;
    this.xSensorScale = d3
      .scaleBand()
      .domain([0, 1, 2, null, 3, 4, 5])
      .range([this.margin.left, this.width - this.margin.right])
      .paddingInner(0.25);

    this.ySensorScale = d3
      .scaleBand()
      .domain([...Array(4).keys()])
      .range([this.margin.top, this.height - this.margin.bottom])
      .paddingInner(0.35);
  }

  public ngOnInit(): void {}

  debug(row, rowIndex): void {
    console.log(row);
    console.log(rowIndex);
    this.viewModel$.pipe(first(), tap(console.log)).subscribe();
  }

  selectSensor(setType: SetType, sensor: SensorSlot): void {
    this._stateService
      .selectSet({
        id: 'randomid',
        setType: setType,
        color: '#fa0',
        is_outlined: false,
        position: sensor.position,
      })
      .subscribe();
  }
}
