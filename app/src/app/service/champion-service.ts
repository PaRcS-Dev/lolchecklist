import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ChampionFileDto } from '../obj/ChampionFileDto';
import { AssetsConstants } from '../core/constants/assets.constants';

@Injectable({
  providedIn: 'root',
})
export class ChampionService {
  constructor(private HttpClient: HttpClient) {}

  getChampionFile(): Observable<ChampionFileDto.Root> {
    return this.HttpClient.get<ChampionFileDto.Root>(AssetsConstants.DdragonChampionJsonPath);
  }

  getChampionList(): Observable<ChampionFileDto.ChampionDto[]> {
    return this.getChampionFile().pipe(
      map(file => Object.values(file.data))
    );
  }

}
