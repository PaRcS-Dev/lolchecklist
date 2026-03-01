import { Component, OnInit } from '@angular/core';
import { Champion } from '../../obj/Champion';
import { AssetsConstants } from '../../core/constants/assets.constants';
import { ChampionService } from '../../service/champion-service';
import { combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ChampionTab } from '../champion-tab/champion-tab';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectionFilterEnum } from '../../obj/SelectionFilterEnum';
import { SavedChampion } from '../../obj/SavedChampion';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [AsyncPipe, ChampionTab, ReactiveFormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit{
  public SelectionFilterEnum = SelectionFilterEnum;
  public champions$: Observable<Champion[]>;
  public filteredChampions$: Observable<Champion[]>;

  public searchControl = new FormControl<string>('', { nonNullable: true });
  public selectionFilterControl = new FormControl<SelectionFilterEnum>(SelectionFilterEnum.All, { nonNullable: true });

  public selectedChampions: Record<string, SavedChampion> = {};

  constructor(private championService: ChampionService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.champions$ = this.championService.getChampionList().pipe(
      map(res => res.map(c => new Champion(c.key, c.id, c.name, `${AssetsConstants.DdragonTilesPath}${c.id.toLocaleLowerCase()}_0.jpg`), shareReplay({ bufferSize: 1, refCount: true })))
    );

    const searchTerm$ = this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value),
      map(v => v.trim().toLocaleLowerCase()),
      debounceTime(150),
      distinctUntilChanged()
    );

    const selectionFilter$ = this.selectionFilterControl.valueChanges.pipe(
      startWith(this.selectionFilterControl.value)
    );

    this.filteredChampions$ = combineLatest([this.champions$, searchTerm$, selectionFilter$]).pipe(
      map(([champs, term, selectionFilter]) => {
        return this.doFilter(champs, term, selectionFilter);
      })
    );
  }

  ngOnInit(): void {
    this.activatedRoute.fragment.subscribe((Fragment: string | null) => {
      if (!Fragment) {
        this.selectedChampions = {};
        return;
      }

      const Keys: string[] = Fragment
        .split(',')
        .map((Key: string) => decodeURIComponent(Key))
        .filter((Key: string) => Key.length > 0);

      this.selectedChampions = {};

      for (const Key of Keys) {
        this.selectedChampions[Key] = {
          key: Key,
          checkedDateTime: new Date()
        }
      }
    });
  }

  public clearSearch(): void {
    this.searchControl.setValue('');
  }

  public isChampionSelected(key: string): boolean {
    return (key in this.selectedChampions) && this.selectedChampions[key].checkedDateTime != null;
  }

  public toggleChampion(key: string): void {
    if (this.isChampionSelected(key)) {
      if (this.selectedChampions[key].checkedDateTime == undefined) {
        this.selectedChampions[key].checkedDateTime = new Date();
      } else {
        delete this.selectedChampions[key];
      }
    } else {
      this.selectedChampions[key] = {
        key: key,
        checkedDateTime: new Date()
      }
    }

    this.doAfterUpdate();

    console.log(this.selectedChampions)
  }

  public checkAll(): void {
    this.champions$.pipe(take(1)).subscribe(champions => {
      champions.forEach( c => {
        this.selectedChampions[c.key] = {
          key: c.key,
          checkedDateTime: this.getCheckedDate(c.key)
        }
      })

      this.doAfterUpdate();
    });
  }

  public unCheckAll(): void {
    this.selectedChampions = {};
    this.doAfterUpdate();
  }

  public checkAllFiltered(): void {
    const searchTerm = this.searchControl.value.trim().toLocaleLowerCase();
    const selectionFilter = this.selectionFilterControl.value;
    this.champions$.pipe(take(1)).subscribe(champions => {
      
      let filtered = this.doFilter(champions, searchTerm, selectionFilter);
      filtered.forEach( c => {
        this.selectedChampions[c.key] = {
          key: c.key,
          checkedDateTime: this.getCheckedDate(c.key)
        }
      });

      this.doAfterUpdate();
    });
  }

  public unCheckAllFiltered(): void {
    const searchTerm = this.searchControl.value.trim().toLocaleLowerCase();
    const selectionFilter = this.selectionFilterControl.value;
    this.champions$.pipe(take(1)).subscribe(champions => {
      
      let filtered = this.doFilter(champions, searchTerm, selectionFilter);
      filtered.forEach( c => { delete this.selectedChampions[c.key] });

      this.doAfterUpdate();
    });
  }

  private doAfterUpdate() {
    this.updateUrlFragmentFromRecord();
    this.selectionFilterControl.setValue(this.selectionFilterControl.value);
  }

  private updateUrlFragmentFromRecord(): void {
    const Fragment: string = Object.keys(this.selectedChampions).join(',');

    void this.router.navigate([], {
      fragment: Fragment,
      replaceUrl: true,
      queryParamsHandling: 'preserve'
    });
  }

  private doFilter(champs: Champion[], term: string, selectionFilter: SelectionFilterEnum): Champion[] {
    let result = champs;

    if (term) {
      result = result.filter(c =>
        c.name.toLocaleLowerCase().includes(term) ||
        c.id.toLocaleLowerCase().includes(term)
      );
    }

    if (selectionFilter === SelectionFilterEnum.Selected) {
      result = result.filter(c => this.isChampionSelected(c.key));
    }

    if (selectionFilter === SelectionFilterEnum.NonSelected) {
      result = result.filter(c => !this.isChampionSelected(c.key));
    }

    return result;
  }

  private getCheckedDate(key: string): Date {
    let checkedDate: Date;
    if (this.isChampionSelected(key)) {
      checkedDate = this.selectedChampions[ key].checkedDateTime ?? new Date();
    } else {
      checkedDate = new Date();
    }

    return checkedDate;
  }
}
