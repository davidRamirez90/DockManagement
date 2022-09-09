import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SensorSlot, SetType } from './models';
import { StateService } from './state.service';

// TODO: Turn this component into a control form

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

  // configure margins and width/height of the graph
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
      .domain(['0', '1', '2', 'empty', '3', '4', '5'])
      .range([this.margin.left, this.width - this.margin.right])
      .paddingInner(0.25);

    this.ySensorScale = d3
      .scaleBand()
      .domain([...Array(4).keys()].map((i) => i.toString()))
      .range([this.margin.top, this.height - this.margin.bottom])
      .paddingInner(0.35);
  }

  public ngOnInit(): void {}

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
