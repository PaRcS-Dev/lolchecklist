export namespace ChampionFileDto {
    export interface Root {
        data: Record<string, ChampionDto>;
    }
    
    export interface ChampionDto {
        key: string;
        id: string;
        name: string;
    }
}
