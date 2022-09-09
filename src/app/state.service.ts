import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { first, switchMap, tap, map } from 'rxjs/operators';
import { DockStateModel, SensorSlot, Set, SetType } from './models';

@Injectable()
export class StateService {
  emptySlotColor = '#e3e3e3';
  totalRows = 4;
  totalCols = 6;
  defaultSets: Set[] = [
    {
        id: '1',
        setType: SetType.LTR,
        position: '0',
        color: '#fa0',
        is_outlined: false,
    },
    {
        id: '2',
        setType: SetType.LTR,
        position: '3',
        color: '#fa0',
        is_outlined: true,
    },
    {
        id: '3',
        setType: SetType.SINGLE,
        position: '21',
        color: '#56e8b3',
        is_outlined: false,
    }
  ];
  defaultState: DockStateModel = {
    sensorSlots: [
      ...Array.from({ length: this.totalRows }, (_, rowI) => {
        return [
          ...Array.from({ length: this.totalCols }, (_, colI) => {
            return {
              setId: 'randomid',
              occupied: false,
              position: (Number(this.totalCols) * rowI + colI).toString(),
              saved: false,
              color: '#d9d9d9',
              is_outlined: true
            } as SensorSlot;
          }),
        ];
      }),
    ],
    currentlySelectedSet: null,
    existingSets: this.defaultSets
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
    existingSets: Set[] | null,
    currentlySelectedSet: Set | null
  ): { sensorSlots: SensorSlot[][], existingSensorSlots: SensorSlot[] | null, currentlySelectedSlots: SensorSlot[] | null } {
    return {
      sensorSlots: sensorSlots,
      currentlySelectedSlots: this.setToSlotsConverter(currentlySelectedSet),
      existingSensorSlots: existingSets ? existingSets.map(this.setToSlotsConverter).flat(2) : null
    }
  }

  persistExistingSets(
    sensorSlots: SensorSlot[][], 
    existingSensorSlots: SensorSlot[] | null,
    currentlySelectedSlots: SensorSlot[] | null
  ): { sensorSlots: SensorSlot[][], currentlySelectedSlots: SensorSlot[] | null } {
    return {
      sensorSlots: sensorSlots.map(row => {
        return row.map(slot => {
          if (!existingSensorSlots) return slot;
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
    currentlySelectedSlots: SensorSlot[] | null
  ): SensorSlot[][] {
    if (!currentlySelectedSlots) return sensorSlots;
    return sensorSlots.map(row => {
      return row.map(slot => {
        if (slot.saved) return slot;
        const i = currentlySelectedSlots.findIndex(selectedSlot => selectedSlot.position === slot.position);
        if (i >= 0) {
          console.log('found dock in position'+slot.position)
          return {
            ...slot,
            occupied: true,
            saved: false,
            color: 'teal',
            is_outlined: true
          }
        } else {
          return {
            ...slot,
            occupied: false,
            saved: false,
            color: this.emptySlotColor,
            is_outlined: true
          }
        }
      })
    })
  }


  // UTILITIES


  setToSlotsConverter(set: Set | null): SensorSlot[] {
    if (!set) return [];
    if (set.setType === SetType.LTR) {
      return [...Array.from({length: 3}, (_, i) => {
        return {
          setId: set.id,
          occupied: true,
          position: (Number(set.position) + i).toString(),
          color: set.color,
          is_outlined: set.is_outlined,
          saved: true
        } as SensorSlot
      })]
    } else {
      return [{
        setId: set.id,
        occupied: true,
        position: set.position,
        color: set.color,
        is_outlined: set.is_outlined,
        saved: true
      } as SensorSlot]
    }
  }

}
