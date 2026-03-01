export class Champion {
    key: string;
    id: string;
    name: string;
    imagePath: string;

    constructor(key: string, id: string, name: string, imagePath: string) {
        this.key = key;
        this.id = id;
        this.name = name;
        this.imagePath = imagePath;
    }
}