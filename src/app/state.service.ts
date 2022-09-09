import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { first, switchMap, tap, map } from 'rxjs/operators';
import { DockStateModel, SensorSlot, Set, SetType } from './models';

@Injectable()
export class StateService {
  totalRows = 4;
  totalCols = 6;
  defaultState: DockStateModel = {
    sensorSlots: [
      ...Array.from({ length: this.totalRows }, (_, rowI) => {
        return [
          ...Array.from({ length: this.totalCols }, (_, colI) => {
            return {
              setId: null,
              occupied: false,
              position: Number(this.totalCols * rowI + colI),
            } as SensorSlot;
          }),
        ];
      }),
    ],
    currentlySelectedSet: null,
    existingSets: null
  };

  state$: BehaviorSubject<DockStateModel> = new BehaviorSubject(
    this.defaultState
  );

  public viewModel$: Observable<SensorSlot[][]> = combineLatest([
    this.state$.asObservable().pipe(map(state => state.sensorSlots)),
    this.state$.asObservable().pipe(map(state => state.existingSets)),
    this.state$.asObservable().pipe(map(state => state.currentlySelectedSet))
  ]).pipe(
    map(([sensorSlots, existingSets, currentlySelectedSet]) => this.mapSelectedSetsToSensorSlots(sensorSlots, existingSets, currentlySelectedSet)),
    map(({sensorSlots, existingSensorSlots, currentlySelectedSlots}) => this.persistExistingSets(sensorSlots, existingSensorSlots, currentlySelectedSlots)),
    map(({sensorSlots, currentlySelectedSlots}) => this.selectCurrentSlot(sensorSlots, currentlySelectedSlots))
  )

  constructor() {}

  public getViewModel(): Observable<SensorSlot[][]> {
    return this.viewModel$;
  }

  public selectSet(set: Set): Observable<Set> {
    return this.state$.pipe(
      first(),
      tap((state) => {
        this.state$.next({
          ...state,
          currentlySelectedSet: set
        });
      }),
      switchMap((_) => of(set))
    );
  }


  mapSelectedSetsToSensorSlots(
    sensorSlots: SensorSlot[][], 
    existingSets: Set[], 
    currentlySelectedSet: Set
  ): { sensorSlots: SensorSlot[][], existingSensorSlots: SensorSlot[], currentlySelectedSlots: SensorSlot[] } {
    return {
      sensorSlots: sensorSlots,
      currentlySelectedSlots: this.setToSlotsConverter(currentlySelectedSet),
      existingSensorSlots: existingSets.map(this.setToSlotsConverter).flat(2)
    }
  }

  persistExistingSets(
    sensorSlots: SensorSlot[][], 
    existingSensorSlots: SensorSlot[], 
    currentlySelectedSlots: SensorSlot[]
  ): { sensorSlots: SensorSlot[][], currentlySelectedSlots: SensorSlot[] } {
    return {
      sensorSlots: sensorSlots.map(row => {
        return row = row.map(slot => {
          // Returns -1 if not found
          const i = existingSensorSlots.findIndex(existingSlot => existingSlot.position === slot.position)
          if (i >= 0) {
            return existingSensorSlots[i]
          } else {
            return slot
          }
        })
      }),
      currentlySelectedSlots: currentlySelectedSlots
    }
  }

  selectCurrentSlot(
    sensorSlots: SensorSlot[][],
    currentlySelectedSlots: SensorSlot[]
  ): SensorSlot[][] {
    return sensorSlots.map(row => {
      return row.map(slot => {
        if (currentlySelectedSlots.map(slot => slot.position).includes(slot.position)) {
          return {
            ...slot,
            occupied: true,
            current: true
          }
        } else {
          return {
            ...slot,
            occupied: false,
            current: false
          }
        }
      })
    })
  }


  // UTILITIES


  setToSlotsConverter(set: Set): SensorSlot[] {
    if (set.setType === SetType.LTR) {
      return [...Array.from({length: 3}, (_, i) => {
        return {
          setId: set.id,
          occupied: true,
          position: Number(set.position + i)
        } as SensorSlot
      })]
    } else {
      return [{
        setId: set.id,
        occupied: true,
        position: set.position
      } as SensorSlot]
    }
  }

}
